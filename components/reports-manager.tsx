"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, GraduationCap, ClipboardCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Subject {
  id: string
  name: string
}

interface Class {
  id: string
  name: string
  grade_level: number
}

interface ReportsManagerProps {
  subjects: Subject[]
  classes: Class[]
  teacherId: string
}

export default function ReportsManager({ subjects, classes, teacherId }: ReportsManagerProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Attendance report filters
  const [attendanceSubject, setAttendanceSubject] = useState<string>("")
  const [attendanceClass, setAttendanceClass] = useState<string>("")
  const [attendanceDateFrom, setAttendanceDateFrom] = useState<string>("")
  const [attendanceDateTo, setAttendanceDateTo] = useState<string>("")

  // Knowledge grades report filters
  const [knowledgeSubject, setKnowledgeSubject] = useState<string>("")
  const [knowledgeClass, setKnowledgeClass] = useState<string>("")
  const [knowledgeSemester, setKnowledgeSemester] = useState<string>("1")
  const [knowledgeAcademicYear, setKnowledgeAcademicYear] = useState<string>("2024/2025")

  // Practice grades report filters
  const [practiceSubject, setPracticeSubject] = useState<string>("")
  const [practiceClass, setPracticeClass] = useState<string>("")
  const [practiceSemester, setPracticeSemester] = useState<string>("1")
  const [practiceAcademicYear, setPracticeAcademicYear] = useState<string>("2024/2025")

  const { toast } = useToast()
  const supabase = createClient()

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    if (data.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive",
      })
      return
    }

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Berhasil",
      description: `File ${filename}.csv berhasil diunduh`,
    })
  }

  const exportAttendanceReport = async () => {
    if (!attendanceSubject || !attendanceClass) {
      toast({
        title: "Error",
        description: "Pilih mata pelajaran dan kelas terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      let query = supabase
        .from("attendance")
        .select(`
          date,
          status,
          notes,
          students (
            name,
            student_number
          ),
          subjects (
            name
          ),
          classes (
            name
          )
        `)
        .eq("teacher_id", teacherId)
        .eq("subject_id", attendanceSubject)
        .eq("class_id", attendanceClass)
        .order("date", { ascending: false })

      if (attendanceDateFrom) query = query.gte("date", attendanceDateFrom)
      if (attendanceDateTo) query = query.lte("date", attendanceDateTo)

      const { data, error } = await query

      if (error) throw error

      // Transform data for CSV
      const csvData = data?.map((record: any) => ({
        Tanggal: new Date(record.date).toLocaleDateString("id-ID"),
        NIS: record.students.student_number,
        "Nama Siswa": record.students.name,
        "Mata Pelajaran": record.subjects.name,
        Kelas: record.classes.name,
        Status: record.status,
        Keterangan: record.notes || "",
      }))

      const headers = ["Tanggal", "NIS", "Nama Siswa", "Mata Pelajaran", "Kelas", "Status", "Keterangan"]
      const filename = `Laporan_Absensi_${new Date().toISOString().split("T")[0]}`

      exportToCSV(csvData || [], filename, headers)
    } catch (error) {
      console.error("Error exporting attendance:", error)
      toast({
        title: "Error",
        description: "Gagal mengekspor data absensi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportKnowledgeGradesReport = async () => {
    if (!knowledgeSubject || !knowledgeClass) {
      toast({
        title: "Error",
        description: "Pilih mata pelajaran dan kelas terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("knowledge_grades")
        .select(`
          uh1,
          uh2,
          uh3,
          uts,
          uas,
          average,
          predicate,
          semester,
          academic_year,
          students (
            name,
            student_number
          ),
          subjects (
            name
          ),
          classes (
            name
          )
        `)
        .eq("teacher_id", teacherId)
        .eq("subject_id", knowledgeSubject)
        .eq("class_id", knowledgeClass)
        .eq("semester", knowledgeSemester)
        .eq("academic_year", knowledgeAcademicYear)
        .order("students(name)")

      if (error) throw error

      // Transform data for CSV
      const csvData = data?.map((record: any) => ({
        NIS: record.students.student_number,
        "Nama Siswa": record.students.name,
        "Mata Pelajaran": record.subjects.name,
        Kelas: record.classes.name,
        Semester: record.semester,
        "Tahun Ajaran": record.academic_year,
        UH1: record.uh1 || "",
        UH2: record.uh2 || "",
        UH3: record.uh3 || "",
        UTS: record.uts || "",
        UAS: record.uas || "",
        "Rata-rata": record.average ? record.average.toFixed(2) : "",
        Predikat: record.predicate || "",
      }))

      const headers = [
        "NIS",
        "Nama Siswa",
        "Mata Pelajaran",
        "Kelas",
        "Semester",
        "Tahun Ajaran",
        "UH1",
        "UH2",
        "UH3",
        "UTS",
        "UAS",
        "Rata-rata",
        "Predikat",
      ]
      const filename = `Laporan_Nilai_Pengetahuan_${new Date().toISOString().split("T")[0]}`

      exportToCSV(csvData || [], filename, headers)
    } catch (error) {
      console.error("Error exporting knowledge grades:", error)
      toast({
        title: "Error",
        description: "Gagal mengekspor data nilai pengetahuan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportPracticeGradesReport = async () => {
    if (!practiceSubject || !practiceClass) {
      toast({
        title: "Error",
        description: "Pilih mata pelajaran dan kelas terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("practice_grades")
        .select(`
          practice1,
          practice2,
          average,
          predicate,
          semester,
          academic_year,
          students (
            name,
            student_number
          ),
          subjects (
            name
          ),
          classes (
            name
          )
        `)
        .eq("teacher_id", teacherId)
        .eq("subject_id", practiceSubject)
        .eq("class_id", practiceClass)
        .eq("semester", practiceSemester)
        .eq("academic_year", practiceAcademicYear)
        .order("students(name)")

      if (error) throw error

      // Transform data for CSV
      const csvData = data?.map((record: any) => ({
        NIS: record.students.student_number,
        "Nama Siswa": record.students.name,
        "Mata Pelajaran": record.subjects.name,
        Kelas: record.classes.name,
        Semester: record.semester,
        "Tahun Ajaran": record.academic_year,
        "Praktek 1": record.practice1 || "",
        "Praktek 2": record.practice2 || "",
        "Rata-rata": record.average ? record.average.toFixed(2) : "",
        Predikat: record.predicate || "",
      }))

      const headers = [
        "NIS",
        "Nama Siswa",
        "Mata Pelajaran",
        "Kelas",
        "Semester",
        "Tahun Ajaran",
        "Praktek 1",
        "Praktek 2",
        "Rata-rata",
        "Predikat",
      ]
      const filename = `Laporan_Nilai_Praktek_${new Date().toISOString().split("T")[0]}`

      exportToCSV(csvData || [], filename, headers)
    } catch (error) {
      console.error("Error exporting practice grades:", error)
      toast({
        title: "Error",
        description: "Gagal mengekspor data nilai praktek",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laporan Absensi</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CSV</div>
            <p className="text-xs text-muted-foreground">Export data kehadiran siswa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Pengetahuan</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CSV</div>
            <p className="text-xs text-muted-foreground">Export nilai UH, UTS, UAS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Praktek</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CSV</div>
            <p className="text-xs text-muted-foreground">Export nilai praktek siswa</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Laporan Absensi
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Nilai Pengetahuan
          </TabsTrigger>
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Nilai Praktek
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Laporan Absensi
              </CardTitle>
              <CardDescription>Export data absensi siswa ke format CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select value={attendanceSubject} onValueChange={setAttendanceSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select value={attendanceClass} onValueChange={setAttendanceClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dari Tanggal</Label>
                  <Input
                    type="date"
                    value={attendanceDateFrom}
                    onChange={(e) => setAttendanceDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sampai Tanggal</Label>
                  <Input type="date" value={attendanceDateTo} onChange={(e) => setAttendanceDateTo(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={exportAttendanceReport} disabled={isLoading} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {isLoading ? "Mengekspor..." : "Export CSV"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Nilai Pengetahuan
              </CardTitle>
              <CardDescription>Export data nilai pengetahuan siswa ke format CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select value={knowledgeSubject} onValueChange={setKnowledgeSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select value={knowledgeClass} onValueChange={setKnowledgeClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={knowledgeSemester} onValueChange={setKnowledgeSemester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tahun Ajaran</Label>
                  <Select value={knowledgeAcademicYear} onValueChange={setKnowledgeAcademicYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2025/2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={exportKnowledgeGradesReport} disabled={isLoading} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {isLoading ? "Mengekspor..." : "Export CSV"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Nilai Praktek
              </CardTitle>
              <CardDescription>Export data nilai praktek siswa ke format CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Mata Pelajaran</Label>
                  <Select value={practiceSubject} onValueChange={setPracticeSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Select value={practiceClass} onValueChange={setPracticeClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select value={practiceSemester} onValueChange={setPracticeSemester}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tahun Ajaran</Label>
                  <Select value={practiceAcademicYear} onValueChange={setPracticeAcademicYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024/2025">2024/2025</SelectItem>
                      <SelectItem value="2025/2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={exportPracticeGradesReport} disabled={isLoading} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {isLoading ? "Mengekspor..." : "Export CSV"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
