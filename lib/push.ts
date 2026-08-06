import { supabase } from '@/lib/supabase'

// Convert a base64url VAPID public key to the Uint8Array the
// PushManager.subscribe() API expects.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return window.btoa(binary)
}

// Subscribe the current device to web push and store the subscription
// server-side via /api/push/subscribe (shared push_subscriptions table).
export async function registerPushSubscription(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false
    if (!('Notification' in window) || Notification.permission !== 'granted') return false
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

    const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!applicationServerKey) return false

    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerKey) as BufferSource,
      })
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return false

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

// Unsubscribe the current device and remove the stored subscription.
export async function unregisterPushSubscription(): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) await subscription.unsubscribe()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return false

    const res = await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ endpoint: subscription?.endpoint ?? null }),
    })
    return res.ok
  } catch {
    return false
  }
}
