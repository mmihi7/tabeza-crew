import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

// Singleton pattern — prevents multiple instances and Supabase rate-limit issues
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        storageKey: 'tabeza-crew-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }
  return supabaseInstance
})()

// App URL helper for OAuth redirects and email confirmation links
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3004'
}
