'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Trash2, Upload } from 'lucide-react'
import { MOCK_STAFF } from '@/lib/demo-data'
import { FaceBubble } from '@/components/shared/FaceBubble'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function PhotosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const staff = MOCK_STAFF
  const [photoUrl, setPhotoUrl] = useState<string | null>(staff.facePhotoUrl ?? null)
  const [bio, setBio] = useState(staff.bio)
  const [saved, setSaved] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    setUploading(true)
    setUploadError(null)

    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('crew-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('crew-images').getPublicUrl(fileName)
      setPhotoUrl(data.publicUrl)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Photo upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function handleDelete() {
    setPhotoUrl(null)
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: '0.5rem',
            background: 'var(--background-secondary)',
            border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Photos & Profile
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
            What venues and customers see
          </p>
        </div>
      </div>

      {/* Live preview */}
      <div
        className="card-amber"
        style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}
      >
        <FaceBubble
          displayName={staff.displayName}
          photoUrl={photoUrl}
          badgeTier={staff.badgeTier}
          showBadge
          size="lg"
        />
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber)', marginBottom: '0.25rem' }}>
            Preview
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {staff.displayName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {photoUrl ? 'Square profile photo ready' : 'No photo yet — initials shown'}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="text-section-heading" style={{ marginBottom: '0.25rem' }}>
          Single profile photo
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
          Upload one square photo. It will be used for your marketplace profile and the circular profile bubble in the customer app.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: '1rem',
                overflow: 'hidden',
                background: 'var(--background-secondary)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
              ) : (
                <Camera size={28} style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }}>
              <span className="btn-primary" style={{ width: 'fit-content', padding: '0.6rem 0.9rem' }}>
                <Upload size={15} style={{ marginRight: '0.4rem' }} />
                {uploading ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Upload photo'}
              </span>
              <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                Square crop recommended · 400×400 px or larger
              </span>
              {uploadError && (
                <span style={{ fontSize: '0.72rem', color: 'var(--error)' }}>{uploadError}</span>
              )}
            </label>
          </div>

          {photoUrl && (
            <button
              className="btn-ghost"
              style={{ width: 'fit-content', padding: '0.45rem 0.8rem', fontSize: '0.75rem' }}
              onClick={handleDelete}
            >
              <Trash2 size={14} style={{ marginRight: '0.35rem' }} /> Remove photo
            </button>
          )}
        </div>
      </div>

      <hr className="divider" />

      {/* Bio */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="text-section-heading" style={{ marginBottom: '0.25rem' }}>
          About Me
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          Shown on your public marketplace profile.
        </p>

        {editingBio ? (
          <div>
            <textarea
              className="input"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              placeholder="Tell venues about your experience, skills, and availability…"
              style={{ resize: 'none', marginBottom: '0.625rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditingBio(false)}>
                Cancel
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setEditingBio(false)}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{ padding: '1rem', cursor: 'pointer', position: 'relative' }}
            onClick={() => setEditingBio(true)}
          >
            <p style={{ fontSize: '0.875rem', color: bio ? 'var(--text-primary)' : 'var(--text-tertiary)', lineHeight: 1.6 }}>
              {bio || 'Tap to add a bio…'}
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--amber)', marginTop: '0.5rem', fontWeight: 500 }}>
              Tap to edit
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <button
        className="btn-primary"
        style={{ width: '100%' }}
        onClick={handleSave}
      >
        {saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}
