import 'dotenv/config'
import { access, constants } from 'fs/promises'
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { prisma } from './config/database.js'
import './middleware/upload.js'
import { imagesRouter } from './routes/images.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', async (_req, res) => {
  const [dbResult, storageResult] = await Promise.allSettled([
    prisma.$queryRaw`SELECT 1`,
    access(env.UPLOAD_DIR, constants.W_OK),
  ])

  res.json({
    status: 'ok',
    db: dbResult.status === 'fulfilled' ? 'ok' : 'error',
    storage: storageResult.status === 'fulfilled' ? 'ok' : 'error',
  })
})

app.use('/api/images', imagesRouter)

app.use(errorHandler)
