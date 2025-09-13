import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayout from "@/components/dashboard-layout"
import PracticeGradesManager from "@/components/practice-grades-manager"

export default async function PracticeGradesPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Nilai Praktek</h1>
          <p className="text-gray-600">Input dan kelola nilai praktek 1 dan praktek 2</p>
        </div>

        <PracticeGradesManager subjects={subjects} classes={classes || []} teacherId={data.user.id} />
      </div>
    </DashboardLayout>
  )
}
