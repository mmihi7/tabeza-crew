import { useState, useEffect } from 'react'
import type { CSSProperties, RefObject } from 'react'

const PROFILE_PHOTO_STORAGE_KEY = 'tabeza-crew-profile-photo-url'

export function getStoredProfilePhotoUrl(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY)
}

export function setStoredProfilePhotoUrl(url: string | null) {
  if (typeof window === 'undefined') return
  if (url) {
    window.localStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, url)
  } else {
    window.localStorage.removeItem(PROFILE_PHOTO_STORAGE_KEY)
  }
}

export interface PhotoCropSettings {
  cropX?: number
  cropY?: number
  zoom?: number
  focusMode?: string
}

// Natural aspect ratio (width ÷ height) of a photo. Returns null until the
// image has loaded, then stays stable while the URL is unchanged.
export function usePhotoAspect(url?: string | null): number | null {
  const [aspect, setAspect] = useState<number | null>(null)
  useEffect(() => {
    if (!url) {
      setAspect(null)
      return
    }
    let active = true
    const img = new window.Image()
    img.onload = () => {
      if (active && img.naturalWidth > 0) {
        setAspect(img.naturalWidth / img.naturalHeight)
      }
    }
    img.onerror = () => {
      if (active) setAspect(null)
    }
    img.src = url
    return () => {
      active = false
    }
  }, [url])
  return aspect
}

// Live aspect ratio (width ÷ height) of a container element, so a photo is
// framed with the same "contain then zoom/pan" geometry as the PhotoEditor.
export function useContainerAspect(ref: RefObject<HTMLElement | null>): number {
  const [aspect, setAspect] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) {
        setAspect(r.width / r.height)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [ref])
  return aspect
}

// Size (as fractions of the container) and top-left offset of the photo box.
// zoom = 1 shows the whole photo (contain). As zoom grows the box overflows
// the frame and the offset slides so the focal point (cropX/cropY, 0-1,
// 0.5 = centre) sits at the frame centre. Axes that don't overflow are simply
// centred. The box always keeps the photo's natural aspect, so it never
// distorts or pre-crops the photo.
export function getPhotoBox(
  containerAspect: number,
  photoAspect: number,
  zoom: number,
  cropX = 0.5,
  cropY = 0.5
): { width: number; height: number; left: number; top: number; overflowX: number; overflowY: number } {
  const A = photoAspect > 0 ? photoAspect : 1
  const R = containerAspect > 0 ? containerAspect : 1
  const z = Math.max(1, zoom)
  const w0 = Math.min(1, A / R)
  const h0 = Math.min(R / A, 1)
  const w = w0 * z
  const h = h0 * z
  const overflowX = Math.max(0, w - 1)
  const overflowY = Math.max(0, h - 1)
  return {
    width: w,
    height: h,
    left: overflowX > 0 ? 0.5 - cropX * w : (1 - w) / 2,
    top: overflowY > 0 ? 0.5 - cropY * h : (1 - h) / 2,
    overflowX,
    overflowY,
  }
}

// Style for the photo element inside a clipped (overflow:hidden) container.
// The element must be absolutely positioned with the returned box.
export function getPhotoFrameStyle(
  settings: PhotoCropSettings = {},
  containerAspect = 1,
  photoAspect: number | null = null
): CSSProperties {
  const box = getPhotoBox(
    containerAspect,
    photoAspect ?? 1,
    Math.max(1, settings.zoom ?? 1),
    settings.cropX ?? 0.5,
    settings.cropY ?? 0.5
  )
  return {
    position: 'absolute',
    left: `${box.left * 100}%`,
    top: `${box.top * 100}%`,
    width: `${Math.max(box.width, 0.001) * 100}%`,
    height: `${Math.max(box.height, 0.001) * 100}%`,
  }
}