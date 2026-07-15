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
