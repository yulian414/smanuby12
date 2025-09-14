"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Users, ClipboardCheck, GraduationCap, FileText, Menu, X, LogOut, User } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
    }
  }
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Data Siswa", href: "/dashboard/students", icon: Users },
  { name: "Absensi", href: "/dashboard/attendance", icon: ClipboardCheck },
  { name: "Nilai Pengetahuan", href: "/dashboard/knowledge-grades", icon: GraduationCap },
  { name: "Nilai Praktek", href: "/dashboard/practice-grades", icon: GraduationCap },
  { name: "Laporan", href: "/dashboard/reports", icon: FileText },
]

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Guru"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed top-10 right-10 w-20 h-20 rounded-full border border-primary/20 pointer-events-none">
        <div className="absolute inset-2 rounded-full border border-primary/15 pulse-ring"></div>
        <div className="absolute inset-4 rounded-full bg-primary/5 pulse-dot"></div>
      </div>
      <div className="fixed bottom-20 left-10 w-16 h-16 rounded-full border border-accent/20 pointer-events-none">
        <div className="absolute inset-2 rounded-full border border-accent/15 pulse-ring"></div>
        <div className="absolute inset-3 rounded-full bg-accent/5 pulse-dot"></div>
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col crystal-glass border-r border-border">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PulseOne System
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-foreground hover:bg-card"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-3 text-sm font-medium text-foreground rounded-lg crystal-glass hover:bg-card/30 transition-all duration-200 group"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 text-primary group-hover:text-accent transition-colors" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow crystal-glass border-r border-border">
          <div className="flex h-16 items-center px-4 border-b border-border">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PulseOne System
            </h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-3 text-sm font-medium text-foreground rounded-lg crystal-glass hover:bg-card/30 transition-all duration-200 group"
              >
                <item.icon className="mr-3 h-5 w-5 text-primary group-hover:text-accent transition-colors" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border crystal-glass px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-foreground hover:bg-card"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full crystal-glass hover:bg-card/30">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-primary/20 to-accent/20 text-foreground font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 crystal-glass border-border" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-foreground">{userName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild className="hover:bg-card/30">
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4 text-primary" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-destructive/20 text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="py-6 relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
