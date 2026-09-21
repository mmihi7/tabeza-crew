'use client'

import { useCallback, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Circle, RectangleVertical } from 'lucide-react'
import { usePhotoAspect, getPhotoFrameStyle } from '@/lib/profile-photo'

export interface PhotoFrame {
  x: number
  y: number
  zoom: number
}

export interface PhotoCrops {
  bubble: PhotoFrame
  card: PhotoFrame
}

type Mode = 'bubble' | 'card'

interface PhotoEditorProps {
  imageUrl: string
  initialCrops?: Partial<PhotoCrops>
  onSave: (crops: PhotoCrops) => void
  onClose: () => void
}

const DEFAULT_FRAME: PhotoFrame = { x: 0.5, y: 0.5, zoom: 1 }
const BUBBLE_ASPECT = 1
const CARD_ASPECT = 3 / 4

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

// react-easy-crop works in image-pixel coordinates; we persist a normalised
// focal point + cover-based zoom so every surface renders the same framing.
function focalToCrop(
  f: PhotoFrame,
  media: { width: number; height: number },
  area: { width: number; height: number }
): Point {
  const baseScale = Math.max(area.width / media.width, area.height / media.height)
  const scale = baseScale * Math.max(1, f.zoom)
  const bw = area.width / scale
  const bh = area.height / scale
  return { x: f.x * media.width - bw / 2, y: f.y * media.height - bh / 2 }
}

function croppedAreaToFrame(
  area: Area,
  cropSize: { width: number; height: number },
  media: { width: number; height: number }
): PhotoFrame {
  const x = (area.x + area.width / 2) / 100
  const y = (area.y + area.height / 2) / 100
  const R = cropSize.width / cropSize.height
  const A = media.width / media.height
  const zoom = area.width > 0 ? (100 * Math.min(1, R / A)) / area.width : 1
  return { x, y, zoom: clamp(zoom, 1, 3) }
}

