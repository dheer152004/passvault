"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { deriveMasterKey, encryptPassword } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordGenerator } from "@/components/password-generator"

interface Category {
  id: string
  name: string
  icon: string | null
}

interface AddPasswordModalProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  onSuccess: () => void
}

export function AddPasswordModal({ open, onClose, categories, onSuccess }: AddPasswordModalProps) {
  const [title, setTitle] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const masterPassword = sessionStorage.getItem("mp_temp")
      if (!masterPassword) {
        throw new Error("Session expired. Please unlock your vault.")
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      // Encrypt password
      const masterKey = await deriveMasterKey(masterPassword)
      const encryptedPassword = await encryptPassword(password, masterKey)

      // Save to database
      const { error: insertError } = await supabase.from("passwords").insert({
        user_id: user.id,
        title,
        username: username || null,
        email: email || null,
        encrypted_password: encryptedPassword,
        website_url: websiteUrl || null,
        notes: notes || null,
        category_id: categoryId || null,
        is_favorite: false,
      })

      if (insertError) throw insertError

      // Reset form
      setTitle("")
      setUsername("")
      setEmail("")
      setPassword("")
      setWebsiteUrl("")
      setNotes("")
      setCategoryId("")

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
          <DialogTitle>Add Password</DialogTitle>
          <DialogDescription>Save a new password to your secure vault</DialogDescription>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {showGenerator && (
            <div className="border rounded-lg p-4 bg-slate-50">
              <PasswordGenerator onUsePassword={(pwd) => setPassword(pwd)} />
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

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
