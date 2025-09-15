import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/types/supabase" // opsional kalau kamu punya tipe Database

// function gaya lama, tapi pakai auth-helpers
export function createClient() {
  return createClientComponentClient<Database>()
}
