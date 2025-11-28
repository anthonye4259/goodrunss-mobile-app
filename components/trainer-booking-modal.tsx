
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { PostBookingShareModal } from "./post-booking-share-modal"
import { useStripe } from "@stripe/stripe-react-native"
import { CalendarPicker } from "./calendar-picker"
import { TimeSlotPicker } from "./time-slot-picker"
import { NotificationService } from "@/lib/notification-service"
import { WaitlistJoinModal } from "./waitlist-join-modal"
import * as Haptics from "expo-haptics"
import { formatCurrency } from "@/lib/global-format"

type TrainerBookingModalProps = {
  visible: boolean
  onClose: () => void
  trainer: {
    name: string
    price: number
    activity: string
  }
}

export function TrainerBookingModal({ visible, onClose, trainer }: TrainerBookingModalProps) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")
  const [showShareModal, setShowShareModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [isFullyBooked, setIsFullyBooked] = useState(false) // Track if trainer is fully booked

  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const notificationService = NotificationService.getInstance()

  const availableTimes = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]

  const handleBooking = () => {
    setShowShareModal(true)
    onClose()
  }

  const resetAndClose = () => {
    setStep(1)
    setSelectedDate("")
    setSelectedTime("")
    setNotes("")
    onClose()
  }

  const handlePayment = async () => {
    try {
      setIsProcessing(true)

      const response = await fetch("YOUR_BACKEND_URL/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: (trainer.price + 5) * 100,
          currency: "usd",
          trainerId: trainer.name,
          date: selectedDate,
          time: selectedTime,
        }),
      })

      const { paymentIntent, ephemeralKey, customer } = await response.json()

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "GoodRunss",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        defaultBillingDetails: {
          name: "User Name",
        },
        appearance: {
          colors: {
            primary: "#7ED957",
            background: "#0A0A0A",
            componentBackground: "#1A1A1A",
            componentBorder: "#333",
            componentDivider: "#333",
            primaryText: "#FFFFFF",
            secondaryText: "#999",
            componentText: "#FFFFFF",
            placeholderText: "#666",
          },
        },
      })

      if (initError) {
        Alert.alert("Error", initError.message)
        setIsProcessing(false)
        return
      }

      const { error: presentError } = await presentPaymentSheet()

      if (presentError) {
        Alert.alert("Payment cancelled", presentError.message)
        setIsProcessing(false)
        return
      }

      await notificationService.sendLocalNotification({
        type: "booking_confirmed",
        title: "Booking Confirmed!",
        body: `Your session with ${trainer.name} on ${selectedDate} at ${selectedTime} is confirmed.`,
      })

      setShowShareModal(true)
      onClose()
    } catch (error) {
      Alert.alert("Error", "Payment failed. Please try again.")
      console.error("[v0] Payment error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleJoinWaitlist = (preferences: any) => {
    console.log("[v0] Joining waitlist with preferences:", preferences)
    // Call backend API to join waitlist
    Alert.alert("Success", "You've been added to the waitlist! We'll notify you when a spot opens up.")
    setShowWaitlist(false)
  }

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <LinearGradient colors={["#0A0A0A", "#141414"]} className="rounded-t-3xl max-h-[90%]">
            <ScrollView className="flex-1" contentContainerClassName="p-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-foreground font-bold text-2xl">Book Session</Text>
                <TouchableOpacity onPress={resetAndClose}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Progress */}
              <View className="flex-row items-center mb-6">
                <View className={`flex-1 h-1 rounded ${step >= 1 ? "bg-primary" : "bg-border"}`} />
                <View className={`flex-1 h-1 rounded mx-2 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
                <View className={`flex-1 h-1 rounded ${step >= 3 ? "bg-primary" : "bg-border"}`} />
              </View>

              {/* Step 1: Select Date & Time */}
              {step === 1 && (
                <View>
                  <Text className="text-foreground font-bold text-xl mb-4">Select Date & Time</Text>

                  <TouchableOpacity
                    className="bg-card border border-border rounded-xl p-4 mb-4"
                    onPress={() => setShowCalendar(true)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={20} color="#7ED957" />
                        <Text className="text-foreground ml-3">{selectedDate || "Select Date"}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-card border border-border rounded-xl p-4 mb-6"
                    onPress={() => setShowTimePicker(true)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={20} color="#7ED957" />
                        <Text className="text-foreground ml-3">{selectedTime || "Select Time"}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>

                  {/* Fully Booked State and Waitlist Option */}
                  {isFullyBooked && (
                    <View className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-4">
                      <View className="flex-row items-center mb-3">
                        <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
                        <Text className="text-foreground font-bold text-lg ml-2">Fully Booked</Text>
                      </View>
                      <Text className="text-muted-foreground mb-4">
                        {trainer.name} is currently fully booked. Join the waitlist to be notified when a spot opens up.
                      </Text>
                      <TouchableOpacity
                        className="bg-primary rounded-xl py-3"
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                          setShowWaitlist(true)
                        }}
                      >
                        <Text className="text-black text-center font-bold">Join Waitlist</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    className={`rounded-2xl py-4 ${selectedDate && selectedTime ? "bg-primary" : "bg-border"}`}
                    disabled={!selectedDate || !selectedTime || isFullyBooked}
                    onPress={() => setStep(2)}
                  >
                    <Text
                      className={`text-center font-bold ${selectedDate && selectedTime ? "text-black" : "text-muted-foreground"}`}
                    >
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2: Add Notes */}
              {step === 2 && (
                <View>
                  <Text className="text-foreground font-bold text-xl mb-4">Session Details</Text>
                  <View className="bg-card border border-border rounded-2xl p-4 mb-4">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="person" size={20} color="#7ED957" />
                      <Text className="text-foreground ml-3">{trainer.name}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="calendar" size={20} color="#7ED957" />
                      <Text className="text-foreground ml-3">
                        {selectedDate} at {selectedTime}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="cash" size={20} color="#7ED957" />
                      <Text className="text-foreground ml-3">{formatCurrency(trainer.price)}</Text>
                    </View>
                  </View>

                  <Text className="text-foreground font-bold text-lg mb-3">Additional Notes (Optional)</Text>
                  <TextInput
                    className="bg-card border border-border rounded-2xl p-4 text-foreground mb-6 min-h-[100px]"
                    placeholder="Any specific goals or requests?"
                    placeholderTextColor="#666"
                    multiline
                    value={notes}
                    onChangeText={setNotes}
                  />

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-card border border-border rounded-2xl py-4"
                      onPress={() => setStep(1)}
                    >
                      <Text className="text-foreground text-center font-bold">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-primary rounded-2xl py-4" onPress={() => setStep(3)}>
                      <Text className="text-black text-center font-bold">Continue</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <View>
                  <Text className="text-foreground font-bold text-xl mb-4">Payment</Text>
                  <View className="bg-card border border-border rounded-2xl p-4 mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-muted-foreground">Session Fee</Text>
                      <Text className="text-foreground font-bold">{formatCurrency(trainer.price)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-muted-foreground">Service Fee</Text>
                      <Text className="text-foreground font-bold">{formatCurrency(5)}</Text>
                    </View>
                    <View className="border-t border-border pt-3 flex-row justify-between items-center">
                      <Text className="text-foreground font-bold text-lg">Total</Text>
                      <Text className="text-primary font-bold text-2xl">{formatCurrency(trainer.price + 5)}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-card border border-border rounded-2xl py-4"
                      onPress={() => setStep(2)}
                      disabled={isProcessing}
                    >
                      <Text className="text-foreground text-center font-bold">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-primary rounded-2xl py-4"
                      onPress={handlePayment}
                      disabled={isProcessing}
                    >
                      <Text className="text-black text-center font-bold">
                        {isProcessing ? "Processing..." : "Pay & Confirm"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

      <CalendarPicker
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
        minDate={new Date().toISOString().split("T")[0]}
      />

      <TimeSlotPicker
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelectTime={setSelectedTime}
        selectedTime={selectedTime}
        availableSlots={availableTimes}
      />

      <PostBookingShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        bookingDetails={{
          trainerName: trainer.name,
          activity: trainer.activity,
          date: `${selectedDate} at ${selectedTime}`,
          location: "Downtown Sports Complex",
        }}
      />

      {/* Waitlist Modal */}
      <WaitlistJoinModal
        visible={showWaitlist}
        onClose={() => setShowWaitlist(false)}
        onJoin={handleJoinWaitlist}
        type="trainer"
        name={trainer.name}
      />
    </>
  )
}
