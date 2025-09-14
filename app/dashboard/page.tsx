import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardCheck, GraduationCap, FileText } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const [teacherSubjectsResult, totalStudentsResult, todayAttendanceResult] = await Promise.all([
    supabase
      .from("teacher_subjects")
      .select(`
        subjects (
          id,
          name
        )
      `)
      .eq("teacher_id", data.user.id),
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", data.user.id)
      .eq("date", new Date().toISOString().split("T")[0]),
  ])

  const subjects = teacherSubjectsResult.data?.map((ts: any) => ts.subjects) || []

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold crystal-text">Dashboard</h1>
          <p className="crystal-text/70">Selamat datang di sistem absensi dan penilaian siswa</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="crystal-glass border-crystal-accent/20 hover:bg-card/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium crystal-text">Total Siswa</CardTitle>
              <Users className="h-4 w-4 crystal-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold crystal-text">{totalStudentsResult.count || 0}</div>
              <p className="text-xs crystal-text/70">Siswa terdaftar</p>
            </CardContent>
          </Card>

          <Card className="crystal-glass border-crystal-accent/20 hover:bg-card/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium crystal-text">Absensi Hari Ini</CardTitle>
              <ClipboardCheck className="h-4 w-4 crystal-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold crystal-text">{todayAttendanceResult.count || 0}</div>
              <p className="text-xs crystal-text/70">Siswa diabsen</p>
            </CardContent>
          </Card>

          <Card className="crystal-glass border-crystal-accent/20 hover:bg-card/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium crystal-text">Mata Pelajaran</CardTitle>
              <GraduationCap className="h-4 w-4 crystal-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold crystal-text">{subjects.length}</div>
              <p className="text-xs crystal-text/70">Yang diampu</p>
            </CardContent>
          </Card>

          <Card className="crystal-glass border-crystal-accent/20 hover:bg-card/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium crystal-text">Laporan</CardTitle>
              <FileText className="h-4 w-4 crystal-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold crystal-text">-</div>
              <p className="text-xs crystal-text/70">Tersedia</p>
            </CardContent>
          </Card>
        </div>

        {/* Teacher's Subjects */}
        <Card className="crystal-glass border-crystal-accent/20">
          <CardHeader>
            <CardTitle className="crystal-text">Mata Pelajaran yang Diampu</CardTitle>
            <CardDescription className="crystal-text/70">Daftar mata pelajaran yang Anda ajarkan</CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject: any) => (
                  <div
                    key={subject.id}
                    className="flex items-center p-3 crystal-glass rounded-lg border border-crystal-accent/20"
                  >
                    <GraduationCap className="h-5 w-5 crystal-accent mr-3" />
                    <span className="font-medium crystal-text">{subject.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="crystal-text/70">Belum ada mata pelajaran yang terdaftar</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="crystal-glass border-crystal-accent/20">
          <CardHeader>
            <CardTitle className="crystal-text">Aksi Cepat</CardTitle>
            <CardDescription className="crystal-text/70">Fitur yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/dashboard/attendance"
                className="flex items-center p-4 crystal-glass rounded-lg hover:bg-card/30 transition-all duration-300 border border-green-500/20 group"
              >
                <ClipboardCheck className="h-6 w-6 text-green-400 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium crystal-text">Input Absensi</div>
                  <div className="text-sm crystal-text/70">Catat kehadiran siswa</div>
                </div>
              </Link>

              <Link
                href="/dashboard/knowledge-grades"
                className="flex items-center p-4 crystal-glass rounded-lg hover:bg-card/30 transition-all duration-300 border border-blue-500/20 group"
              >
                <GraduationCap className="h-6 w-6 crystal-accent mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium crystal-text">Nilai Pengetahuan</div>
                  <div className="text-sm crystal-text/70">Input nilai UH, UTS, UAS</div>
                </div>
              </Link>

              <Link
                href="/dashboard/practice-grades"
                className="flex items-center p-4 crystal-glass rounded-lg hover:bg-card/30 transition-all duration-300 border border-purple-500/20 group"
              >
                <GraduationCap className="h-6 w-6 text-purple-400 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium crystal-text">Nilai Praktek</div>
                  <div className="text-sm crystal-text/70">Input nilai praktek</div>
                </div>
              </Link>

              <Link
                href="/dashboard/reports"
                className="flex items-center p-4 crystal-glass rounded-lg hover:bg-card/30 transition-all duration-300 border border-orange-500/20 group"
              >
                <FileText className="h-6 w-6 text-orange-400 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium crystal-text">Laporan</div>
                  <div className="text-sm crystal-text/70">Export data Excel</div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
