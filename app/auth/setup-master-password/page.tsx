"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { generateSalt, hashMasterPassword } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function SetupMasterPasswordPage() {
  const [masterPassword, setMasterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
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

      // Check if profile already exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        router.push("/vault/unlock")
      } else {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (masterPassword !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (masterPassword.length < 12) {
      setError("Master password must be at least 12 characters long")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      // Generate salt and hash
      const salt = generateSalt()
      const hash = await hashMasterPassword(masterPassword, salt)

      // Get username, full_name, and email from session storage (set during signup)
      const username = sessionStorage.getItem('signup_username') || user.user_metadata?.username || null
      const fullName = sessionStorage.getItem('signup_fullName') || user.user_metadata?.full_name || null
      const userEmail = user.user_metadata?.email || user.email || null

      // Create profile with master password
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        master_password_hash: hash,
        master_password_salt: salt,
        username: username,
        full_name: fullName,
        email: userEmail,
      })

      if (profileError) throw profileError

      // Clean up session storage
      sessionStorage.removeItem('signup_username')
      sessionStorage.removeItem('signup_fullName')

      // Store master password in session storage for vault unlock
      sessionStorage.setItem("mp_temp", masterPassword)

      router.push("/vault")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Set up Master Password</h1>
            <p className="text-sm text-slate-600 max-w-sm">
              Create a strong master password to secure your vault. This password encrypts all your data.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Create Master Password</CardTitle>
              <CardDescription>
                Choose a strong password you&apos;ll remember but others can&apos;t guess
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetup}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="master-password">Master Password</Label>
                    <Input
                      id="master-password"
                      type="password"
                      required
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      placeholder="At least 12 characters"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Master Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your master password"
                    />
                  </div>

                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-medium text-sm">
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
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                      </svg>
                      Important
                    </div>
                    <p className="text-xs text-amber-800">
                      Your master password cannot be recovered if forgotten. Make sure to remember it or store it
                      securely.
                    </p>
                  </div>

                  {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Setting up vault..." : "Create vault"}
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
