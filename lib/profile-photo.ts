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

// A visible region of the photo, as percentages of the image (0-100).
// { x:0, y:0, width:100, height:100 } = the whole photo (the default).
export interface PhotoRegion {
  x: number
  y: number
  width: number
  height: number
}

export const FULL_REGION: PhotoRegion = { x: 0, y: 0, width: 100, height: 100 }

export function isRegion(v: any): v is PhotoRegion {
  return (
    !!v &&
    typeof v.x === 'number' &&
    typeof v.y === 'number' &&
    typeof v.width === 'number' &&
    typeof v.height === 'number'
  )
}

// True when the region is (effectively) the whole photo — the default state.
export function isFullRegion(r?: PhotoRegion | null): boolean {
  if (!r) return true
  return (
    Math.abs(r.x) < 0.5 &&
    Math.abs(r.y) < 0.5 &&
    Math.abs(r.width - 100) < 0.5 &&
    Math.abs(r.height - 100) < 0.5
  )
}

// Read a surface's region from crew_members.photo_crops. Tolerates the legacy
// { x, y, zoom } shape (which had no explicit region) by falling back to the
// whole photo.
export function regionFromCrops(photoCrops: any, surface: 'bubble' | 'card'): PhotoRegion {
  const r = photoCrops?.[surface]
  return isRegion(r) ? { x: r.x, y: r.y, width: r.width, height: r.height } : FULL_REGION
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

// Live aspect ratio (width ÷ height) of a container element.
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

// Geometry of the photo inside a clipped frame. The visible region is scaled
// to fit inside the frame while preserving the photo's aspect ratio (contain),
// then offset so the region lines up. At the default full region nothing is
// cropped and the whole photo is shown, letterboxed where the shapes differ.
export function getPhotoBoxFromRegion(
  region: PhotoRegion,
  containerAspect: number,
  photoAspect: number
): { width: number; height: number; left: number; top: number; overflowX: number; overflowY: number } {
  const A = photoAspect > 0 ? photoAspect : 1
  const R = containerAspect > 0 ? containerAspect : 1
  const w = Math.min(100 / region.width, (100 / region.height) * (A / R))
  const h = Math.min((100 / region.width) * (R / A), 100 / region.height)
  return {
    width: w,
    height: h,
    left: -(region.x / 100) * w,
    top: -(region.y / 100) * h,
    overflowX: Math.max(0, w - 1),
    overflowY: Math.max(0, h - 1),
  }
}

// Style for the photo element inside a clipped (overflow:hidden) container.
// The element must be absolutely positioned with the returned box.
export function getPhotoFrameStyle(
  region: PhotoRegion = FULL_REGION,
  containerAspect = 1,
  photoAspect: number | null = null
): CSSProperties {
  const box = getPhotoBoxFromRegion(region, containerAspect, photoAspect ?? 1)
  return {
    position: 'absolute',
    left: `${box.left * 100}%`,
    top: `${box.top * 100}%`,
    width: `${Math.max(box.width, 0.001) * 100}%`,
    height: `${Math.max(box.height, 0.001) * 100}%`,
  }
}
