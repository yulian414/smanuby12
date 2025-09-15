import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createSupabaseClient> | undefined
}

export const supabase =
  globalForSupabase.supabase ??
  createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

if (typeof window !== "undefined") {
  globalForSupabase.supabase = supabase
}

// 👇 biar tetap ada export bernama createClient
export function createClient() {
  return supabase
}
