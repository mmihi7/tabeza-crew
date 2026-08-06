'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user:    User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  getSession: () => Session | null
}

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  session: null,
  loading: true,
  signOut: async () => {},
  getSession: () => null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setUser(s?.user ?? null)
      setSession(s ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setUser(newSession?.user ?? null)
      setSession(newSession ?? null)
      setLoading(false)
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        localStorage.setItem('crew_previous_login', 'true')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getSession = useCallback(() => session, [session])

  async function signOut() {
    await supabase.auth.signOut()
    localStorage.removeItem('tabeza-crew-auth')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, getSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
