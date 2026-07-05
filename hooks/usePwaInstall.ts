'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Extend Window so TypeScript knows about our global cache
declare global {
  interface Window {
    __pwaPrompt: BeforeInstallPromptEvent | null
  }
}

export type InstallState =
  | 'unknown'      // still checking
  | 'installed'    // running as standalone PWA
  | 'prompted'     // browser prompt is ready
  | 'unavailable'  // iOS Safari — manual install only

export function usePwaInstall() {
  const [installState, setInstallState] = useState<InstallState>('unknown')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallState('installed')
      return
    }

    // iOS detection
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    const safari = /safari/.test(ua) && !/chrome/.test(ua) && !/crios/.test(ua)
    setIsIos(ios)

    if (ios && safari) {
      setInstallState('unavailable')
      return
    }

    // ── Key fix: check if the event was already captured by the inline script ──
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt)
      setInstallState('prompted')
      return
    }

    // Otherwise listen for it (fires when criteria first met mid-session)
    function onPromptReady() {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt)
        setInstallState('prompted')
      }
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      window.__pwaPrompt = e as BeforeInstallPromptEvent
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setInstallState('prompted')
    }

    window.addEventListener('pwapromptready', onPromptReady)
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', () => {
      setInstallState('installed')
      setDeferredPrompt(null)
      window.__pwaPrompt = null
    })

    // If nothing fires after 3s, mark as unavailable (browser won't prompt)
    const timer = setTimeout(() => {
      if (installState === 'unknown') setInstallState('unavailable')
    }, 3000)

    return () => {
      window.removeEventListener('pwapromptready', onPromptReady)
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    window.__pwaPrompt = null
    if (outcome === 'accepted') setInstallState('installed')
    return outcome === 'accepted'
  }, [deferredPrompt])

  return { installState, triggerInstall, isIos }
}
