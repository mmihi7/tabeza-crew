'use client'

import { useRouter } from 'next/navigation'
import { Upload, Trash2, Star } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'

interface PhotoSlotProps {
  type: 'face' | 'half_body' | 'full_body'
  label: string
  description: string
  required?: boolean
  hasPhoto?: boolean
  dimensions: string
}

function PhotoSlot({ type, label, description, required, hasPhoto = false, dimensions }: PhotoSlotProps) {
  const aspectRatio = type === 'face' ? '1/1' : type === 'half_body' ? '3/4' : '2/3'
  const maxWidth    = type === 'face' ? 120 : type === 'half_body' ? 160 : 160

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {label}
            </span>
            {required && (
              <span
                style={{
                  fontSize: '0.65rem', fontWeight: 600,
                  color: 'var(--error)',
                  background: 'rgba(239,68,68,0.1)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '999px',
                }}
              >
                Required
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.4 }}>
            {description}
          </p>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: '0.5rem' }}>
          {dimensions}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
        {/* Photo preview / placeholder */}
        <div
          style={{
            width: maxWidth,
            aspectRatio,
            borderRadius: type === 'face' ? '50%' : '0.75rem',
            background: hasPhoto ? 'var(--amber-pale)' : 'var(--background-tertiary)',
            border: `2px ${hasPhoto ? 'solid' : 'dashed'} ${hasPhoto ? 'var(--amber)' : 'var(--border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {hasPhoto ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem' }}>👤</div>
              {type === 'face' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <Star size={10} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--amber)', fontWeight: 600 }}>Primary</span>
                </div>
              )}
            </div>
          ) : (
            <Upload size={20} style={{ color: 'var(--text-tertiary)' }} />
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem', gap: '0.375rem' }}
            onClick={() => alert(`Upload ${label} (UI demo)`)}
          >
            <Upload size={14} />
            {hasPhoto ? 'Replace' : `Upload ${label}`}
          </button>

          {hasPhoto && (
            <button
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.875rem', gap: '0.375rem', color: 'var(--error)' }}
              onClick={() => alert(`Delete ${label} (UI demo)`)}
            >
              <Trash2 size={14} style={{ color: 'var(--error)' }} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PhotosPage() {
  const router = useRouter()

  return (
    <div className="page-content">
      <PageHeader
        title="Photos & Profile"
        subtitle="Your photos appear in the customer app and marketplace"
        onBack={() => router.push('/waiter/me')}
      />

      <PhotoSlot
        type="face"
        label="Face Photo"
        description="Used in the customer app tab view, venue dashboard, and all marketplace listings. Must show your face clearly."
        required
        hasPhoto
        dimensions="400×400 · auto-cropped to circle"
      />

      <PhotoSlot
        type="half_body"
        label="Half Body Photo"
        description="Shown in marketplace profile cards when venues view your details. Waist-up portrait."
        hasPhoto
        dimensions="600×800 recommended"
      />

      <PhotoSlot
        type="full_body"
        label="Full Body Photo"
        description="Optional. Shown in the expanded profile gallery when a venue opens your full profile."
        hasPhoto={false}
        dimensions="800×1200 recommended"
      />

      {/* Bio section */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            About Me
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Shown on your public profile in the marketplace.
          </p>
        </div>
        <textarea
          className="input"
          rows={4}
          placeholder="Tell venues about your experience, skills, and work style..."
          defaultValue="5+ years experience in fine dining. Fluent in English, Swahili, and basic French. Love creating memorable guest experiences."
          style={{ resize: 'none' }}
        />
        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
          0 / 200 characters
        </div>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%' }}
        onClick={() => router.push('/waiter/me')}
      >
        Save Changes
      </button>
    </div>
  )
}
