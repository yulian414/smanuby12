import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayout from "@/components/dashboard-layout"
import ReportsManager from "@/components/reports-manager"

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get teacher's subjects
  const { data: teacherSubjects } = await supabase
    .from("teacher_subjects")
    .select(`
      subjects (
        id,
        name
      )
    `)
    .eq("teacher_id", data.user.id)

  const subjects = teacherSubjects?.map((ts: any) => ts.subjects) || []

  // Get all classes
  const { data: classes } = await supabase.from("classes").select("id, name, grade_level").order("name")

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Export</h1>
          <p className="text-gray-600">Export data absensi dan nilai ke format Excel</p>
        </div>

        <ReportsManager subjects={subjects} classes={classes || []} teacherId={data.user.id} />
      </div>
    </DashboardLayout>
  )
}
