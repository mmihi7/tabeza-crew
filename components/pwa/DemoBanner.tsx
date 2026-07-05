'use client'

import { useDemo } from '@/contexts/DemoContext'
import { useRouter } from 'next/navigation'
import { FlaskConical, X } from 'lucide-react'

export function DemoBanner() {
  const { isDemo, exitDemo } = useDemo()
  const router = useRouter()

  if (!isDemo) return null

  function handleExit() {
    exitDemo()
    router.replace('/auth/login')
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 999,
        background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
        color: '#fff',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        fontSize: '0.775rem',
        fontWeight: 600,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FlaskConical size={14} />
        Demo mode — using sample data. Nothing is saved.
      </div>
      <button
        onClick={handleExit}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '0.375rem',
          color: '#fff',
          fontSize: '0.7rem', fontWeight: 700,
          padding: '0.2rem 0.625rem',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <X size={12} /> Exit Demo
      </button>
    </div>
  )
}
