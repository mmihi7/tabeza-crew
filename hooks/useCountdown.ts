'use client'

import { useState, useEffect } from 'react'

export interface CountdownResult {
  totalSeconds: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  isUrgent: boolean
  formatted: string
}

export function useCountdown(targetIso: string | null | undefined): CountdownResult {
  const compute = (): CountdownResult => {
    if (!targetIso) {
      return { totalSeconds: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isUrgent: false, formatted: '' }
    }
    const now = Date.now()
    const target = new Date(targetIso).getTime()
    const diff = Math.max(0, Math.floor((target - now) / 1000))

    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    const seconds = diff % 60
    const isPast = diff <= 0
    const isUrgent = diff < 1800

    let formatted = ''
    if (diff <= 0) {
      formatted = 'Starting now'
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      formatted = `${minutes}m ${seconds}s`
    } else {
      formatted = `${seconds}s`
    }

    return { totalSeconds: diff, hours, minutes, seconds, isPast, isUrgent, formatted }
  }

  const [result, setResult] = useState<CountdownResult>(compute)

  useEffect(() => {
    setResult(compute())
    const interval = setInterval(() => setResult(compute()), 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIso])

  return result
}
