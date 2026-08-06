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
}

export function getPhotoObjectPosition(settings?: PhotoCropSettings): string {
  const x = ((settings?.cropX ?? 0.5) * 100)
  const y = ((settings?.cropY ?? 0.5) * 100)
  return `${x}% ${y}%`
}

export function getPhotoZoom(settings?: PhotoCropSettings): number {
  return settings?.zoom ?? 1.0
}

export function getPhotoStyle(settings?: PhotoCropSettings): React.CSSProperties {
  return {
    objectFit: 'cover' as const,
    objectPosition: getPhotoObjectPosition(settings),
    transform: `scale(${getPhotoZoom(settings)})`,
  }
}
