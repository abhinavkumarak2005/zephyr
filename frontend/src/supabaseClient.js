import { createClient } from '@supabase/supabase-js'

// These would normally be in a .env file, but we'll use placeholder strings for now
// until the actual Supabase project is connected by the user.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
