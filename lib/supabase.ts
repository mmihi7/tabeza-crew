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

// Server-side client using secret key for API routes
export const createServiceRoleClient = () => {
  const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SERVICE_ROLE_KEY
  if (!secretKey) {
    throw new Error('SUPABASE_SECRET_KEY is not configured')
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// App URL helper for OAuth redirects and email confirmation links
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3004'
}
