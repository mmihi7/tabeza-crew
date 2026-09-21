'use client'

import { useState, useRef, useCallback } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move } from 'lucide-react'

interface PhotoEditorProps {
  imageUrl: string
  onSave: (settings: { cropX: number; cropY: number; zoom: number; focusMode: string }) => void
  onClose: () => void
  initialSettings?: {
    cropX: number
    cropY: number
    zoom: number
    focusMode: string
  }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export default function PhotoEditor({
  imageUrl,
  onSave,
  onClose,
  initialSettings = { cropX: 0.5, cropY: 0.5, zoom: 1.0, focusMode: 'fill' }
}: PhotoEditorProps) {
  const [cropX, setCropX] = useState(initialSettings.cropX)
  const [cropY, setCropY] = useState(initialSettings.cropY)
  const [zoom, setZoom] = useState(initialSettings.zoom)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 })
  const [cropOnDragStart, setCropOnDragStart] = useState({ x: 0, y: 0 })
  const cropAreaRef = useRef<HTMLDivElement>(null)

  // The zoomed image box is offset so that the focal point (cropX/cropY, 0–1,
  // 0.5 = center) sits at the container's center. object-position cannot pan a
  // proportionally-scaled image, so we move the box itself.
  const panPercentX = cropX * (zoom - 1) * 100
  const panPercentY = cropY * (zoom - 1) * 100

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    setDragOrigin({ x: e.clientX, y: e.clientY })
    setCropOnDragStart({ x: cropX, y: cropY })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [cropX, cropY])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || zoom <= 1) return
    const area = cropAreaRef.current
    if (!area) return
    const rect = area.getBoundingClientRect()
    const dx = (e.clientX - dragOrigin.x) / rect.width
    const dy = (e.clientY - dragOrigin.y) / rect.height
    const step = 1 / (zoom - 1)
    const next = {
      x: clamp(cropOnDragStart.x - dx * step, 0, 1),
      y: clamp(cropOnDragStart.y - dy * step, 0, 1),
    }
    setCropX(next.x)
    setCropY(next.y)
    setDragOrigin({ x: e.clientX, y: e.clientY })
    setCropOnDragStart(next)
  }, [isDragging, dragOrigin, cropOnDragStart, zoom])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.1))
  const handleZoomOut = () => setZoom(prev => Math.max(1, prev - 0.1))
  const handleReset = () => {
    setCropX(0.5)
    setCropY(0.35)
    setZoom(1.2)
  }

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
          maxWidth: 560,
          width: '100%',
          maxHeight: '93vh',
          overflow: 'hidden auto',
          overscrollBehavior: 'contain',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Position Your Photo</h2>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>
              Drag to position your face in the guide. Zoom to adjust.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.5rem',
              padding: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>

        {/* ── Crop Area ─────────────────────────────────────────────── */}
        <div
          ref={cropAreaRef}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            background: '#0a0a1a',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            flexShrink: 0,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* The image being positioned */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Profile photo"
            style={{
              position: 'absolute',
              top: `${-panPercentY}%`,
              left: `${-panPercentX}%`,
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
            draggable={false}
          />

          {/* Grid overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              background: `
                linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '25% 25%',
            }}
          />

          {/* Face positioning guide */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Outer target ring */}
            <div
              style={{
                width: '55%',
                aspectRatio: '3/4',
                borderRadius: '40%',
                border: '2.5px dashed rgba(255,165,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Inner face oval */}
              <div
                style={{
                  width: '65%',
                  height: '55%',
                  borderRadius: '50%',
                  border: '2px dashed rgba(255,165,0,0.35)',
                  position: 'absolute',
                  top: '22%',
                }}
              />
              {/* Eyes guide */}
              <div
                style={{
                  position: 'absolute',
                  top: '32%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '30%',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                color: 'rgba(255,165,0,0.6)',
                fontSize: '0.6rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Position your face here
            </div>
          </div>

          {/* Drag instruction */}
          {!isDragging && (
            <div
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 4,
                background: 'rgba(0,0,0,0.65)',
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.55)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Move size={11} /> Drag to position
            </div>
          )}
        </div>

        {/* ── Zoom & Controls ───────────────────────────────────────── */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleZoomOut}
              style={{
                padding: '0.375rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <ZoomOut size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <div style={{ flex: 1 }}>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#FFA500',
                  height: 4,
                  borderRadius: 2,
                  outline: 'none',
                  appearance: 'none',
                }}
              />
            </div>
            <button
              onClick={handleZoomIn}
              style={{
                padding: '0.375rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <ZoomIn size={15} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', minWidth: 34, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleReset}
              style={{
                padding: '0.375rem 0.65rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.65rem',
              }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* ── Context Previews ──────────────────────────────────────── */}
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            How you&rsquo;ll appear
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* ── Customer App Preview ── */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem', fontWeight: 500 }}>
                Customer App
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem 0',
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#1a1a2e',
                  border: '2px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: `${-panPercentY}%`,
                    left: `${-panPercentX}%`,
                    width: `${zoom * 100}%`,
                    height: `${zoom * 100}%`,
                    background: `url("${imageUrl}") center / cover no-repeat`,
                  }} />
                </div>
              </div>
              <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.2rem' }}>
                Shown when you&rsquo;re serving a customer
              </div>
            </div>

            {/* ── Marketplace Card Preview ── */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem', fontWeight: 500 }}>
                Marketplace
              </div>
              <div style={{
                width: '100%',
                maxWidth: 116,
                margin: '0 auto',
                borderRadius: '0.4rem',
                overflow: 'hidden',
                background: '#0a0a1a',
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left',
              }}>
                {/* Photograph on top — any shape */}
                <div style={{
                  aspectRatio: '3/4',
                  overflow: 'hidden',
                  background: '#0a0a1a',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: `${-panPercentY}%`,
                    left: `${-panPercentX}%`,
                    width: `${zoom * 100}%`,
                    height: `${zoom * 100}%`,
                    background: `url("${imageUrl}") center / cover no-repeat`,
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.6) 100%)',
                  }} />
                </div>
                {/* Brief details */}
                <div style={{ padding: '0.3rem 0.38rem' }}>
                  <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#fff' }}>You</div>
                  <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.1rem' }}>
                    Waiter · Bartender
                  </div>
                  <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.04rem' }}>
                    First Aid · Food Hygiene
                  </div>
                  <div style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>
                    Nairobi
                  </div>
                  <div style={{ display: 'flex', gap: '0.1rem', marginTop: '0.18rem', color: 'rgba(255,165,0,0.9)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: '0.4rem' }}>
            These previews show how your photo will look in the apps
          </div>
        </div>

        {/* ── Save Button ───────────────────────────────────────────── */}
        <div style={{ padding: '0.875rem 1.25rem' }}>
          <button
            onClick={() => onSave({ cropX, cropY, zoom, focusMode: 'fill' })}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '0.6rem',
              border: 'none',
              background: '#FFA500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: '#1a1a2e',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            <Check size={17} /> Save Position
          </button>
        </div>
      </div>
    </div>
  )
}
