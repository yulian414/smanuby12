import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ChangePasswordForm from "@/components/change-password-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: teacher } = await supabase.from("teachers").select("*").eq("id", data.user.id).single()

  const { data: teacherSubjects } = await supabase
    .from("teacher_subjects")
    .select(`
      subjects (
        name
      )
    `)
    .eq("teacher_id", data.user.id)

  const subjectNames = teacherSubjects?.map((ts) => ts.subjects?.name).filter(Boolean) || []

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
          <p className="text-gray-600">Kelola informasi akun Anda</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Data pribadi Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                <p className="text-gray-900">{teacher?.name || "Belum diisi"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{data.user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mata Pelajaran</label>
                <p className="text-gray-900">{subjectNames.length > 0 ? subjectNames.join(", ") : "Belum diisi"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Ganti Password</CardTitle>
              <CardDescription>Perbarui password akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
