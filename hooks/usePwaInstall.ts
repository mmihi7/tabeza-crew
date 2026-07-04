'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallState =
  | 'unknown'      // checking
  | 'installed'    // already a PWA / standalone
  | 'prompted'     // browser has a prompt ready
  | 'unavailable'  // iOS Safari or prompt already dismissed

export function usePwaInstall() {
  const [installState, setInstallState] = useState<InstallState>('unknown')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos]   = useState(false)
  const [isSafari, setIsSafari] = useState(false)

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
    setIsSafari(safari)

    if (ios && safari) {
      // iOS Safari can install but has no beforeinstallprompt
      setInstallState('unavailable')
      return
    }

    // Chrome / Edge / Android — listen for the prompt event
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setInstallState('prompted')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    // If installed via prompt
    window.addEventListener('appinstalled', () => {
      setInstallState('installed')
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      setInstallState('installed')
    }
    return outcome === 'accepted'
  }, [deferredPrompt])

  return { installState, triggerInstall, isIos, isSafari }
}
