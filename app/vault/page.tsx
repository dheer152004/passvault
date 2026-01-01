"use client"

import { createClient } from "@/lib/supabase/client"
import { decryptPassword, deriveMasterKey } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddPasswordModal } from "@/components/add-password-modal"
import { ViewPasswordModal } from "@/components/view-password-modal"
import { EditPasswordModal } from "@/components/edit-password-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { getFaviconUrl } from "@/lib/favicon"

interface Password {
  id: string
  title: string
  username: string | null
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
  color: string | null
}

export default function VaultPage() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null)
  const [editingPassword, setEditingPassword] = useState<Password | null>(null)
  const router = useRouter()

  const loadData = async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Load categories
    const { data: categoriesData } = await supabase.from("categories").select("*").eq("user_id", user.id)

    if (categoriesData) {
      setCategories(categoriesData)
    }

    // Load passwords
    const { data: passwordsData } = await supabase
      .from("passwords")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (passwordsData) {
      setPasswords(passwordsData)
    }
  }

  useEffect(() => {
    async function initData() {
      const supabase = createClient()

      // Check if master password is in session
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

      await loadData()
      setIsLoading(false)
    }

    initData()
  }, [router])

  const handleLock = () => {
    sessionStorage.removeItem("mp_temp")
    router.push("/vault/unlock")
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const decryptAndCopy = async (encryptedPassword: string) => {
    const masterPassword = sessionStorage.getItem("mp_temp")
    if (!masterPassword) return

    try {
      const masterKey = await deriveMasterKey(masterPassword)
      const decrypted = await decryptPassword(encryptedPassword, masterKey)
      await copyToClipboard(decrypted)
    } catch {
      alert("Failed to decrypt password")
    }
  }

  const handleViewPassword = (password: Password) => {
    setSelectedPassword(password)
  }

  const filteredPasswords = passwords.filter((password) => {
    const matchesSearch =
      password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || password.category_id === selectedCategory
    const matchesFavorites = !showFavoritesOnly || password.is_favorite

    return matchesSearch && matchesCategory && matchesFavorites
  })

  const favoritePasswords = filteredPasswords.filter((p) => p.is_favorite)

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-slate-600 dark:text-slate-100">Loading vault...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/PASSVAULT_blue.png" alt="PassVault" className="h-10 w-auto" />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">PassVault</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search passwords..."
                className="w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/vault/generator">
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
                  <rect width="14" height="8" x="5" y="2" rx="2" ry="2" />
                  <rect width="20" height="8" x="2" y="14" rx="2" />
                  <path d="M6 18h2" />
                  <path d="M12 18h6" />
                </svg>
                Generator
              </Link>
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add Password
            </Button>
            <Button variant="outline" onClick={handleLock}>
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Button>
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex w-full">
        {/* Sidebar - Fixed on left */}
        <aside className="hidden lg:block w-72 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={!selectedCategory && !showFavoritesOnly ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedCategory(null)
                  setShowFavoritesOnly(false)
                }}
              >
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
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                All Items
                <Badge variant="secondary" className="ml-auto">
                  {passwords.length}
                </Badge>
              </Button>
              <Button
                variant={showFavoritesOnly ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly)
                  setSelectedCategory(null)
                }}
              >
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
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0116.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                Favorites
                <Badge variant="secondary" className="ml-auto">
                  {favoritePasswords.length}
                </Badge>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/vault/notes">
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
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Secure Notes
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/vault/authenticator">
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
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Authenticator
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 mb-2">No categories yet</p>
                  <p className="text-xs text-slate-400">Create categories in Secure Notes</p>
                </div>
              ) : (
                categories.map((category) => {
                  const count = passwords.filter((p) => p.category_id === category.id).length
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setShowFavoritesOnly(false)
                      }}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {count}
                      </Badge>
                    </Button>
                  )
                })
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content - Centered */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedCategory(null)
                  setShowFavoritesOnly(false)
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-100">Total Passwords</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{passwords.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-blue-600 dark:text-blue-100"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-100">Categories</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{categories.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-cyan-600 dark:text-cyan-100"
                      >
                        <path d="M3 7V5c0-1.1.9-2 2-2h2" />
                        <path d="M17 3h2c1.1 0 2 .9 2 2v2" />
                        <path d="M21 17v2c0 1.1-.9 2-2 2h-2" />
                        <path d="M7 21H5c-1.1 0-2-.9-2-2v-2" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setShowFavoritesOnly(true)
                  setSelectedCategory(null)
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-100">Favorites</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {favoritePasswords.length}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-green-600 dark:text-green-100"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Password List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {showFavoritesOnly
                    ? "Favorite Passwords"
                    : selectedCategory
                      ? categories.find((c) => c.id === selectedCategory)?.name
                      : searchQuery
                        ? "Search Results"
                        : "All Passwords"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPasswords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-10 w-10 text-slate-400 dark:text-slate-100"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No passwords yet</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-100 mb-4">
                      Add your first password to get started
                    </p>
                    <Button onClick={() => setShowAddModal(true)}>Add Password</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPasswords.map((password) => {
                      const category = categories.find((c) => c.id === password.category_id)
                      const faviconUrl = getFaviconUrl(password.website_url)

                      return (
                        <button
                          key={password.id}
                          onClick={() => handleViewPassword(password)}
                          className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left transition hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                              {faviconUrl ? (
                                <img
                                  src={faviconUrl || "/placeholder.svg"}
                                  alt={`${password.title} logo`}
                                  className="h-8 w-8 object-contain"
                                  onError={(e) => {
                                    // Fallback to category icon if favicon fails to load
                                    e.currentTarget.style.display = "none"
                                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                                  }}
                                />
                              ) : null}
                              <span className={`text-xl ${faviconUrl ? "hidden" : ""}`}>{category?.icon || "🔐"}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{password.title}</h3>
                                {password.is_favorite && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-4 w-4 text-red-500 dark:text-red-100"
                                  >
                                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-100">
                                {password.username || password.email || "No username"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {password.website_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(password.website_url!, "_blank")
                                }}
                              >
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
                                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                  <polyline points="15 3 21 3 21 9" />
                                  <line x1="10" x2="21" y1="14" y2="3" />
                                </svg>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                decryptAndCopy(password.encrypted_password)
                              }}
                            >
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
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AddPasswordModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        onSuccess={loadData}
      />
      <ViewPasswordModal
        open={!!selectedPassword}
        onClose={() => setSelectedPassword(null)}
        password={selectedPassword}
        categories={categories}
        onSuccess={loadData}
        onEdit={(password) => {
          setSelectedPassword(null)
          setEditingPassword(password)
        }}
      />
      <EditPasswordModal
        open={!!editingPassword}
        onClose={() => setEditingPassword(null)}
        password={editingPassword}
        categories={categories}
        onSuccess={loadData}
      />
    </div>
  )
}
