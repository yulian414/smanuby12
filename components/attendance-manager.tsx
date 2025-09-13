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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, ClipboardCheck, Search, Save, Eye } from "lucide-react"
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

interface AttendanceRecord {
  id: string
  student_id: string
  status: string
  notes?: string
  students: {
    name: string
    student_number: string
  }
}

interface AttendanceManagerProps {
  subjects: Subject[]
  classes: Class[]
  teacherId: string
}

const attendanceStatuses = [
  { value: "hadir", label: "Hadir", color: "bg-green-100 text-green-800" },
  { value: "tidak_hadir", label: "Tidak Hadir", color: "bg-red-100 text-red-800" },
  { value: "izin", label: "Izin", color: "bg-yellow-100 text-yellow-800" },
  { value: "sakit", label: "Sakit", color: "bg-blue-100 text-blue-800" },
]

export default function AttendanceManager({ subjects, classes, teacherId }: AttendanceManagerProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; notes: string }>>({})
  const [existingAttendance, setExistingAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // History filters
  const [historySubject, setHistorySubject] = useState<string>("")
  const [historyClass, setHistoryClass] = useState<string>("")
  const [historyDateFrom, setHistoryDateFrom] = useState<string>("")
  const [historyDateTo, setHistoryDateTo] = useState<string>("")
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])

  const { toast } = useToast()
  const supabase = createClient()

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadStudents()
    }
  }, [selectedClass])

  // Load existing attendance when date, subject, or class changes
  useEffect(() => {
    if (selectedDate && selectedSubject && selectedClass) {
      loadExistingAttendance()
    }
  }, [selectedDate, selectedSubject, selectedClass])

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
    // Initialize attendance data
    const initialData: Record<string, { status: string; notes: string }> = {}
    data?.forEach((student) => {
      initialData[student.id] = { status: "hadir", notes: "" }
    })
    setAttendanceData(initialData)
  }

  const loadExistingAttendance = async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id,
        student_id,
        status,
        notes,
        students (
          name,
          student_number
        )
      `)
      .eq("teacher_id", teacherId)
      .eq("subject_id", selectedSubject)
      .eq("class_id", selectedClass)
      .eq("date", selectedDate)

    if (error) {
      console.error("Error loading existing attendance:", error)
      return
    }

    setExistingAttendance(data || [])

    // Update attendance data with existing records
    if (data && data.length > 0) {
      const updatedData = { ...attendanceData }
      data.forEach((record: any) => {
        updatedData[record.student_id] = {
          status: record.status,
          notes: record.notes || "",
        }
      })
      setAttendanceData(updatedData)
    }
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }))
  }

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }))
  }

  const saveAttendance = async () => {
    if (!selectedSubject || !selectedClass || !selectedDate) {
      toast({
        title: "Error",
        description: "Pilih mata pelajaran, kelas, dan tanggal terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Delete existing attendance for this date/subject/class
      await supabase
        .from("attendance")
        .delete()
        .eq("teacher_id", teacherId)
        .eq("subject_id", selectedSubject)
        .eq("class_id", selectedClass)
        .eq("date", selectedDate)

      // Insert new attendance records
      const attendanceRecords = students.map((student) => ({
        student_id: student.id,
        teacher_id: teacherId,
        subject_id: selectedSubject,
        class_id: selectedClass,
        date: selectedDate,
        status: attendanceData[student.id]?.status || "hadir",
        notes: attendanceData[student.id]?.notes || null,
      }))

      const { error } = await supabase.from("attendance").insert(attendanceRecords)

      if (error) throw error

      toast({
        title: "Berhasil",
        description: "Data absensi berhasil disimpan",
      })

      // Reload existing attendance
      loadExistingAttendance()
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan data absensi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAttendanceHistory = async () => {
    let query = supabase
      .from("attendance")
      .select(`
        id,
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
      .order("date", { ascending: false })

    if (historySubject) query = query.eq("subject_id", historySubject)
    if (historyClass) query = query.eq("class_id", historyClass)
    if (historyDateFrom) query = query.gte("date", historyDateFrom)
    if (historyDateTo) query = query.lte("date", historyDateTo)

    const { data, error } = await query

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat riwayat absensi",
        variant: "destructive",
      })
      return
    }

    setAttendanceHistory(data || [])
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = attendanceStatuses.find((s) => s.value === status)
    return statusConfig ? <Badge className={statusConfig.color}>{statusConfig.label}</Badge> : <Badge>{status}</Badge>
  }

  return (
    <Tabs defaultValue="input" className="space-y-6">
      <TabsList>
        <TabsTrigger value="input" className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Input Absensi
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Riwayat Absensi
        </TabsTrigger>
      </TabsList>

      <TabsContent value="input" className="space-y-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Input Absensi Siswa
            </CardTitle>
            <CardDescription>Pilih mata pelajaran, kelas, dan tanggal untuk input absensi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                <Label>Tanggal</Label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
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

        {/* Attendance Table */}
        {selectedSubject && selectedClass && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daftar Absensi</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} siswa • {selectedDate}
                    {existingAttendance.length > 0 && (
                      <span className="ml-2 text-blue-600">(Data sudah ada, akan diperbarui)</span>
                    )}
                  </CardDescription>
                </div>
                <Button onClick={saveAttendance} disabled={isLoading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Menyimpan..." : "Simpan Absensi"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Keterangan</TableHead>
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
                          <Select
                            value={attendanceData[student.id]?.status || "hadir"}
                            onValueChange={(value) => handleStatusChange(student.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {attendanceStatuses.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Keterangan (opsional)"
                            value={attendanceData[student.id]?.notes || ""}
                            onChange={(e) => handleNotesChange(student.id, e.target.value)}
                            className="min-h-[60px] resize-none"
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
            <CardTitle>Filter Riwayat Absensi</CardTitle>
            <CardDescription>Filter data absensi berdasarkan kriteria tertentu</CardDescription>
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
                <Label>Dari Tanggal</Label>
                <Input type="date" value={historyDateFrom} onChange={(e) => setHistoryDateFrom(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Sampai Tanggal</Label>
                <Input type="date" value={historyDateTo} onChange={(e) => setHistoryDateTo(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button onClick={loadAttendanceHistory} className="w-full">
                  Tampilkan Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        {attendanceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Absensi</CardTitle>
              <CardDescription>{attendanceHistory.length} record ditemukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Siswa</TableHead>
                      <TableHead>NIS</TableHead>
                      <TableHead>Mata Pelajaran</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString("id-ID")}</TableCell>
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
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
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
