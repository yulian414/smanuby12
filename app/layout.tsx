import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Absensi Kita",
  description: "Sistem Absensi dan Input Nilai Siswa",
  generator: "v0.app",
  icons: {
    icon: "/smanuby.png",
    shortcut: "/smanuby.png",
    apple: "/smanuby.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
