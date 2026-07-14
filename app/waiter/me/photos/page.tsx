'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Trash2, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { getStoredProfilePhotoUrl, setStoredProfilePhotoUrl } from '@/lib/profile-photo'

export default function PhotosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = getStoredProfilePhotoUrl()
    if (stored) setPhotoUrl(stored)

    async function loadProfile() {
      if (!user?.id) { setLoading(false); return }
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) { setLoading(false); return }
      try {
        // ✅ Updated to use /api/crew/profile
        const res = await fetch('/api/crew/profile', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const data = await res.json()
        if (data.face_photo_url || data.face_thumbnail_url) {
          setPhotoUrl(data.face_photo_url || data.face_thumbnail_url)
          setStoredProfilePhotoUrl(data.face_photo_url || data.face_thumbnail_url)
        }
        if (data.bio) setBio(data.bio)
      } catch { /* silent */ }
      setLoading(false)
    }
    loadProfile()
  }, [user?.id])

  const [editingBio, setEditingBio] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) throw new Error('You need to be signed in to upload a photo')

      // ✅ Updated to use /api/crew/photo
      const response = await fetch('/api/crew/photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Photo upload failed')

      setPhotoUrl(payload.url)
      setStoredProfilePhotoUrl(payload.url)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Photo upload failed')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleSaveBio() {
    if (!user?.id) return
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return

      // ✅ Updated to use /api/crew/profile
      const res = await fetch('/api/crew/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bio }),
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        setEditingBio(false)
      }
    } catch {
      // Silent fail
    }
  }

  function handleDelete() {
    setPhotoUrl(null)
    setStoredProfilePhotoUrl(null)
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
                position: 'relative',
              }}
            >
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Profile preview"
                  width={112}
                  height={112}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                  priority
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
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveBio}>
                Save Bio
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
        onClick={() => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }}
      >
        {saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  )
}