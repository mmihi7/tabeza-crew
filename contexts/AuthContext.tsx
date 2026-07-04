'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createBrowserClient } from '@/lib/supabase'

interface AuthContextValue {
  session:       Session | null
  user:          User    | null
  loading:       boolean
  signOut:       () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session:  null,
  user:     null,
  loading:  true,
  signOut:  async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createBrowserClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Load session once on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
