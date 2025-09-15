import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,     // simpan session di localStorage
        autoRefreshToken: true,   // otomatis refresh access_token
        detectSessionInUrl: true, // perlu kalau pakai magic link / oauth
      },
    }
  )
}
