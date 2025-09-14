import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen crystal-dark flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-crystal-dark via-crystal-dark/95 to-crystal-dark/90" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="absolute top-20 left-20 w-32 h-32 rounded-full border border-primary/30">
        <div className="absolute inset-4 rounded-full border border-primary/20 pulse-ring"></div>
        <div className="absolute inset-8 rounded-full bg-primary/10 pulse-dot"></div>
      </div>
      <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full border border-accent/30">
        <div className="absolute inset-3 rounded-full border border-accent/20 pulse-ring"></div>
        <div className="absolute inset-6 rounded-full bg-accent/10 pulse-dot"></div>
      </div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full border border-primary/20">
        <div className="absolute inset-2 rounded-full border border-primary/15 pulse-ring"></div>
        <div className="absolute inset-4 rounded-full bg-primary/5 pulse-dot"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-xl"></div>
              <div className="relative crystal-glass rounded-full p-3">
                <Image
                  src="/logo_smanuby.png"
                  alt="Logo SMA Negeri 1 Boyolali"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              <span className="crystal-gradient-text">Sistem Absensi & Penilaian Siswa</span>
            </h1>
            <p className="crystal-text text-base max-w-2xl mx-auto leading-relaxed opacity-90">
              Platform digital biometrik untuk mengelola absensi dan input nilai siswa dengan teknologi masa depan
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <Button
                asChild
                size="lg"
                className="relative crystal-button-primary w-full sm:w-auto min-w-[180px] font-semibold"
              >
                <Link href="/auth/login">Masuk Sistem</Link>
              </Button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="relative crystal-button-secondary w-full sm:w-auto min-w-[180px] font-semibold"
              >
                <Link href="/auth/register">Daftar Guru</Link>
              </Button>
            </div>
          </div>

          <p className="text-sm crystal-text opacity-70 pt-1">Khusus untuk guru yang telah terdaftar</p>

          <div className="grid md:grid-cols-2 gap-4 pt-6">
            <div className="crystal-glass liquid-edge p-5 hover:bg-card/20 transition-all duration-300 group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                <div className="w-6 h-6 rounded-full bg-primary/40"></div>
              </div>
              <h3 className="font-bold crystal-accent mb-2 text-lg">Sistem Absensi</h3>
              <p className="crystal-text leading-relaxed text-sm opacity-90">
                Input absensi harian dengan teknologi biometrik, riwayat kehadiran real-time, dan status lengkap
              </p>
            </div>
            <div className="crystal-glass liquid-edge p-5 hover:bg-card/20 transition-all duration-300 group">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                <div className="w-6 h-6 rounded-full bg-accent/40"></div>
              </div>
              <h3 className="font-bold crystal-gold mb-2 text-lg">Sistem Penilaian</h3>
              <p className="crystal-text leading-relaxed text-sm opacity-90">
                Nilai pengetahuan dan praktek dengan AI analytics, perhitungan otomatis, dan laporan komprehensif
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
