import type { Request, Response } from 'express';
import sharp from 'sharp';
import {
  createImage,
  getAllImages,
  getImageById,
} from '../services/imageRepository.js';

export async function getImage(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const image = await getImageById(id);
  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }
  res.json(image);
}

export async function getImagePreview(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const image = await getImageById(id);
  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }
  const buffer = await sharp(image.file_path).toBuffer();
  res.setHeader('Content-Type', `image/${image.format}`);
  res.send(buffer);
}

export async function getImages(_req: Request, res: Response): Promise<void> {
  const images = await getAllImages();
  res.json(images);
}

export async function uploadImages(req: Request, res: Response): Promise<void> {
  if (!Array.isArray(req.files) || req.files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }

  const created = await Promise.all(
    req.files.map(async (file) => {
      const meta = await sharp(file.path).metadata();
      return createImage({
        filename: file.filename,
        original_filename: file.originalname,
        file_path: file.path,
        size: file.size,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        format: meta.format ?? file.mimetype.split('/')[1],
      });
    }),
  );

  res.status(201).json(created);
}
