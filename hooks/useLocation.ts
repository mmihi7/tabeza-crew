'use client'

import { useState, useCallback } from 'react'

export interface Coords {
  lat: number
  lng: number
}

export type LocationState = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'

// Haversine distance in km between two coordinates
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function useLocation() {
  const [state, setState]   = useState<LocationState>('idle')
  const [coords, setCoords] = useState<Coords | null>(null)
  const [error, setError]   = useState<string>('')

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState('unavailable')
      setError('Geolocation not supported on this device.')
      return
    }
    setState('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setState('granted')
        setError('')
      },
      err => {
        setState('denied')
        setError(
          err.code === 1
            ? 'Location permission denied. Enable it in your browser settings.'
            : 'Could not get your location. Try again.'
        )
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  return { state, coords, error, request }
}
