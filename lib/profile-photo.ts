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

// Canonical photo framing used across every public surface (PhotoEditor
// preview, FaceBubble, app heroes). The image box is enlarged by `zoom` and
// translated so the focal point (cropX/cropY, 0-1, 0.5 = center) sits at the
// container center. object-position cannot pan a proportionally-scaled image,
// so we move the box itself via transform. The container must clip
// (overflow: hidden).
export function getPhotoFrameStyle(settings?: PhotoCropSettings): React.CSSProperties {
  const cropX = settings?.cropX ?? 0.5
  const cropY = settings?.cropY ?? 0.5
  const zoom = Math.max(1, settings?.zoom ?? 1)
  const pan = (zoom - 1) / zoom
  return {
    width: `${zoom * 100}%`,
    height: `${zoom * 100}%`,
    objectFit: 'cover',
    objectPosition: 'center center',
    transform: `translate(${(-cropX * pan) * 100}%, ${(-cropY * pan) * 100}%)`,
  }
}