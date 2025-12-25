import * as functions from "firebase-functions"
import * as admin from "firebase-admin"

/**
 * Notify league organizer when someone joins
 */
export const onLeagueMemberJoin = functions.firestore
    .document("leagues/{leagueId}/members/{memberId}")
    .onCreate(async (snap, context) => {
        try {
            const { leagueId } = context.params
            const member = snap.data()

            // Get league details
            const leagueDoc = await admin.firestore()
                .collection("leagues")
                .doc(leagueId)
                .get()

            if (!leagueDoc.exists) return

            const league = leagueDoc.data()!

            // Notify organizer
            const tokensSnapshot = await admin.firestore()
                .collection("users")
                .doc(league.organizerId)
                .collection("deviceTokens")
                .get()

            const tokens = tokensSnapshot.docs
                .map(d => d.data().token)
                .filter(Boolean)

            if (tokens.length > 0) {
                await admin.messaging().sendEachForMulticast({
                    notification: {
                        title: `🏆 New Player Joined!`,
                        body: `${member.userName} joined ${league.name}`,
                    },
                    data: {
                        type: "league_join",
                        leagueId,
                    },
                    tokens,
                })
            }

            functions.logger.info("League join notification sent", {
                leagueId,
                memberName: member.userName,
            })
        } catch (error) {
            functions.logger.error("Error on league member join:", error)
        }
    })

/**
 * Send league season reminders (1 week before start)
 * Runs daily at 9am
 */
export const sendLeagueReminders = functions.pubsub
    .schedule("0 9 * * *")
    .timeZone("America/New_York")
    .onRun(async () => {
        try {
            const oneWeekFromNow = new Date()
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
            const targetDate = oneWeekFromNow.toISOString().split("T")[0]

            // Find leagues starting in 1 week
            const leaguesQuery = admin.firestore()
                .collection("leagues")
                .where("status", "==", "forming")

            const leaguesSnapshot = await leaguesQuery.get()

            for (const leagueDoc of leaguesSnapshot.docs) {
                const league = leagueDoc.data()
                const seasonStart = league.seasonStart?.toDate?.()

                if (!seasonStart) continue

                const startDate = seasonStart.toISOString().split("T")[0]
                if (startDate !== targetDate) continue

                // Get all members
                const membersSnapshot = await leagueDoc.ref
                    .collection("members")
                    .where("status", "==", "registered")
                    .get()

                for (const memberDoc of membersSnapshot.docs) {
                    const member = memberDoc.data()

                    const tokensSnapshot = await admin.firestore()
                        .collection("users")
                        .doc(member.userId)
                        .collection("deviceTokens")
                        .get()

                    const tokens = tokensSnapshot.docs
                        .map(d => d.data().token)
                        .filter(Boolean)

                    if (tokens.length > 0) {
                        await admin.messaging().sendEachForMulticast({
                            notification: {
                                title: `🏆 ${league.name} starts in 1 week!`,
                                body: `Get ready! Your ${league.sport} league kicks off ${startDate}`,
                            },
                            data: {
                                type: "league_reminder",
                                leagueId: leagueDoc.id,
                            },
                            tokens,
                        })
                    }
                }
            }

            functions.logger.info("League reminders sent")
        } catch (error) {
            functions.logger.error("Error sending league reminders:", error)
        }
    })

/**
 * Auto-match opponents for league matches
 * Callable function for admins/organizers
 */
export const generateLeagueMatches = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated")
    }

    const { leagueId } = data

    if (!leagueId) {
        throw new functions.https.HttpsError("invalid-argument", "leagueId required")
    }

    try {
        // Get league
        const leagueDoc = await admin.firestore()
            .collection("leagues")
            .doc(leagueId)
            .get()

        if (!leagueDoc.exists) {
            throw new functions.https.HttpsError("not-found", "League not found")
        }

        const league = leagueDoc.data()!

        // Verify caller is organizer
        if (league.organizerId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "Not the organizer")
        }

        // Get registered members
        const membersSnapshot = await leagueDoc.ref
            .collection("members")
            .where("status", "==", "registered")
            .get()

        interface LeagueMember {
            id: string
            userId: string
            userName: string
            [key: string]: any
        }

        const members = membersSnapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
        })) as LeagueMember[]

        if (members.length < 2) {
            throw new functions.https.HttpsError("failed-precondition", "Need at least 2 members")
        }

        // Shuffle members for random pairing
        const shuffled = [...members].sort(() => Math.random() - 0.5)

        // Generate round-robin matches
        const matches: any[] = []
        const matchesPerPlayer = league.matchesPerSeason || 4

        for (let round = 0; round < matchesPerPlayer; round++) {
            for (let i = 0; i < shuffled.length - 1; i += 2) {
                const player1 = shuffled[i]
                const player2 = shuffled[i + 1]

                if (!player1 || !player2) continue

                const matchDate = new Date(league.seasonStart?.toDate?.() || new Date())
                matchDate.setDate(matchDate.getDate() + (round * 7))

                matches.push({
                    leagueId,
                    round: round + 1,
                    player1Id: player1.userId,
                    player1Name: player1.userName,
                    player2Id: player2.userId,
                    player2Name: player2.userName,
                    scheduledDate: matchDate,
                    status: "scheduled",
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                })
            }

            // Rotate for next round
            shuffled.push(shuffled.shift()!)
        }

        // Save matches
        const batch = admin.firestore().batch()
        for (const match of matches) {
            const matchRef = admin.firestore()
                .collection("leagues")
                .doc(leagueId)
                .collection("matches")
                .doc()
            batch.set(matchRef, match)
        }
        await batch.commit()

        // Update league status
        await leagueDoc.ref.update({
            status: "active",
            matchesGenerated: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })

        functions.logger.info("League matches generated", {
            leagueId,
            matchCount: matches.length,
        })

        return { success: true, matchCount: matches.length }
    } catch (error: any) {
        functions.logger.error("Error generating matches:", error)
        throw new functions.https.HttpsError("internal", error.message)
    }
})
