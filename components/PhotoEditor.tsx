'use client'

import { useState, useRef, useEffect } from 'react'
import { Move, ZoomIn, ZoomOut, RotateCcw, Check, X, Crop, Maximize, Minimize } from 'lucide-react'

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

export default function PhotoEditor({ 
  imageUrl, 
  onSave, 
  onClose,
  initialSettings = { cropX: 0.5, cropY: 0.5, zoom: 1.0, focusMode: 'fill' }
}: PhotoEditorProps) {
  const [cropX, setCropX] = useState(initialSettings.cropX)
  const [cropY, setCropY] = useState(initialSettings.cropY)
  const [zoom, setZoom] = useState(initialSettings.zoom)
  const [focusMode, setFocusMode] = useState<'fill' | 'contain' | 'cover'>(initialSettings.focusMode as 'fill' | 'contain' | 'cover')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Load image to get dimensions
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
    }
    img.src = imageUrl
  }, [imageUrl])

  // Handle mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = (e.clientX - dragStart.x) / 200
    const dy = (e.clientY - dragStart.y) / 200
    setCropX(prev => Math.max(0, Math.min(1, prev + dx)))
    setCropY(prev => Math.max(0, Math.min(1, prev + dy)))
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const dx = (touch.clientX - dragStart.x) / 200
    const dy = (touch.clientY - dragStart.y) / 200
    setCropX(prev => Math.max(0, Math.min(1, prev + dx)))
    setCropY(prev => Math.max(0, Math.min(1, prev + dy)))
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(3, prev + 0.1))
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.1))
  const handleReset = () => {
    setCropX(0.5)
    setCropY(0.5)
    setZoom(1.0)
    setFocusMode('fill')
  }

  // Get object-fit value
  const getObjectFit = () => {
    if (focusMode === 'contain') return 'contain'
    if (focusMode === 'cover') return 'cover'
    return 'cover' // fill uses cover with crop positioning
  }

  // Calculate image style
  const getImageStyle = () => {
    const isPortrait = imageDimensions.height > imageDimensions.width
    const isLandscape = imageDimensions.width > imageDimensions.height
    
    // For fill mode, we use cover with zoom and position
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, -50%) scale(${zoom})`,
      width: '100%',
      height: '100%',
      objectFit: getObjectFit(),
      objectPosition: `${cropX * 100}% ${cropY * 100}%`,
    }
    return baseStyle
  }

  // Focus mode options
  const focusModes = [
    { value: 'fill', label: 'Fill', icon: Maximize, description: 'Fill the frame' },
    { value: 'cover', label: 'Cover', icon: Crop, description: 'Show face/center' },
    { value: 'contain', label: 'Contain', icon: Minimize, description: 'Show full image' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '1rem',
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
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
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Adjust Photo</h2>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
              Drag to reposition · Zoom to adjust
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
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>

        {/* Photo Preview */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            background: '#0a0a1a',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              pointerEvents: 'none',
              background: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '33.33% 33.33%',
            }}
          />
          
          {/* Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Profile"
            style={getImageStyle()}
            draggable={false}
          />

          {/* Center crosshair */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              pointerEvents: 'none',
              opacity: 0.4,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 2,
                  height: 10,
                  background: 'rgba(255,255,255,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(90deg)',
                  width: 2,
                  height: 10,
                  background: 'rgba(255,255,255,0.3)',
                }}
              />
            </div>
          </div>

          {/* Drag hint */}
          {!isDragging && (
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                background: 'rgba(0,0,0,0.6)',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.6)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <Move size={12} /> Drag to reposition
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleZoomOut}
              style={{
                padding: '0.375rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZoomOut size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#FF4F00',
                  background: 'rgba(255,255,255,0.1)',
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
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ZoomIn size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </button>
            
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', minWidth: 32, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Focus mode buttons */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {focusModes.map((mode) => {
              const Icon = mode.icon
              const isActive = focusMode === mode.value
              return (
                <button
                  key={mode.value}
                  onClick={() => setFocusMode(mode.value as 'fill' | 'contain' | 'cover')}
                  style={{
                    flex: 1,
                    padding: '0.4rem 0.5rem',
                    borderRadius: '0.375rem',
                    border: `1px solid ${isActive ? 'rgba(255,79,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive ? 'rgba(255,79,0,0.15)' : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    color: isActive ? '#FF4F00' : 'rgba(255,255,255,0.4)',
                    fontSize: '0.65rem',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={14} />
                  {mode.label}
                </button>
              )
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem',
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              onClick={() => onSave({ cropX, cropY, zoom, focusMode })}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: '#FF4F00',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                color: '#1a1a2e',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Check size={16} /> Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}