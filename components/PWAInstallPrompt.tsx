'use client'

// PWAInstallPrompt for Tabeza Crew
// The layout inline script captures beforeinstallprompt early into window.__pwaPrompt
// This component reads it and shows a native-feeling install banner.

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [show, setShow]               = useState(false)
  const [prompt, setPrompt]           = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling]   = useState(false)

  useEffect(() => {
    // Already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Already dismissed this session
    if (sessionStorage.getItem('crew-pwa-dismissed')) return

    function tryCapture() {
      const p = (window as any).__pwaPrompt
      if (p) {
        setPrompt(p)
        setTimeout(() => setShow(true), 2500) // small delay — let the page settle
      }
    }

    // The inline script may have already fired before this component mounted
    tryCapture()

    // Or listen for the custom event it dispatches
    window.addEventListener('pwapromptready', tryCapture)
    return () => window.removeEventListener('pwapromptready', tryCapture)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    setInstalling(true)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      console.log('[PWA] install outcome:', outcome)
    } catch (e) {
      console.error('[PWA] install error:', e)
    } finally {
      setShow(false)
      setInstalling(false)
      ;(window as any).__pwaPrompt = null
    }
  }

  function handleDismiss() {
    setShow(false)
    sessionStorage.setItem('crew-pwa-dismissed', '1')
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      right: '1rem',
      zIndex: 9999,
      maxWidth: 420,
      margin: '0 auto',
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: 16,
        padding: '1rem 1.125rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
      }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: 'rgba(245,158,11,0.15)',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Smartphone size={22} style={{ color: '#f59e0b' }} />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f5f5f0', marginBottom: 2 }}>
            Add Tabeza Crew to home screen
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
            Faster access, works offline
          </p>
        </div>

        {/* Install button */}
        <button
          onClick={handleInstall}
          disabled={installing}
          style={{
            background: '#f59e0b',
            color: '#1a1a2e',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 0.875rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: installing ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            flexShrink: 0,
            opacity: installing ? 0.7 : 1,
          }}
        >
          <Download size={14} />
          {installing ? 'Installing…' : 'Install'}
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 4,
            color: 'rgba(255,255,255,0.35)',
            flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
