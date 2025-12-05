import * as Calendar from "expo-calendar"
import { Platform, Alert } from "react-native"

export interface CalendarEvent {
    title: string
    startDate: Date
    endDate: Date
    location?: string
    notes?: string
    alarms?: number[] // Minutes before event
}

export class CalendarService {
    private static instance: CalendarService

    static getInstance(): CalendarService {
        if (!CalendarService.instance) {
            CalendarService.instance = new CalendarService()
        }
        return CalendarService.instance
    }

    /**
     * Request calendar permissions
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync()

            if (status !== "granted") {
                Alert.alert(
                    "Calendar Permission Required",
                    "Please enable calendar access to add bookings to your calendar."
                )
                return false
            }

            return true
        } catch (error) {
            console.error("[CalendarService] Error requesting permissions:", error)
            return false
        }
    }

    /**
     * Get or create the GoodRunss calendar
     */
    async getOrCreateCalendar(): Promise<string | null> {
        try {
            const hasPermission = await this.requestPermissions()
            if (!hasPermission) return null

            // Get all calendars
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)

            // Find GoodRunss calendar
            let goodRunssCalendar = calendars.find((cal) => cal.title === "GoodRunss")

            if (goodRunssCalendar) {
                return goodRunssCalendar.id
            }

            // Create GoodRunss calendar if it doesn't exist
            const defaultCalendar = calendars.find(
                (cal) => cal.allowsModifications && cal.source.name === "Default"
            )

            if (!defaultCalendar) {
                console.warn("[CalendarService] No default calendar found")
                return null
            }

            const newCalendarId = await Calendar.createCalendarAsync({
                title: "GoodRunss",
                color: "#7ED957",
                entityType: Calendar.EntityTypes.EVENT,
                sourceId: defaultCalendar.source.id,
                source: defaultCalendar.source,
                name: "GoodRunss",
                ownerAccount: defaultCalendar.ownerAccount,
                accessLevel: Calendar.CalendarAccessLevel.OWNER,
            })

            console.log("[CalendarService] Created GoodRunss calendar:", newCalendarId)
            return newCalendarId
        } catch (error) {
            console.error("[CalendarService] Error getting/creating calendar:", error)
            return null
        }
    }

    /**
     * Add event to calendar
     */
    async addEvent(event: CalendarEvent): Promise<boolean> {
        try {
            const calendarId = await this.getOrCreateCalendar()
            if (!calendarId) {
                console.warn("[CalendarService] No calendar available")
                return false
            }

            const eventId = await Calendar.createEventAsync(calendarId, {
                title: event.title,
                startDate: event.startDate,
                endDate: event.endDate,
                location: event.location,
                notes: event.notes,
                alarms: event.alarms?.map((minutes) => ({
                    relativeOffset: -minutes,
                    method: Calendar.AlarmMethod.ALERT,
                })) || [
                        {
                            relativeOffset: -15, // 15 minutes before
                            method: Calendar.AlarmMethod.ALERT,
                        },
                    ],
                timeZone: "America/New_York", // Adjust based on user's timezone
            })

            console.log("[CalendarService] Event added to calendar:", eventId)
            return true
        } catch (error) {
            console.error("[CalendarService] Error adding event:", error)
            Alert.alert("Error", "Failed to add event to calendar. Please try again.")
            return false
        }
    }

    /**
     * Add trainer booking to calendar
     */
    async addTrainerBooking(booking: {
        trainerName: string
        date: string
        time: string
        duration?: number
        location?: string
        notes?: string
    }): Promise<boolean> {
        try {
            // Parse date and time
            const [datePart] = booking.date.split(" at ")
            const dateTimeString = `${datePart} ${booking.time}`
            const startDate = new Date(dateTimeString)

            // Calculate end date
            const duration = booking.duration || 60 // Default 60 minutes
            const endDate = new Date(startDate.getTime() + duration * 60000)

            // Create event
            const event: CalendarEvent = {
                title: `Training Session with ${booking.trainerName}`,
                startDate,
                endDate,
                location: booking.location || "TBD",
                notes: booking.notes
                    ? `Training session notes:\n${booking.notes}`
                    : `Training session with ${booking.trainerName}`,
                alarms: [15, 60], // 15 minutes and 1 hour before
            }

            const success = await this.addEvent(event)

            if (success) {
                Alert.alert(
                    "Added to Calendar",
                    "Your training session has been added to your calendar."
                )
            }

            return success
        } catch (error) {
            console.error("[CalendarService] Error adding trainer booking:", error)
            return false
        }
    }

    /**
     * Generate .ics file content for sharing
     */
    generateICSFile(event: CalendarEvent): string {
        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        }

        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GoodRunss//Mobile App//EN
BEGIN:VEVENT
UID:${Date.now()}@goodrunss.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.notes || ""}
LOCATION:${event.location || ""}
STATUS:CONFIRMED
SEQUENCE:0
${event.alarms
                ? event.alarms
                    .map(
                        (minutes) => `BEGIN:VALARM
TRIGGER:-PT${minutes}M
DESCRIPTION:Reminder
ACTION:DISPLAY
END:VALARM`
                    )
                    .join("\n")
                : ""
            }
END:VEVENT
END:VCALENDAR`
    }
}
