'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const px = sizeMap[size]

  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/icons/icon.svg"
        alt="Tabeza"
        width={px}
        height={px}
        priority
        style={{ borderRadius: '0.75rem' }}
      />
    </span>
  )
}
