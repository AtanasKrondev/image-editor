import type { EditHistoryEntry, Image } from '@/types'

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

export function getPreviewUrl(id: string, cacheBuster?: number): string {
  const url = `${BASE}/images/${id}/preview`
  return cacheBuster !== undefined ? `${url}?t=${cacheBuster}` : url
}

export function historyKey(id: string | null): string | null {
  return id ? `${BASE}/images/${id}/history` : null
}

export async function fetchHistory(id: string): Promise<EditHistoryEntry[]> {
  const res = await fetch(`${BASE}/images/${id}/history`)
  if (!res.ok) throw new Error('Failed to fetch history')
  return res.json()
}

export async function deleteLastHistory(id: string): Promise<EditHistoryEntry> {
  const res = await fetch(`${BASE}/images/${id}/history/last`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Undo failed')
  return res.json()
}

export async function editImage(
  id: string,
  action: string,
  parameters: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${BASE}/images/${id}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, parameters }),
  })
  if (!res.ok) throw new Error('Edit failed')
}
