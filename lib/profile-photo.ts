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
// framed with the same cover + zoom/pan geometry as the PhotoEditor.
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

// Box geometry for the photo inside a clipped frame, following the standard
// Instagram / Facebook / Google position model. At zoom = 1 the photo is
// cover-fit: it fills the frame completely (cropped as needed, centre shown).
// Increasing zoom enlarges past cover-fit and cropX/cropY (fractions of the
// photo, 0-1, 0.5 = centre) hold the focal point at the frame centre, so the
// visible region maps 1:1 to every consumer frame (WYSIWYG).
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
  // Cover-fit base (frame fractions): the photo always fills the frame.
  const w0 = A >= R ? A / R : 1
  const h0 = A >= R ? 1 : R / A
  const w = w0 * z
  const h = h0 * z
  return {
    width: w,
    height: h,
    left: 0.5 - cropX * w,
    top: 0.5 - cropY * h,
    overflowX: Math.max(0, w - 1),
    overflowY: Math.max(0, h - 1),
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