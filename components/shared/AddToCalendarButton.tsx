'use client'

import { useState } from 'react'
import { Calendar, Check, Loader } from 'lucide-react'
import { downloadShiftICS } from '@/lib/calendar'

type ButtonState = 'idle' | 'busy' | 'done' | 'error'

// Downloads the .ics file for a scheduled shift so the crew member can
// add it to their phone/desktop calendar ("Add to Calendar").
export function AddToCalendarButton({ shiftId }: { shiftId: string }) {
  const [state, setState] = useState<ButtonState>('idle')

  const handleClick = async () => {
    if (state === 'busy') return
    setState('busy')
    const ok = await downloadShiftICS(shiftId)
    setState(ok ? 'done' : 'error')
    setTimeout(() => setState('idle'), 2500)
  }

  const label =
    state === 'busy' ? 'Preparing…' :
    state === 'done' ? 'Added to calendar' :
    state === 'error' ? 'Try again' : 'Add to Calendar'

  const icon =
    state === 'busy' ? <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> :
    state === 'done' ? <Check size={13} /> : <Calendar size={13} />

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.35rem 0.6rem',
        borderRadius: '0.5rem',
        fontSize: '0.72rem',
        fontWeight: 600,
        cursor: 'pointer',
        background: 'var(--background-tertiary)',
        border: '1px solid var(--border-default)',
        color: state === 'done' ? 'var(--success)' : state === 'error' ? 'var(--error)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </button>
  )
}
