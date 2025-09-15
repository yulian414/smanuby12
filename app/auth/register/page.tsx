"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Subject {
  id: string
  name: string
}

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("subjects").select("id, name").order("name")

      if (error) {
        console.error("Error fetching subjects:", error)
      } else {
        setSubjects(data || [])
      }
    }

    fetchSubjects()
  }, [])

  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId])
    } else {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    if (selectedSubjects.length === 0) {
      setError("Pilih minimal satu mata pelajaran")
      setIsLoading(false)
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            name: name,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const { error: teacherError } = await supabase.from("teachers").upsert({
          id: authData.user.id,
          name: name,
          email: email,
        })

        if (teacherError) {
          console.error("Error creating teacher profile:", teacherError)
          throw new Error("Gagal membuat profil guru")
        }

        const teacherSubjects = selectedSubjects.map((subjectId) => ({
          teacher_id: authData.user.id,
          subject_id: subjectId,
        }))

        const { error: subjectError } = await supabase.from("teacher_subjects").insert(teacherSubjects)

        if (subjectError) {
          console.error("Error inserting teacher subjects:", subjectError)
          throw new Error("Gagal menyimpan mata pelajaran")
        }

        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          console.error("Auto login error:", loginError)
          // Don't throw error, just redirect to success page
        }
      }

      router.push("/auth/register-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Daftar Guru</CardTitle>
            <CardDescription className="text-gray-600">
              Buat akun baru untuk sistem absensi dan penilaian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="guru@sekolah.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Mata Pelajaran yang Diampu</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSubjectChange(subject.id, checked as boolean)}
                      />
                      <Label htmlFor={subject.id} className="text-sm font-normal cursor-pointer">
                        {subject.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Mendaftar..." : "Daftar"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Masuk di sini
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
