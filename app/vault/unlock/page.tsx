"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { verifyMasterPassword } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function UnlockVaultPage() {
  const [masterPassword, setMasterPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!profile) {
        router.push("/auth/setup-master-password")
      } else {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        throw new Error("Profile not found")
      }

      // Verify master password
      const isValid = await verifyMasterPassword(
        masterPassword,
        profile.master_password_salt,
        profile.master_password_hash,
      )

      if (!isValid) {
        setAttempts((prev) => prev + 1)
        throw new Error("Incorrect master password")
      }

      // Store master password in session for decryption
      sessionStorage.setItem("mp_temp", masterPassword)

      router.push("/vault")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isChecking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Unlock Vault</h1>
            <p className="text-sm text-slate-600">Enter your master password to access your passwords</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Master Password</CardTitle>
              <CardDescription>Your vault is encrypted and secure</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUnlock}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="master-password">Master Password</Label>
                    <Input
                      id="master-password"
                      type="password"
                      required
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      placeholder="Enter your master password"
                      autoFocus
                    />
                  </div>

                  {attempts > 0 && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                      Failed attempts: {attempts}
                    </div>
                  )}

                  {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Unlocking..." : "Unlock vault"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
