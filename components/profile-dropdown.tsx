import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { LogOut, Settings, User } from "lucide-react"

interface UserInfo {
  email: string | undefined
  full_name: string | null
  username: string | null
}

export function ProfileDropdown() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setIsLoading(false)
        return
      }

      // Fetch profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, username, email")
        .eq("id", authUser.id)
        .single()

      setUser({
        email: profileData?.email || authUser.email,
        full_name: profileData?.full_name || null,
        username: profileData?.username || null,
      })

      setIsLoading(false)
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (isLoading || !user) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700" />
      </Button>
    )
  }

  const displayName = user.full_name || user.username || user.email || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-600 text-white font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.full_name || user.username || "User"}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
