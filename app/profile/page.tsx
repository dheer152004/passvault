"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2 } from "lucide-react"

interface UserProfile {
  full_name: string | null
  email: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: null,
    email: null,
  })
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()

      if (profileError) {
        setError("Failed to load profile")
      } else {
        setProfile({
          full_name: profileData?.full_name || null,
          email: profileData?.email || user.email || null,
        })
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not found")

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Profile updated successfully!")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsChangingPassword(true)
    setError(null)
    setSuccess(null)

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long")
      }

      const { error: changeError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (changeError) throw changeError

      setSuccess("Password changed successfully!")
      setPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
        <Link href="/vault" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          PassVault
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" onClick={handleLogout} className="text-sm">
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile Settings</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account information</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-600 dark:text-green-400">
              {success}
            </div>
          )}

          {/* Profile Information Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={profile.email || ""}
                    disabled
                    className="cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email cannot be changed from this page</p>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isChangingPassword} className="flex-1">
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                        setError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
