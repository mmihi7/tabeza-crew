'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, RefreshCw, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isInstalledDisplay(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith('android-app://')
}

export default function PWAAppControl() {
  const [installed, setInstalled] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const refreshInstalled = () => setInstalled(isInstalledDisplay())
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
      setMessage('Crew is installed on this device.')
    }
    const onBeforeInstall = (event: Event) => {
      if (isInstalledDisplay()) return
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    refreshInstalled()
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent))
    window.matchMedia('(display-mode: standalone)').addEventListener('change', refreshInstalled)
    window.addEventListener('appinstalled', onInstalled)
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    let currentRegistration: ServiceWorkerRegistration | null = null
    let cancelled = false
    const onControllerChange = () => window.location.reload()
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange)

    async function prepareServiceWorker() {
      if (!('serviceWorker' in navigator)) return
      try {
        currentRegistration = await navigator.serviceWorker.getRegistration('/') ??
          await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (cancelled) return
        setRegistration(currentRegistration)
        setUpdateAvailable(Boolean(currentRegistration.waiting))
        currentRegistration.addEventListener('updatefound', () => {
          const worker = currentRegistration?.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdateAvailable(true)
          })
        })
      } catch (error) {
        console.warn('[PWA] Could not prepare app update controls:', error)
      }
    }
    void prepareServiceWorker()

    return () => {
      cancelled = true
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', refreshInstalled)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return
    setBusy(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
        setMessage('Crew is installed on this device.')
      }
    } catch {
      setMessage('Could not start installation. Use your browser menu to install Crew.')
    } finally {
      setDeferredPrompt(null)
      setBusy(false)
    }
  }

  const checkForUpdates = async () => {
    setBusy(true)
    setMessage('Checking for updates…')
    try {
      const reg = registration ?? await navigator.serviceWorker.getRegistration('/') ??
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      setRegistration(reg)
      const newWorkerInstalled = new Promise<void>((resolve) => {
        const timeout = window.setTimeout(resolve, 12_000)
        const onUpdateFound = () => {
          const worker = reg.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed') {
              window.clearTimeout(timeout)
              resolve()
            }
          })
        }
        reg.addEventListener('updatefound', onUpdateFound, { once: true })
      })
      await reg.update()
      if (reg.installing) await newWorkerInstalled
      if (reg.waiting) {
        setUpdateAvailable(true)
        setMessage('An update is ready to install.')
      } else {
        setUpdateAvailable(false)
        setMessage('Crew is up to date.')
      }
    } catch {
      setMessage('Could not check for an update. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const applyUpdate = () => {
    if (!registration?.waiting) {
      void checkForUpdates()
      return
    }
    setBusy(true)
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    setMessage('Applying update…')
    window.setTimeout(() => window.location.reload(), 2000)
  }

  return (
    <section className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <Smartphone size={19} style={{ color: 'var(--amber)' }} />
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700 }}>App on this device</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{installed ? 'Installed as a Crew app' : 'Install Crew for quick access'}</p>
        </div>
        {installed && <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {!installed && deferredPrompt && <button type="button" onClick={installApp} disabled={busy} className="btn-primary" style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem' }}><Download size={15} style={{ marginRight: 5 }} />Install app</button>}
        {installed && <button type="button" onClick={checkForUpdates} disabled={busy} className="btn-ghost" style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem' }}><RefreshCw size={15} style={{ marginRight: 5 }} />{busy ? 'Checking…' : 'Check for updates'}</button>}
        {installed && updateAvailable && <button type="button" onClick={applyUpdate} disabled={busy} className="btn-primary" style={{ padding: '0.55rem 0.8rem', fontSize: '0.8rem' }}>Update now</button>}
      </div>
      {message && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.55rem' }}>{message}</p>}
      {!installed && !deferredPrompt && <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.55rem' }}>{isIos ? 'In Safari, tap Share, then “Add to Home Screen.”' : 'Use your browser’s menu and choose “Install app” or “Add to Home Screen.”'}</p>}
    </section>
  )
}
