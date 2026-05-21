import type { Image } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api'

export const IMAGES_KEY = `${BASE}/images`

export async function fetchImages(): Promise<Image[]> {
  const res = await fetch(IMAGES_KEY)
  if (!res.ok) throw new Error('Failed to fetch images')
  return res.json()
}

export async function uploadImages(files: File[]): Promise<Image[]> {
  const formData = new FormData()
  files.forEach(f => formData.append('images', f))
  const res = await fetch(`${BASE}/images/upload`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export function getPreviewUrl(id: string): string {
  return `${BASE}/images/${id}/preview`
}
