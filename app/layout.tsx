import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import MobileDock from "@/components/mobile-dock"
import ScrollToTop from "@/components/scroll-to-top"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mcroberts Scholars",
  description: "Empowering students with scholarship opportunities",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-grow">{children}</main>
          <MobileDock />
          <ScrollToTop />
          <Footer />
        </div>
      </body>
    </html>
  )
}
