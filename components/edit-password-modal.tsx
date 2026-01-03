"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { deriveMasterKey, encryptPassword, decryptPassword } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordGenerator } from "@/components/password-generator"

interface Password {
  id: string
  title: string
  email: string | null
  encrypted_password: string
  website_url: string | null
  notes: string | null
  is_favorite: boolean
  category_id: string | null
}

interface Category {
  id: string
  name: string
  icon: string | null
}

interface EditPasswordModalProps {
  open: boolean
  onClose: () => void
  password: Password | null
  categories: Category[]
  onSuccess: () => void
}

export function EditPasswordModal({ open, onClose, password, categories, onSuccess }: EditPasswordModalProps) {
  const [title, setTitle] = useState("")
  const [email, setEmail] = useState("")
  const [passwordValue, setPasswordValue] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [decryptedPassword, setDecryptedPassword] = useState("")

  useEffect(() => {
    if (open && password) {
      setTitle(password.title)
      setEmail(password.email || "")
      setWebsiteUrl(password.website_url || "")
      setNotes(password.notes || "")
      setCategoryId(password.category_id || "")
      setPasswordValue("")
      setDecryptedPassword("")
      setError(null)
      setShowGenerator(false)

      // Decrypt password to show current value
      decryptCurrentPassword()
    }
  }, [open, password])

  const decryptCurrentPassword = async () => {
    if (!password) return

    const masterPassword = sessionStorage.getItem("mp_temp")
    if (!masterPassword) return

    try {
      const masterKey = await deriveMasterKey(masterPassword)
      const decrypted = await decryptPassword(password.encrypted_password, masterKey)
      setDecryptedPassword(decrypted)
      setPasswordValue(decrypted)
    } catch {
      console.error("Failed to decrypt password")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const masterPassword = sessionStorage.getItem("mp_temp")
      if (!masterPassword) {
        throw new Error("Session expired. Please unlock your vault.")
      }

      if (!password) {
        throw new Error("No password selected")
      }

      const supabase = createClient()

      // Encrypt password if changed
      let encryptedPassword = password.encrypted_password
      if (passwordValue !== decryptedPassword) {
        const masterKey = await deriveMasterKey(masterPassword)
        encryptedPassword = await encryptPassword(passwordValue, masterKey)
      }

      // Update database
      const { error: updateError } = await supabase
        .from("passwords")
        .update({
          title,
          email: email || null,
          encrypted_password: encryptedPassword,
          website_url: websiteUrl || null,
          notes: notes || null,
          category_id: categoryId || null,
        })
        .eq("id", password.id)

      if (updateError) throw updateError

      onSuccess()
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Password</DialogTitle>
          <DialogDescription>Update your saved password details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., GitHub, Gmail"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-blue-600"
              >
                {showGenerator ? "Hide" : "Generate"} Password
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              required
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </div>

          {showGenerator && (
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              <PasswordGenerator onUsePassword={(pwd) => setPasswordValue(pwd)} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
