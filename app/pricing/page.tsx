"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Check } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      description: "Perfect for getting started",
      features: [
        "Store up to 500 passwords",
        "Master password protection",
        "Password generator",
        "custom category",
        "Basic search functionality",
        "Web access only",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Go",
      price: "₹0",
      period: "/month",
      description: "For power users",
      features: [
        "Unlimited passwords",
        "Master password protection",
        "Advanced password generator",
        "Unlimited custom categories",
        "Secure notes storage",
        // "Website favicons display",
        "Dark mode support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Pro",
      price: "₹0",
      period: "/month",
      description: "For maximum security",
      features: [
        "Everything in Go",
        "TOTP authenticator codes",
        "QR code import/export",
        "Password breach detection",
        "Emergency access",
        "Priority customer support",
        "Advanced encryption options",
        "Backup & restore tools",
        "Security audit reports",
      ],
      cta: "Upgrade to Pro",
      highlighted: false,
    },
  ]

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/PASSVAULT_blue.png" alt="PassVault" className="h-10 w-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">PassVault</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32 w-full">
          <div className="flex flex-col items-center gap-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/50 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
              Flexible plans for everyone
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl lg:text-7xl">
              Simple,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                transparent pricing
              </span>
            </h1>
            <p className="text-pretty text-lg text-slate-600 dark:text-slate-400 md:text-xl max-w-2xl">
              Choose the perfect plan for your password management needs. Start free, upgrade anytime.
            </p>
          </div>
        </section>

        <section className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 w-full">
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`flex flex-col transition-all ${
                  plan.highlighted ? "md:scale-105 md:shadow-2xl border-blue-500 dark:border-blue-400" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    {plan.highlighted && (
                      <div className="flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/50 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-3 w-3"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">{plan.price}</span>
                    {plan.period && <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-6">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                    <Link href="/auth/sign-up">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

<footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/login" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/sign-up" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Get in Touch</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center justify-center gap-2 py-6 text-sm text-slate-600 dark:text-slate-400">
          <p>© 2026 PassVault. All rights reserved.</p>
          <div>
            <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-100 underline-offset-4">
              Back to home
            </Link>
          </div>
        </div>
        </div>
      </footer>
    </div>
  )
}
