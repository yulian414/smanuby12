import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayout from "@/components/dashboard-layout"
import StudentsTable from "@/components/students-table"

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch students with their class information
  const { data: students } = await supabase
    .from("students")
    .select(`
      id,
      name,
      student_number,
      created_at,
      classes (
        id,
        name,
        grade_level
      )
    `)
    .order("name")

  // Fetch all classes for filter
  const { data: classes } = await supabase.from("classes").select("id, name, grade_level").order("name")

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-600">Kelola data siswa dan kelas</p>
        </div>

        <StudentsTable students={students || []} classes={classes || []} />
      </div>
    </DashboardLayout>
  )
}
