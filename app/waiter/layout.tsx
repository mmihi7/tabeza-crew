'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BottomTabNav } from '@/components/layout/BottomTabNav'
import { useAuth } from '@/contexts/AuthContext'

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Once the auth state is resolved, redirect if not signed in
    if (!loading && !session) {
      router.replace('/auth/login')
    }
  }, [loading, session, router])

  // Show nothing while checking session to avoid flash of protected content
  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--background-primary)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid var(--border-default)',
          borderTopColor: 'var(--amber)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not authenticated — render nothing while redirecting
  if (!session) return null

  return (
    <>
      <main className="page-wrapper">{children}</main>
      <BottomTabNav />
    </>
  )
}
