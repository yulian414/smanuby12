import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sistem Absensi & Penilaian Siswa</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Platform digital untuk mengelola absensi dan input nilai siswa SMA dengan mudah dan efisien
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-blue-700">Sistem Absensi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-gray-600 space-y-2">
                <li>• Input absensi siswa harian</li>
                <li>• Riwayat kehadiran lengkap</li>
                <li>• Filter berdasarkan tanggal dan kelas</li>
                <li>• Status: Hadir, Tidak Hadir, Izin, Sakit</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-700">Sistem Penilaian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-gray-600 space-y-2">
                <li>• Nilai Pengetahuan (UH1, UH2, UH3, UTS, UAS)</li>
                <li>• Nilai Praktek (Praktek 1 & 2)</li>
                <li>• Perhitungan rata-rata otomatis</li>
                <li>• Predikat nilai (A, B, C, D, E)</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/login">Masuk Sistem</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/register">Daftar Guru</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">Khusus untuk guru yang telah terdaftar</p>
        </div>
      </div>
    </div>
  )
}
