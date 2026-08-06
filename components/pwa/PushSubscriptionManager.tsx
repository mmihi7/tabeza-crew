'use client'

import { useEffect, useRef } from 'react'
import { registerPushSubscription } from '@/lib/push'

// Side-effect only: keeps the device's push subscription registered.
// Runs whenever the page is focused / becomes visible after the user
// grants notification permission, and re-registers if the browser
// rotates the push subscription (sw pushsubscriptionchange).
export function PushSubscriptionManager() {
  const registeredRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (!('Notification' in window)) return

    const attempt = () => {
      if (registeredRef.current) return
      if (Notification.permission === 'granted') {
        registeredRef.current = true
        registerPushSubscription().catch(() => {
          // Reset so we retry on next focus if the registration failed
          registeredRef.current = false
        })
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') attempt()
    }
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'push-subscription-changed') attempt()
    }

    window.addEventListener('focus', attempt)
    document.addEventListener('visibilitychange', handleVisibility)
    navigator.serviceWorker.addEventListener('message', handleMessage)
    attempt()

    return () => {
      window.removeEventListener('focus', attempt)
      document.removeEventListener('visibilitychange', handleVisibility)
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  return null
}
