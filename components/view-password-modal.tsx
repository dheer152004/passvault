"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { deriveMasterKey, decryptPassword } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getFaviconUrl } from "@/lib/favicon"

interface Password {
  id: string
  title: string
  email: string | null
  encrypted_password: string
  website_url: string | null
  notes: string | null
  is_favorite: boolean
  category_id: string | null
  created_at: string
}

interface Category {
  id: string
  name: string
  icon: string | null
}

interface ViewPasswordModalProps {
  open: boolean
  onClose: () => void
  password: Password | null
  categories: Category[]
  onSuccess: () => void
  onEdit?: (password: Password) => void
}

export function ViewPasswordModal({ open, onClose, password, categories, onSuccess, onEdit }: ViewPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [decryptedPassword, setDecryptedPassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (open && password) {
      setShowPassword(false)
      setDecryptedPassword("")
    }
  }, [open, password])

  const handleShowPassword = async () => {
    if (!password) return

    const masterPassword = sessionStorage.getItem("mp_temp")
    if (!masterPassword) return

    try {
      const masterKey = await deriveMasterKey(masterPassword)
      const decrypted = await decryptPassword(password.encrypted_password, masterKey)
      setDecryptedPassword(decrypted)
      setShowPassword(true)
    } catch {
      alert("Failed to decrypt password")
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const handleToggleFavorite = async () => {
    if (!password) return

    const supabase = createClient()
    await supabase.from("passwords").update({ is_favorite: !password.is_favorite }).eq("id", password.id)

    onSuccess()
  }

  const handleDelete = async () => {
    if (!password) return
    if (!confirm("Are you sure you want to delete this password? This action cannot be undone.")) return

    setIsDeleting(true)
    const supabase = createClient()
    await supabase.from("passwords").delete().eq("id", password.id)
    setIsDeleting(false)
    onSuccess()
    onClose()
  }

  if (!password) return null

  const category = categories.find((c) => c.id === password.category_id)
  const faviconUrl = getFaviconUrl(password.website_url)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
              {faviconUrl ? (
                <img
                  src={faviconUrl || "/placeholder.svg"}
                  alt={`${password.title} logo`}
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              <span className={`text-2xl ${faviconUrl ? "hidden" : ""}`}>{category?.icon || "🔐"}</span>
            </div>
            <div>
              <DialogTitle>{password.title}</DialogTitle>
              <DialogDescription>{category?.name || "Uncategorized"}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {password.email && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Email</p>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-900">{password.email}</p>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(password.email!)}>
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
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">Password</p>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
              <p className="text-sm text-slate-900 font-mono">{showPassword ? decryptedPassword : "••••••••••••"}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={handleShowPassword}>
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
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Button>
                {showPassword && (
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(decryptedPassword)}>
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
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {password.website_url && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Website</p>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                <a
                  href={password.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {password.website_url}
                </a>
                <Button variant="ghost" size="sm" onClick={() => window.open(password.website_url!, "_blank")}>
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {password.notes && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Notes</p>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{password.notes}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t dark:border-slate-700">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(password!)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 mr-1"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
                {password.is_favorite ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4 mr-1 text-red-500"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                    Remove from favorites
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-1"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    Add to favorites
                  </>
                )}
              </Button>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