export default function PhotoEditor({ imageUrl, initialCrops, onSave, onClose }: PhotoEditorProps) {
  const [mode, setMode] = useState<Mode>('bubble')
  const [frames, setFrames] = useState<PhotoCrops>({
    bubble: { ...DEFAULT_FRAME, ...initialCrops?.bubble },
    card: { ...DEFAULT_FRAME, ...initialCrops?.card },
  })
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [saving, setSaving] = useState(false)

  const mediaRef = useRef<{ width: number; height: number } | null>(null)
  const cropSizeRef = useRef<{ width: number; height: number } | null>(null)
  const framesRef = useRef(frames)
  framesRef.current = frames
  const modeRef = useRef(mode)
  modeRef.current = mode
  const initDoneRef = useRef(false)

  const photoAspect = usePhotoAspect(imageUrl)

  // Move the cropper to a stored framing.
  const applyFrame = useCallback((m: Mode, override?: PhotoFrame) => {
    const media = mediaRef.current
    const area = cropSizeRef.current
    if (!media || !area) return false
    const f = override ?? framesRef.current[m]
    setCrop(focalToCrop(f, media, area))
    setZoom(f.zoom)
    return true
  }, [])

  const handleMediaLoaded = useCallback((size: { naturalWidth: number; naturalHeight: number }) => {
    mediaRef.current = { width: size.naturalWidth, height: size.naturalHeight }
    if (!initDoneRef.current && applyFrame(modeRef.current)) initDoneRef.current = true
  }, [applyFrame])

  const handleCropSizeChange = useCallback((size: { width: number; height: number }) => {
    cropSizeRef.current = size
    if (!initDoneRef.current && applyFrame(modeRef.current)) initDoneRef.current = true
  }, [applyFrame])

  const handleCropComplete = useCallback((area: Area) => {
    if (!initDoneRef.current) return
    const media = mediaRef.current
    const cs = cropSizeRef.current
    if (!media || !cs) return
    const frame = croppedAreaToFrame(area, cs, media)
    setFrames(prev => ({ ...prev, [modeRef.current]: frame }))
  }, [])

  const switchMode = (m: Mode) => {
    if (m === mode) return
    setMode(m)
    applyFrame(m)
  }

  const handleReset = () => {
    const m = modeRef.current
    const f = { ...DEFAULT_FRAME }
    setFrames(prev => ({ ...prev, [m]: f }))
    applyFrame(m, f)
  }

  const handleSave = () => {
    setSaving(true)
    onSave(framesRef.current)
  }

  const aspect = mode === 'bubble' ? BUBBLE_ASPECT : CARD_ASPECT
  const isBubble = mode === 'bubble'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        backdropFilter: 'blur(12px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '1rem',
          maxWidth: 520,
          width: '100%',
          maxHeight: '94vh',
          overflow: 'hidden auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Position Your Photo</h2>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>
              Position each view separately — drag and zoom.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', display: 'flex',
            }}
          >
            <X size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>

        {/* ── Mode tabs ── */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem 0' }}>
          {([
            { id: 'bubble' as Mode, label: 'Profile', sub: 'Customer bubble', Icon: Circle },
            { id: 'card' as Mode, label: 'Marketplace', sub: 'Venue card', Icon: RectangleVertical },
          ]).map(({ id, label, sub, Icon }) => {
            const active = mode === id
            return (
              <button
                key={id}
                onClick={() => switchMode(id)}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.7rem',
                  borderRadius: '0.6rem',
                  background: active ? 'rgba(255,165,0,0.14)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? 'rgba(255,165,0,0.55)' : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Icon size={16} style={{ color: active ? '#FFA500' : 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                <span>
                  <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                    {label}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>{sub}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Cropper ── */}
        <div style={{ padding: '0.75rem 1.25rem 0' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: 'min(46vh, 340px)',
            background: '#0a0a1a',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}>
            <Cropper
              key={mode}
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={isBubble ? 'round' : 'rect'}
              objectFit="cover"
              showGrid={!isBubble}
              minZoom={1}
              maxZoom={3}
              restrictPosition
              zoomWithScroll
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
              onMediaLoaded={handleMediaLoaded}
              onCropSizeChange={handleCropSizeChange}
            />
          </div>
        </div>

        {/* ── Zoom controls ── */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(2)))} style={ctrlBtn}>
              <ZoomOut size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <div style={{ flex: 1 }}>
              <input
                type="range" min="1" max="3" step="0.05" value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#FFA500', height: 4, borderRadius: 2, outline: 'none', appearance: 'none' }}
              />
            </div>
            <button onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))} style={ctrlBtn}>
              <ZoomIn size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', minWidth: 34, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={handleReset} style={{ ...ctrlBtn, width: 'auto', padding: '0.375rem 0.65rem', gap: '0.3rem' }}>
              <RotateCcw size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>Reset</span>
            </button>
          </div>
        </div>

        {/* ── WYSIWYG preview (active surface only) ── */}
        <div style={{ padding: '0.875rem 1.25rem' }}>
          <div style={{
            fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem',
          }}>
            {isBubble ? 'Profile · customer app' : 'Marketplace · venue app'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isBubble ? (
              <div style={{
                width: 92, height: 92, borderRadius: '50%', overflow: 'hidden',
                background: '#0a0a1a', border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative', flexShrink: 0,
              }}>
                <div style={{
                  ...getPhotoFrameStyle(frames.bubble, 1, photoAspect),
                  background: `url("${imageUrl}") center / cover no-repeat`,
                }} />
              </div>
            ) : (
              <div style={{ width: 132, flexShrink: 0 }}>
                <div style={{
                  borderRadius: '0.5rem', overflow: 'hidden', background: '#0a0a1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', position: 'relative', background: '#0a0a1a' }}>
                    <div style={{
                      ...getPhotoFrameStyle(frames.card, 3 / 4, photoAspect),
                      background: `url("${imageUrl}") center / cover no-repeat`,
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.6) 100%)',
                    }} />
                  </div>
                  <div style={{ padding: '0.3rem 0.4rem' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: '#fff' }}>You</div>
                    <div style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.1rem' }}>
                      Waiter · Bartender
                    </div>
                    <div style={{ display: 'flex', gap: '0.1rem', marginTop: '0.18rem', color: 'rgba(255,165,0,0.9)' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
              {isBubble
                ? 'Shown to customers when you are serving a tab.'
                : 'Shown to venues on your marketplace card.'}
              <div style={{ marginTop: '0.4rem', color: 'rgba(255,255,255,0.3)' }}>
                Saved separately from the {isBubble ? 'Marketplace' : 'Profile'} view — editing one never changes the other.
              </div>
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.85rem',
              borderRadius: '0.7rem',
              background: '#FFA500',
              border: 'none',
              color: '#1a1a2e',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Check size={18} /> {saving ? 'Saving…' : 'Save Position'}
          </button>
        </div>
      </div>
    </div>
  )
}

const ctrlBtn: React.CSSProperties = {
  padding: '0.375rem',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
}
