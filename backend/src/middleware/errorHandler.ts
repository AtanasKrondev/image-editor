import type { ErrorRequestHandler } from 'express'
import multer from 'multer'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message, code: err.code })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
