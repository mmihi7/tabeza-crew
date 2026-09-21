/**
 * Client-side image compression for photo uploads.
 *
 * Vercel functions reject request bodies over ~4.5MB with 413. Phone photos
 * commonly exceed that, so we downscale + re-encode to JPEG before sending.
 * EXIF orientation is honoured (via createImageBitmap, with an <img> fallback).
 */

export interface CompressedImage {
  blob: Blob
  name: string
  type: string
}

const MAX_DIM = 1600
const MAX_BYTES = 3.5 * 1024 * 1024
const QUALITY_STEPS = [0.85, 0.72, 0.55]

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

async function loadImageObjectUrl(blob: Blob): Promise<HTMLImageElement | null> {
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = 'sync'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('decode failed'))
      img.src = url
    })
    return img
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Try to shrink `file` to a JPEG that fits the server limit.
 * Returns null when the file could not be re-encoded (unsupported format).
 * EXIF orientation is preserved by drawing the bitmap in its natural orientation.
 */
export async function compressImageFile(file: File): Promise<CompressedImage | null> {
  if (!file.type.startsWith('image/')) return null

  // Prefer createImageBitmap (oriented), fall back to <img> for older browsers.
  let width: number
  let height: number
  let source: ImageBitmap | HTMLImageElement | null = null

  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    source = await loadImageObjectUrl(file)
  }

  if (!source) return null

  width = source.width
  height = source.height

  // We no longer need the source after drawing; keep refs for drawImage below.
  const scale = Math.min(1, MAX_DIM / Math.max(width, height))
  const drawW = Math.max(1, Math.round(width * scale))
  const drawH = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = drawW
  canvas.height = drawH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    if ('close' in source) source.close()
    return null
  }

  ctx.drawImage(source as CanvasImageSource, 0, 0, drawW, drawH)
  if ('close' in source) source.close()

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'

  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    if (!blob) return null
    if (blob.size <= MAX_BYTES) {
      return { blob, name: `${baseName}.jpg`, type: 'image/jpeg' }
    }
  }

  return null
}