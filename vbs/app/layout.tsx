import type { Metadata } from "next"
import { Fraunces, Figtree } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const display = Fraunces({ subsets: ["latin"], variable: "--font-display" })
const body = Figtree({ subsets: ["latin"], variable: "--font-body" })
export const metadata: Metadata = { title: "VisionBoard Studio", description: "Custom vision boards, designed for you." }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}<Toaster richColors /></body>
    </html>
  )
}
