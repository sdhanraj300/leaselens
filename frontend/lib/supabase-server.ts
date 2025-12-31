import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client for API routes
// This client doesn't use AsyncStorage which requires browser/RN environment
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SECRET_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || ""

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})
