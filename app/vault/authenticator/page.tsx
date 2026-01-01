"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { encryptData, decryptData } from "@/lib/crypto"
import { generateTOTP, getRemainingSeconds, parseOTPAuthURI } from "@/lib/totp"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface Authenticator {
  id: string
  name: string
  issuer: string | null
  secret: string
  account: string | null
  is_favorite: boolean
  created_at: string
}

export default function AuthenticatorPage() {
  const router = useRouter()
  const [authenticators, setAuthenticators] = useState<Authenticator[]>([])
  const [codes, setCodes] = useState<Record<string, string>>({})
  const [remainingSeconds, setRemainingSeconds] = useState(30)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Add authenticator form
  const [newName, setNewName] = useState("")
  const [newIssuer, setNewIssuer] = useState("")
  const [newSecret, setNewSecret] = useState("")
  const [newAccount, setNewAccount] = useState("")

  useEffect(() => {
    checkAuth()
    fetchAuthenticators()
  }, [])

  // Update codes and countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCodes()
      setRemainingSeconds(getRemainingSeconds())
    }, 1000)

    return () => clearInterval(interval)
  }, [authenticators])

  useEffect(() => {
    return () => {
      stopQRScanner()
    }
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
    }
  }

  const fetchAuthenticators = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("authenticators")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setAuthenticators(data || [])
    } catch (error) {
      console.error("Error fetching authenticators:", error)
    }
  }

  const updateCodes = async () => {
    const masterPassword = sessionStorage.getItem("mp_temp")
    if (!masterPassword) return

    const newCodes: Record<string, string> = {}

    for (const auth of authenticators) {
      try {
        const decryptedSecret = await decryptData(auth.secret, masterPassword)
        const code = await generateTOTP(decryptedSecret)
        newCodes[auth.id] = code
      } catch (error) {
        console.error(`Error generating code for ${auth.name}:`, error)
        newCodes[auth.id] = "------"
      }
    }

    setCodes(newCodes)
  }

  const handleAddAuthenticator = async () => {
    try {
      const masterPassword = sessionStorage.getItem("mp_temp")
      if (!masterPassword) {
        router.push("/vault/unlock")
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Check if input is an otpauth:// URI
      let secret = newSecret
      let issuer = newIssuer
      let account = newAccount

      if (newSecret.startsWith("otpauth://")) {
        const parsed = parseOTPAuthURI(newSecret)
        if (parsed) {
          secret = parsed.secret
          issuer = parsed.issuer || issuer
          account = parsed.account || account
        }
      }

      // Clean secret (remove spaces and make uppercase)
      secret = secret.replace(/\s/g, "").toUpperCase()

      // Encrypt secret
      const encryptedSecret = await encryptData(secret, masterPassword)

      const { error } = await supabase.from("authenticators").insert({
        user_id: user.id,
        name: newName,
        issuer: issuer || null,
        secret: encryptedSecret,
        account: account || null,
      })

      if (error) throw error

      // Reset form
      setNewName("")
      setNewIssuer("")
      setNewSecret("")
      setNewAccount("")
      setIsAddModalOpen(false)

      // Refresh list
      fetchAuthenticators()
    } catch (error) {
      console.error("Error adding authenticator:", error)
      alert("Failed to add authenticator. Please check your inputs.")
    }
  }

  const handleDeleteAuthenticator = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("authenticators").delete().eq("id", id)

      if (error) throw error

      fetchAuthenticators()
    } catch (error) {
      console.error("Error deleting authenticator:", error)
    }
  }

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("authenticators").update({ is_favorite: !isFavorite }).eq("id", id)

      if (error) throw error

      fetchAuthenticators()
    } catch (error) {
      console.error("Error updating favorite:", error)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        scanQRCode()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access camera. Please check permissions.")
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context || video.videoWidth === 0) {
      requestAnimationFrame(scanQRCode)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Simple QR detection (using jsQR library would be better in production)
    // For now, we'll use a file input as fallback
    requestAnimationFrame(scanQRCode)
  }

  const stopQRScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const handleQRFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const img = new Image()
      img.onload = () => {
        if (!canvasRef.current) return
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)

        // In production, use jsQR library to decode
        // For now, we'll prompt user to enter the URI
        const uri = prompt("Enter the otpauth:// URI from the QR code:")
        if (uri && uri.startsWith("otpauth://")) {
          const parsed = parseOTPAuthURI(uri)
          if (parsed) {
            setNewName(parsed.issuer || parsed.account || "")
            setNewIssuer(parsed.issuer || "")
            setNewAccount(parsed.account || "")
            setNewSecret(uri)
            setIsQRScannerOpen(false)
            setIsAddModalOpen(true)
          }
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const exportAsQRCode = async (auth: Authenticator) => {
    const masterPassword = sessionStorage.getItem("mp_temp")
    if (!masterPassword) return

    try {
      const decryptedSecret = await decryptData(auth.secret, masterPassword)
      const otpauth = `otpauth://totp/${encodeURIComponent(auth.issuer || auth.name)}:${encodeURIComponent(auth.account || auth.name)}?secret=${decryptedSecret}&issuer=${encodeURIComponent(auth.issuer || auth.name)}`

      // Generate QR code using an API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(otpauth)}`

      // Open QR code in new window for user to save
      const qrWindow = window.open("", "_blank")
      if (qrWindow) {
        qrWindow.document.write(`
          <html>
            <head><title>Export ${auth.name} - QR Code</title></head>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: #f8fafc;">
              <h2 style="margin-bottom: 20px;">${auth.name}</h2>
              <img src="${qrUrl}" alt="QR Code" style="border: 10px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px;" />
              <p style="margin-top: 20px; color: #64748b;">Scan this QR code with your authenticator app</p>
              <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">Print QR Code</button>
            </body>
          </html>
        `)
      }
    } catch (error) {
      console.error("Error exporting QR code:", error)
      alert("Failed to export QR code")
    }
  }

  const filteredAuthenticators = authenticators.filter(
    (auth) =>
      auth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auth.issuer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      auth.account?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const favoriteAuthenticators = filteredAuthenticators.filter((a) => a.is_favorite)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/vault">
              <Button variant="ghost" size="sm">
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
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Authenticator</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Time-based verification codes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Dialog
              open={isQRScannerOpen}
              onOpenChange={(open) => {
                setIsQRScannerOpen(open)
                if (open) {
                  setTimeout(startQRScanner, 100)
                } else {
                  stopQRScanner()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M7 7h.01" />
                    <path d="M7 17h.01" />
                    <path d="M17 7h.01" />
                    <path d="M17 17h.01" />
                  </svg>
                  Scan QR Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scan QR Code</DialogTitle>
                  <DialogDescription>Upload a QR code image to import an authenticator</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <video ref={videoRef} className="hidden" />
                    <canvas ref={canvasRef} className="hidden" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-12 w-12 mx-auto mb-4 text-slate-400"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <path d="M7 7h.01" />
                      <path d="M7 17h.01" />
                      <path d="M17 7h.01" />
                      <path d="M17 17h.01" />
                    </svg>
                    <p className="text-sm text-slate-500 mb-4">Upload a QR code image</p>
                    <Input type="file" accept="image/*" onChange={handleQRFileUpload} className="max-w-xs mx-auto" />
                  </div>
                  <p className="text-xs text-slate-400 text-center">Supported formats: PNG, JPG, JPEG</p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>
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
                  Add Authenticator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Authenticator</DialogTitle>
                  <DialogDescription>Enter your authenticator details or paste an otpauth:// URI</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., GitHub, Gmail"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secret">Secret Key / OTPAuth URI *</Label>
                    <Input
                      id="secret"
                      placeholder="JBSWY3DPEHPK3PXP or otpauth://totp/..."
                      value={newSecret}
                      onChange={(e) => setNewSecret(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="issuer">Issuer (optional)</Label>
                    <Input
                      id="issuer"
                      placeholder="e.g., GitHub"
                      value={newIssuer}
                      onChange={(e) => setNewIssuer(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="account">Account (optional)</Label>
                    <Input
                      id="account"
                      placeholder="e.g., user@example.com"
                      value={newAccount}
                      onChange={(e) => setNewAccount(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddAuthenticator} disabled={!newName || !newSecret} className="w-full">
                    Add Authenticator
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="flex justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Search */}
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search authenticators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Timer */}
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12">
                    <svg className="transform -rotate-90 w-12 h-12">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-slate-200"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - remainingSeconds / 30)}`}
                        className="text-blue-500 transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{remainingSeconds}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Code expires in</p>
                    <p className="text-xs text-slate-500">{remainingSeconds} seconds</p>
                  </div>
                </div>
                <Badge variant="outline">
                  {filteredAuthenticators.length} authenticator{filteredAuthenticators.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Favorites */}
          {favoriteAuthenticators.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                Favorites
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteAuthenticators.map((auth) => (
                  <Card key={auth.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{auth.name}</h3>
                          {auth.issuer && <p className="text-sm text-slate-500">{auth.issuer}</p>}
                          {auth.account && <p className="text-xs text-slate-400">{auth.account}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportAsQRCode(auth)}
                            title="Export as QR code"
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
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <path d="M7 7h.01" />
                              <path d="M7 17h.01" />
                              <path d="M17 7h.01" />
                              <path d="M17 17h.01" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(auth.id, auth.is_favorite)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={auth.is_favorite ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-4 w-4 ${auth.is_favorite ? "text-red-500" : ""}`}
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAuthenticator(auth.id)}>
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
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-mono text-3xl font-bold tracking-wider">
                            {codes[auth.id] || "------"}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCode(codes[auth.id] || "")}
                          disabled={!codes[auth.id]}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Authenticators */}
          <div>
            <h2 className="text-lg font-semibold mb-3">All Authenticators</h2>
            {filteredAuthenticators.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 mx-auto mb-4 text-slate-400"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">No authenticators yet</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Add your first authenticator to generate verification codes
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>Add Authenticator</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredAuthenticators.map((auth) => (
                  <Card key={auth.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{auth.name}</h3>
                          {auth.issuer && <p className="text-sm text-slate-500">{auth.issuer}</p>}
                          {auth.account && <p className="text-xs text-slate-400">{auth.account}</p>}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportAsQRCode(auth)}
                            title="Export as QR code"
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
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <path d="M7 7h.01" />
                              <path d="M7 17h.01" />
                              <path d="M17 7h.01" />
                              <path d="M17 17h.01" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(auth.id, auth.is_favorite)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={auth.is_favorite ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-4 w-4 ${auth.is_favorite ? "text-red-500" : ""}`}
                            >
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAuthenticator(auth.id)}>
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
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-mono text-3xl font-bold tracking-wider">
                            {codes[auth.id] || "------"}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCode(codes[auth.id] || "")}
                          disabled={!codes[auth.id]}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
