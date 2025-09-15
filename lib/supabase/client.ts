import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,    // simpan session di localStorage
        autoRefreshToken: true,  // refresh token otomatis
        detectSessionInUrl: true // penting kalau pakai magic link / oauth
      }
    }
  )
}
