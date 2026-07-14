import Image from 'next/image' // ← ADDED: Import Next.js Image component
import type { BadgeTier } from '@/lib/types'
import { getDefaultAvatarStyle } from '@/lib/utils'

interface FaceBubbleProps {
  photoUrl?: string | null
  displayName: string
  badgeTier?: BadgeTier
  showBadge?: boolean
  isOnShift?: boolean
  size?: 'sm' | 'default' | 'lg' | 'xl'
  onClick?: () => void
}

export function FaceBubble({
  photoUrl,
  displayName,
  badgeTier = 'standard',
  showBadge = false,
  isOnShift,
  size = 'default',
  onClick,
}: FaceBubbleProps) {
  const sizeClass = size !== 'default' ? `face-bubble--${size}` : ''
  const { background, initials } = getDefaultAvatarStyle(displayName)

  const badgeIcon = { gold: '🥇', silver: '🥈', standard: null }[badgeTier]

  // Determine size in pixels for Next.js Image
  const sizeMap = {
    sm: 32,
    default: 40,
    lg: 56,
    xl: 72,
  }
  const pixelSize = sizeMap[size]

  return (
    <div
      className={`face-bubble ${sizeClass}`.trim()}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {photoUrl ? (
        // FIX: Replace <img> with Next.js <Image>
        <Image
          src={photoUrl}
          alt={displayName}
          width={pixelSize}
          height={pixelSize}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          // Use loading="lazy" for images below the fold
          loading="lazy"
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size === 'sm' ? '0.75rem' : size === 'lg' || size === 'xl' ? '1.125rem' : '0.875rem',
            fontWeight: 700,
            color: '#1a1a2e',
          }}
        >
          {initials}
        </div>
      )}

      {showBadge && badgeIcon && (
        <div className="badge-ring">{badgeIcon}</div>
      )}

      {isOnShift !== undefined && (
        <div className={`status-dot status-dot--${isOnShift ? 'active' : 'offline'}`} />
      )}
    </div>
  )
}