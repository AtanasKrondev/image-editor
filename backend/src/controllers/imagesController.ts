import type { Request, Response } from 'express';
import { unlink } from 'fs/promises';
import sharp from 'sharp';
import { z } from 'zod';
import { applyHistory } from '../services/imageProcessing.js';
import {
  addEditHistory,
  createImage,
  deleteImageById,
  deleteLastEditHistory,
  getAllImages,
  getEditHistory,
  getImageById,
} from '../services/imageRepository.js';
import type { EditInput } from '../schemas/editSchemas.js';

const formatSchema = z.enum(['jpeg', 'png', 'webp']);

export async function editImage(req: Request, res: Response): Promise<void> {
  const { action, parameters } = req.body as EditInput;
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const image = await getImageById(id);
  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  const history = await getEditHistory(id);
  await addEditHistory({
    image_id: id,
    action,
    parameters: JSON.stringify(parameters),
    sequence: history.length + 1,
  });

  const updatedHistory = await getEditHistory(id);
  const buffer = await applyHistory(image.file_path, updatedHistory);
  res.status(201).json({
    preview: `data:image/${image.format};base64,${buffer.toString('base64')}`,
  });
}

export async function downloadImage(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const parsed = formatSchema.safeParse(req.query.format ?? 'jpeg');
  if (!parsed.success) {
    res.status(400).json({ error: 'format must be jpeg, png, or webp' });
    return;
  }
  const format = parsed.data;

  const image = await getImageById(id);
  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }

  const baseName = image.original_filename.replace(/\.[^.]+$/, '');
  const history = await getEditHistory(id);
  const buffer = await applyHistory(image.file_path, history, format);

  res.setHeader('Content-Type', `image/${format}`);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${baseName}.${format}"`,
  );
  res.send(buffer);
}

export async function deleteImage(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const image = await getImageById(id);
  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }
  await deleteImageById(id);
  await unlink(image.file_path).catch(() => {});
  res.status(204).send();
}

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
  const history = await getEditHistory(id);
  const buffer = await applyHistory(image.file_path, history);
  res.setHeader('Content-Type', `image/${image.format}`);
  res.send(buffer);
}

export async function getImages(_req: Request, res: Response): Promise<void> {
  const images = await getAllImages();
  res.json(images);
}

export async function getImageHistory(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const image = await getImageById(id);
  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }
  const history = await getEditHistory(id);
  res.json(history);
}

export async function undoLastEdit(req: Request, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const image = await getImageById(id);
  if (!image) {
    res.status(404).json({ error: 'Image not found' });
    return;
  }
  const deleted = await deleteLastEditHistory(id);
  if (!deleted) {
    res.status(404).json({ error: 'No history to undo' });
    return;
  }
  res.json(deleted);
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
