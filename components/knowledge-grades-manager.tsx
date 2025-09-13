"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Save, Search, Eye } from "lucide-react"
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

interface Student {
  id: string
  name: string
  student_number: string
}

interface KnowledgeGrade {
  id: string
  student_id: string
  uh1?: number
  uh2?: number
  uh3?: number
  uts?: number
  uas?: number
  average?: number
  predicate?: string
  students: {
    name: string
    student_number: string
  }
}

interface KnowledgeGradesManagerProps {
  subjects: Subject[]
  classes: Class[]
  teacherId: string
}

export default function KnowledgeGradesManager({ subjects, classes, teacherId }: KnowledgeGradesManagerProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [semester, setSemester] = useState<string>("1")
  const [academicYear, setAcademicYear] = useState<string>("2024/2025")
  const [students, setStudents] = useState<Student[]>([])
  const [gradesData, setGradesData] = useState<Record<string, any>>({})
  const [existingGrades, setExistingGrades] = useState<KnowledgeGrade[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // History filters
  const [historySubject, setHistorySubject] = useState<string>("")
  const [historyClass, setHistoryClass] = useState<string>("")
  const [historySemester, setHistorySemester] = useState<string>("")
  const [historyAcademicYear, setHistoryAcademicYear] = useState<string>("")
  const [gradesHistory, setGradesHistory] = useState<any[]>([])

  const { toast } = useToast()
  const supabase = createClient()

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadStudents()
    }
  }, [selectedClass])

  // Load existing grades when filters change
  useEffect(() => {
    if (selectedSubject && selectedClass && semester && academicYear) {
      loadExistingGrades()
    }
  }, [selectedSubject, selectedClass, semester, academicYear])

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, student_number")
      .eq("class_id", selectedClass)
      .order("name")

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive",
      })
      return
    }

    setStudents(data || [])
    // Initialize grades data
    const initialData: Record<string, any> = {}
    data?.forEach((student) => {
      initialData[student.id] = {
        uh1: "",
        uh2: "",
        uh3: "",
        uts: "",
        uas: "",
      }
    })
    setGradesData(initialData)
  }

  const loadExistingGrades = async () => {
    const { data, error } = await supabase
      .from("knowledge_grades")
      .select(`
        id,
        student_id,
        uh1,
        uh2,
        uh3,
        uts,
        uas,
        average,
        predicate,
        students (
          name,
          student_number
        )
      `)
      .eq("teacher_id", teacherId)
      .eq("subject_id", selectedSubject)
      .eq("class_id", selectedClass)
      .eq("semester", semester)
      .eq("academic_year", academicYear)

    if (error) {
      console.error("Error loading existing grades:", error)
      return
    }

    setExistingGrades(data || [])

    // Update grades data with existing records
    if (data && data.length > 0) {
      const updatedData = { ...gradesData }
      data.forEach((record: any) => {
        updatedData[record.student_id] = {
          uh1: record.uh1 || "",
          uh2: record.uh2 || "",
          uh3: record.uh3 || "",
          uts: record.uts || "",
          uas: record.uas || "",
        }
      })
      setGradesData(updatedData)
    }
  }

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    const numValue = value === "" ? "" : Number.parseFloat(value)
    if (value !== "" && (isNaN(numValue as number) || (numValue as number) < 0 || (numValue as number) > 100)) {
      return
    }

    setGradesData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }))
  }

  const saveGrades = async () => {
    if (!selectedSubject || !selectedClass || !semester || !academicYear) {
      toast({
        title: "Error",
        description: "Pilih mata pelajaran, kelas, semester, dan tahun ajaran terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Delete existing grades for this combination
      await supabase
        .from("knowledge_grades")
        .delete()
        .eq("teacher_id", teacherId)
        .eq("subject_id", selectedSubject)
        .eq("class_id", selectedClass)
        .eq("semester", semester)
        .eq("academic_year", academicYear)

      // Insert new grades records
      const gradesRecords = students
        .map((student) => {
          const studentGrades = gradesData[student.id]
          // Only save if at least one grade is entered
          if (
            studentGrades?.uh1 !== "" ||
            studentGrades?.uh2 !== "" ||
            studentGrades?.uh3 !== "" ||
            studentGrades?.uts !== "" ||
            studentGrades?.uas !== ""
          ) {
            return {
              student_id: student.id,
              teacher_id: teacherId,
              subject_id: selectedSubject,
              class_id: selectedClass,
              semester: Number.parseInt(semester),
              academic_year: academicYear,
              uh1: studentGrades?.uh1 !== "" ? Number.parseFloat(studentGrades.uh1) : null,
              uh2: studentGrades?.uh2 !== "" ? Number.parseFloat(studentGrades.uh2) : null,
              uh3: studentGrades?.uh3 !== "" ? Number.parseFloat(studentGrades.uh3) : null,
              uts: studentGrades?.uts !== "" ? Number.parseFloat(studentGrades.uts) : null,
              uas: studentGrades?.uas !== "" ? Number.parseFloat(studentGrades.uas) : null,
            }
          }
          return null
        })
        .filter(Boolean)

      if (gradesRecords.length > 0) {
        const { error } = await supabase.from("knowledge_grades").insert(gradesRecords)
        if (error) throw error
      }

      toast({
        title: "Berhasil",
        description: "Data nilai pengetahuan berhasil disimpan",
      })

      // Reload existing grades
      loadExistingGrades()
    } catch (error) {
      console.error("Error saving grades:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan data nilai",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadGradesHistory = async () => {
    let query = supabase
      .from("knowledge_grades")
      .select(`
        id,
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
      .order("academic_year", { ascending: false })
      .order("semester", { ascending: false })

    if (historySubject) query = query.eq("subject_id", historySubject)
    if (historyClass) query = query.eq("class_id", historyClass)
    if (historySemester) query = query.eq("semester", historySemester)
    if (historyAcademicYear) query = query.eq("academic_year", historyAcademicYear)

    const { data, error } = await query

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat riwayat nilai",
        variant: "destructive",
      })
      return
    }

    setGradesHistory(data || [])
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPredicateBadge = (predicate: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-red-100 text-red-800",
    }
    return <Badge className={colors[predicate] || "bg-gray-100 text-gray-800"}>{predicate}</Badge>
  }

  return (
    <Tabs defaultValue="input" className="space-y-6">
      <TabsList>
        <TabsTrigger value="input" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Input Nilai
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Riwayat Nilai
        </TabsTrigger>
      </TabsList>

      <TabsContent value="input" className="space-y-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Input Nilai Pengetahuan
            </CardTitle>
            <CardDescription>Input nilai UH1, UH2, UH3, UTS, dan UAS siswa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
                <Select value={selectedClass} onValueChange={setSelectedClass}>
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
                <Select value={semester} onValueChange={setSemester}>
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
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cari Siswa</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Nama atau NIS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        {selectedSubject && selectedClass && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Input Nilai Pengetahuan</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} siswa • Semester {semester} • {academicYear}
                    {existingGrades.length > 0 && (
                      <span className="ml-2 text-blue-600">(Data sudah ada, akan diperbarui)</span>
                    )}
                  </CardDescription>
                </div>
                <Button onClick={saveGrades} disabled={isLoading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Menyimpan..." : "Simpan Nilai"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="text-center">UH1</TableHead>
                      <TableHead className="text-center">UH2</TableHead>
                      <TableHead className="text-center">UH3</TableHead>
                      <TableHead className="text-center">UTS</TableHead>
                      <TableHead className="text-center">UAS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{student.student_number}</code>
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={gradesData[student.id]?.uh1 || ""}
                            onChange={(e) => handleGradeChange(student.id, "uh1", e.target.value)}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={gradesData[student.id]?.uh2 || ""}
                            onChange={(e) => handleGradeChange(student.id, "uh2", e.target.value)}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={gradesData[student.id]?.uh3 || ""}
                            onChange={(e) => handleGradeChange(student.id, "uh3", e.target.value)}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={gradesData[student.id]?.uts || ""}
                            onChange={(e) => handleGradeChange(student.id, "uts", e.target.value)}
                            className="w-20 text-center"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={gradesData[student.id]?.uas || ""}
                            onChange={(e) => handleGradeChange(student.id, "uas", e.target.value)}
                            className="w-20 text-center"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        {/* History Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Riwayat Nilai</CardTitle>
            <CardDescription>Filter data nilai berdasarkan kriteria tertentu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <Select value={historySubject} onValueChange={setHistorySubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua mata pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua mata pelajaran</SelectItem>
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
                <Select value={historyClass} onValueChange={setHistoryClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua kelas</SelectItem>
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
                <Select value={historySemester} onValueChange={setHistorySemester}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua semester</SelectItem>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tahun Ajaran</Label>
                <Select value={historyAcademicYear} onValueChange={setHistoryAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua tahun</SelectItem>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={loadGradesHistory} className="w-full">
                  Tampilkan Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        {gradesHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Nilai Pengetahuan</CardTitle>
              <CardDescription>{gradesHistory.length} record ditemukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Siswa</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Mata Pelajaran</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Tahun Ajaran</TableHead>
                      <TableHead className="text-center">UH1</TableHead>
                      <TableHead className="text-center">UH2</TableHead>
                      <TableHead className="text-center">UH3</TableHead>
                      <TableHead className="text-center">UTS</TableHead>
                      <TableHead className="text-center">UAS</TableHead>
                      <TableHead className="text-center">Rata-rata</TableHead>
                      <TableHead className="text-center">Predikat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradesHistory.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.students.name}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {record.students.student_number}
                          </code>
                        </TableCell>
                        <TableCell>{record.subjects.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.classes.name}</Badge>
                        </TableCell>
                        <TableCell>{record.semester}</TableCell>
                        <TableCell>{record.academic_year}</TableCell>
                        <TableCell className="text-center">{record.uh1 || "-"}</TableCell>
                        <TableCell className="text-center">{record.uh2 || "-"}</TableCell>
                        <TableCell className="text-center">{record.uh3 || "-"}</TableCell>
                        <TableCell className="text-center">{record.uts || "-"}</TableCell>
                        <TableCell className="text-center">{record.uas || "-"}</TableCell>
                        <TableCell className="text-center font-medium">
                          {record.average ? record.average.toFixed(2) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {record.predicate ? getPredicateBadge(record.predicate) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
