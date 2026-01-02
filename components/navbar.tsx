"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
            <img src="/PASSVAULT_blue.png" alt="PassVault" className="h-10 w-auto" />
            <span className="text-xl font-bold text-blue-500">PassVault</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <nav className="flex gap-1">
            <Link href="/service" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              Service
            </Link>
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              Pricing
            </Link>
            <Link href="/faq" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              FAQ
            </Link>
            <Link href="/contact" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              Contact
            </Link>
            <Link href="/terms" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              T&C
            </Link>
            <Link href="/privacy" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              Privacy
            </Link>
          </nav>
          <div className="flex gap-2">
            <Link href="/auth/login" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              Sign in
            </Link>
            <Link href="/auth/sign-up" className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Get started
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800">
          <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            <Link
              href="/service"
              className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Service
            </Link>
            <Link
              href="/pricing"
              className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/terms"
              className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Privacy Policy
            </Link>
            <hr className="my-2 border-slate-200 dark:border-slate-800" />
            <Link
              href="/auth/login"
              className="block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="block px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
