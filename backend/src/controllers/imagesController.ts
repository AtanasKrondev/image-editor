import type { Request, Response } from 'express'
import sharp from 'sharp'
import { createImage } from '../services/imageRepository.js'

export async function uploadImages(req: Request, res: Response): Promise<void> {
  if (!Array.isArray(req.files) || req.files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' })
    return
  }

  const created = await Promise.all(
    req.files.map(async (file) => {
      const meta = await sharp(file.path).metadata()
      return createImage({
        filename: file.filename,
        original_filename: file.originalname,
        file_path: file.path,
        size: file.size,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        format: meta.format ?? file.mimetype.split('/')[1],
      })
    })
  )

  res.status(201).json(created)
}
