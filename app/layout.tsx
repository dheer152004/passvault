import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PassVault",
  description: "Made By Dheeraj Kumar",
  generator: "",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />

          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Product</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li><Link href="/service" className="hover:text-slate-900 dark:hover:text-slate-100">Service</Link></li>
                    <li><Link href="/pricing" className="hover:text-slate-900 dark:hover:text-slate-100">Pricing</Link></li>
                    <li><Link href="/faq" className="hover:text-slate-900 dark:hover:text-slate-100">FAQ</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Company</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li><Link href="/contact" className="hover:text-slate-900 dark:hover:text-slate-100">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Legal</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <li><Link href="/terms" className="hover:text-slate-900 dark:hover:text-slate-100">Terms & Conditions</Link></li>
                    <li><Link href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-100">Privacy Policy</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  © 2026 PassVault. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
