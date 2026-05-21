import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { prisma } from './config/database.js'

const app = express()
app.use(cors())

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', db: 'ok' })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.json({ status: 'ok', db: 'error', error: message })
  }
})

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
})
