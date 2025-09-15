import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// opsional kalau kamu punya tipe database dari Supabase
// import { Database } from "@/types/supabase"

export function createClient() {
  // Kalau kamu punya tipe Database bisa kasih generic <Database>
  return createClientComponentClient()
}
