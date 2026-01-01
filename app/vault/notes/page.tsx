"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { decryptData } from "@/lib/crypto"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { encryptData } from "@/lib/crypto"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"

interface Note {
  id: string
  title: string
  content: string
  category: string
  is_favorite: boolean
  created_at: string
  updated_at: string
  user_id: string
}

interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const masterPassword = sessionStorage.getItem("mp_temp")
    if (!masterPassword) {
      router.push("/vault/unlock")
      return
    }

    fetchData()
  }

  const fetchData = async () => {
    try {
      const supabase = createClient()

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false })

      if (notesError) throw notesError
      setNotes(notesData || [])

      // Fetch categories
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("name")

        if (categoriesError) throw categoriesError
        setCategories(categoriesData || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const icon = formData.get("icon") as string
    const color = formData.get("color") as string

    console.log("Adding category:", { name, icon, color })

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("Current user:", user?.id)

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name,
        icon: icon || "📁",
        color: color || "#6b7280",
      })

      if (error) {
        console.error("Category insert error:", error)
        throw error
      }

      console.log("Category added successfully")
      setShowAddCategoryModal(false)
      fetchData()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Error adding category:", error)
      alert("Failed to add category. Please try again.")
    }
  }

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string

    try {
      const masterPassword = sessionStorage.getItem("mp_temp")
      if (!masterPassword) {
        router.push("/vault/unlock")
        return
      }

      const encryptedContent = await encryptData(content, masterPassword)
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title,
        content: encryptedContent,
        category: category || "General",
      })

      if (error) throw error

      setShowAddModal(false)
      fetchData()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Error adding note:", error)
      alert("Failed to add note")
    }
  }

  const handleViewNote = async (note: Note) => {
    try {
      const masterPassword = sessionStorage.getItem("mp_temp")
      if (!masterPassword) {
        router.push("/vault/unlock")
        return
      }

      const decryptedContent = await decryptData(note.content, masterPassword)
      setSelectedNote({ ...note, content: decryptedContent })
      setShowViewModal(true)
    } catch (error) {
      console.error("Error decrypting note:", error)
      alert("Failed to decrypt note")
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("notes").delete().eq("id", noteId)

      if (error) throw error

      setShowViewModal(false)
      fetchData()
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Failed to delete note")
    }
  }

  const handleToggleFavorite = async (noteId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("notes").update({ is_favorite: !currentStatus }).eq("id", noteId)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    sessionStorage.removeItem("mp_temp")
    router.push("/")
  }

  const handleLock = () => {
    sessionStorage.removeItem("mp_temp")
    router.push("/vault/unlock")
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || note.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryCount = (categoryName: string) => {
    return notes.filter((note) => note.category === categoryName).length
  }

  const favoriteNotes = notes.filter((n) => n.is_favorite)

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-slate-600 dark:text-slate-100">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-full flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/PASSVAULT_blue.png" alt="PassVault" className="h-10 w-auto" />
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">PassVault</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search notes..."
                className="w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/vault">
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
                Passwords
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
              Add Note
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
            <Button variant="ghost" onClick={handleSignOut}>
              Sign out
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex w-full mx-auto">
        {/* Sidebar - Fixed on left for larger screens */}
        <aside className="hidden lg:block w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-4 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={!selectedCategory ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(null)}
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
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                All Notes
                <Badge variant="secondary" className="ml-auto">
                  {notes.length}
                </Badge>
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

          {/* Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddCategoryModal(true)} className="h-8 w-8 p-0">
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
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 mb-3">No categories yet</p>
                  <Button variant="default" size="sm" className="w-full" onClick={() => setShowAddCategoryModal(true)}>
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
                    Create First Category
                  </Button>
                </div>
              ) : (
                <>
                  {categories.map((category) => {
                    const count = getCategoryCount(category.name)
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.name ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.name)}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                        <Badge variant="secondary" className="ml-auto">
                          {count}
                        </Badge>
                      </Button>
                    )
                  })}
                  <Button
                    variant="outline"
                    className="w-full justify-center mt-2 bg-transparent"
                    onClick={() => setShowAddCategoryModal(true)}
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
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                    Add Category
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Main Content - Centered */}
        <main className="flex-1 flex flex-col items-center w-full px-4">
          <div className="w-full max-w-5xl py-8">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Notes</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{notes.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{categories.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-cyan-600 dark:text-cyan-400"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <path d="M4 10h16" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Favorites</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{favoriteNotes.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-pink-600 dark:text-pink-400"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Grid */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCategory ? `${selectedCategory} Notes` : searchQuery ? "Search Results" : "All Notes"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">No notes found</p>
                    <p className="text-sm text-slate-500 dark:text-slate-600 mt-1">
                      {searchQuery ? "Try a different search term" : "Create your first secure note"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredNotes.map((note) => (
                      <Card
                        key={note.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleViewNote(note)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate dark:text-slate-100">{note.title}</CardTitle>
                              <Badge variant="secondary" className="mt-2 dark:text-slate-100">
                                {note.category}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFavorite(note.id, note.is_favorite)
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={note.is_favorite ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`h-4 w-4 ${note.is_favorite ? "text-pink-500 dark:text-pink-400" : "text-slate-400 dark:text-slate-600"}`}
                              >
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                              </svg>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Add Category Modal */}
      <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input id="name" name="name" placeholder="School, Entertainment, etc." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input id="icon" name="icon" placeholder="🎓" maxLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color (hex)</Label>
              <Input id="color" name="color" type="color" defaultValue="#6b7280" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddCategoryModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Secure Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Backup Codes" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="General">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter your secure note content..."
                className="min-h-[200px]"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Note</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="dark:text-slate-100">{selectedNote?.title}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => selectedNote && handleToggleFavorite(selectedNote.id, selectedNote.is_favorite)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={selectedNote?.is_favorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 ${selectedNote?.is_favorite ? "text-pink-500 dark:text-pink-400" : "text-slate-400 dark:text-slate-600"}`}
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => selectedNote && handleDeleteNote(selectedNote.id)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-red-500 dark:text-red-400"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="dark:text-slate-100">
                {selectedNote?.category}
              </Badge>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100 font-mono">
                {selectedNote?.content}
              </pre>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Created: {selectedNote && new Date(selectedNote.created_at).toLocaleString()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
