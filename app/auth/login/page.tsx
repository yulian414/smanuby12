"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-crystal-dark p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-crystal-dark via-crystal-dark/95 to-crystal-dark/90" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-crystal-accent/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-crystal-gold/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Biometric pulse elements */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full border border-primary/30">
        <div className="absolute inset-4 rounded-full border border-primary/20 pulse-ring"></div>
        <div className="absolute inset-8 rounded-full bg-primary/10 pulse-dot"></div>
      </div>
      <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full border border-accent/30">
        <div className="absolute inset-3 rounded-full border border-accent/20 pulse-ring"></div>
        <div className="absolute inset-6 rounded-full bg-accent/10 pulse-dot"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="crystal-glass border-crystal-accent/30 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold crystal-text">Login Guru</CardTitle>
            <CardDescription className="crystal-text/70">Masuk ke sistem absensi dan penilaian siswa</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="crystal-text font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="guru@sekolah.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="crystal-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="crystal-text font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="crystal-input"
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-md backdrop-blur-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full crystal-button" disabled={isLoading}>
                {isLoading ? "Masuk..." : "Masuk"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="crystal-text/70">Belum punya akun? </span>
              <Link href="/auth/register" className="crystal-accent hover:crystal-gold font-medium transition-colors">
                Daftar di sini
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
