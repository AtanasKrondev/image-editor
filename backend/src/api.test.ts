import { describe, it, expect, afterEach } from 'vitest'
import request from 'supertest'
import path from 'path'
import { fileURLToPath } from 'url'
import { app } from './app.js'
import { prisma } from './config/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(__dirname, '__fixtures__', 'test-image.png')

describe('POST /api/images/upload', () => {
  afterEach(async () => {
    await prisma.image.deleteMany()
  })

  it('uploads a single image and returns 201 with metadata', async () => {
    const res = await request(app)
      .post('/api/images/upload')
      .attach('images', fixturePath)

    expect(res.status).toBe(201)
    expect(res.body).toHaveLength(1)
    expect(res.body[0]).toMatchObject({
      width: 100,
      height: 100,
      format: 'png',
      original_filename: 'test-image.png',
    })
    expect(res.body[0].id).toBeDefined()
  })

  it('uploads multiple images', async () => {
    const res = await request(app)
      .post('/api/images/upload')
      .attach('images', fixturePath)
      .attach('images', fixturePath)

    expect(res.status).toBe(201)
    expect(res.body).toHaveLength(2)
  })
})
