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
