import multer from 'multer'
import path from 'path'
import { mkdirSync } from 'fs'
import { randomUUID } from 'crypto'
import { env } from '../config/env.js'

mkdirSync(env.UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: env.UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${randomUUID()}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  },
})
