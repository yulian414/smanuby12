"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Users } from "lucide-react"

interface Student {
  id: string
  name: string
  student_number: string
  created_at: string
  classes: {
    id: string
    name: string
    grade_level: number
  }
}

interface Class {
  id: string
  name: string
  grade_level: number
}

interface StudentsTableProps {
  students: Student[]
  classes: Class[]
}

export default function StudentsTable({ students, classes }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [selectedGrade, setSelectedGrade] = useState<string>("all")

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_number.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesClass = selectedClass === "all" || student.classes.id === selectedClass

      const matchesGrade = selectedGrade === "all" || student.classes.grade_level.toString() === selectedGrade

      return matchesSearch && matchesClass && matchesGrade
    })
  }, [students, searchTerm, selectedClass, selectedGrade])

  const gradeOptions = [10, 11, 12]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Daftar Siswa
        </CardTitle>
        <CardDescription>Total {students.length} siswa terdaftar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="search">Cari Siswa</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="search"
                placeholder="Nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tingkat</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkat</SelectItem>
                {gradeOptions.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Kelas {grade}
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
                <SelectItem value="all">Semua Kelas</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hasil</Label>
            <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
              <span className="text-sm text-muted-foreground">{filteredStudents.length} siswa</span>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>NIS</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Tingkat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{student.student_number}</code>
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.classes.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Kelas {student.classes.grade_level}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm || selectedClass !== "all" || selectedGrade !== "all"
                      ? "Tidak ada siswa yang sesuai dengan filter"
                      : "Belum ada data siswa"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary by Class */}
        {filteredStudents.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Kelas X</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredStudents.filter((s) => s.classes.grade_level === 10).length}
                </div>
                <p className="text-xs text-muted-foreground">siswa</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Kelas XI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredStudents.filter((s) => s.classes.grade_level === 11).length}
                </div>
                <p className="text-xs text-muted-foreground">siswa</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Kelas XII</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredStudents.filter((s) => s.classes.grade_level === 12).length}
                </div>
                <p className="text-xs text-muted-foreground">siswa</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
