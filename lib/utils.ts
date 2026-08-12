export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`
}

export function getDefaultAvatarStyle(name: string): { background: string; initials: string } {
  const palette = ['#FF4F00', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const background = palette[hash % palette.length]
  const initials = name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2)
  return { background, initials }
}

export function getHoursUntilExpiry(expiresAt: string): number {
  const expiry = new Date(expiresAt).getTime()
  const now = Date.now()
  const hours = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60)))
  return hours
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function formatShiftTime(hhmm: string): string {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return hhmm
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'expired'
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m left`
  if (hours < 24) return `${hours}h left`
  return `${days}d left`
}
