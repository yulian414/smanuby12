"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function RegisterSuccessPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setIsLoggedIn(true)
        // Auto redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memproses...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">Pendaftaran Berhasil!</CardTitle>
            <CardDescription className="text-gray-600">
              {isLoggedIn ? "Anda sudah masuk ke sistem" : "Akun Anda telah berhasil dibuat"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {isLoggedIn ? (
              <>
                <p className="text-sm text-gray-600">
                  Selamat datang! Anda akan diarahkan ke dashboard dalam beberapa detik...
                </p>
                <Button asChild className="w-full">
                  <Link href="/dashboard">Masuk ke Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Anda dapat langsung masuk ke sistem tanpa perlu verifikasi email.
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Masuk ke Sistem</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
