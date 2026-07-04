'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    // Register on load to not block initial render
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Registered, scope:', registration.scope)

          // Check for updates every 60s while the app is open
          setInterval(() => registration.update(), 60_000)
        })
        .catch((err) => {
          console.error('[SW] Registration failed:', err)
        })
    })
  }, [])

  // Renders nothing — side-effect only
  return null
}
