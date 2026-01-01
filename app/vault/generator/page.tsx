"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { PasswordGenerator } from "@/components/password-generator"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function GeneratorPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()

      const masterPassword = sessionStorage.getItem("mp_temp")
      if (!masterPassword) {
        router.push("/vault/unlock")
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/PASSVAULT_blue.png" alt="PassVault" className="h-10 w-auto" />
            <span className="text-xl font-bold text-slate-900">PassVault</span>
          </div>
          <Button variant="outline" onClick={() => router.push("/vault")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Vault
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Password Generator</h1>
            <p className="text-slate-600">Create strong, secure passwords for your accounts</p>
          </div>

          <PasswordGenerator />
        </div>
      </div>
    </div>
  )
}
