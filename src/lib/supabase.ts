import { createClient } from '@supabase/supabase-js'

const url = 'https://adbyhtpjbqvkpvfpkeqb.supabase.co'
const key = 'sb_publishable_rFRTqD1zRfUy1SWwIgqVFg_KKuEmsAV'

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})