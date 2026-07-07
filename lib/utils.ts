export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`
}

export function getDefaultAvatarStyle(name: string): { background: string; initials: string } {
  const palette = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const background = palette[hash % palette.length]
  const initials = name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2)
  return { background, initials }
}
