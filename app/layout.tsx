import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import { FloatingGIAChat } from "@/components/floating-gia-chat"
import { UserPreferencesProvider } from "@/lib/user-preferences"

const _spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GoodRunss - Where the World Plays",
  description: "Recreational sports platform connecting players, instructors, and facilities",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_spaceGrotesk.className}`}>
        <UserPreferencesProvider>
          {children}
          <FloatingGIAChat />
        </UserPreferencesProvider>
      </body>
    </html>
  )
}
