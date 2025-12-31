import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ""
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || ""

// Detect if we are running in a server-side environment (SSR/Static rendering)
const isServer = typeof window === 'undefined';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Only use AsyncStorage if we are on client-side
    storage: isServer ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})