import { describe, it, expect } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { applyHistory } from './imageProcessing.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(__dirname, '..', '__fixtures__', 'test-image.png')

describe('imageProcessing', () => {
  it('applies crop', async () => {
    const buffer = await applyHistory(fixturePath, [
      { action: 'crop', parameters: JSON.stringify({ left: 0, top: 0, width: 50, height: 50 }) },
    ])
    const meta = await sharp(buffer).metadata()
    expect(meta.width).toBe(50)
    expect(meta.height).toBe(50)
  })

  it('applies resize', async () => {
    const buffer = await applyHistory(fixturePath, [
      { action: 'resize', parameters: JSON.stringify({ width: 50, height: 50 }) },
    ])
    const meta = await sharp(buffer).metadata()
    expect(meta.width).toBe(50)
    expect(meta.height).toBe(50)
  })

  it('applies rotate', async () => {
    const buffer = await applyHistory(fixturePath, [
      { action: 'rotate', parameters: JSON.stringify({ angle: 90 }) },
    ])
    const meta = await sharp(buffer).metadata()
    expect(meta.width).toBe(100)
    expect(meta.height).toBe(100)
  })

  it('applies flip', async () => {
    const buffer = await applyHistory(fixturePath, [
      { action: 'flip', parameters: JSON.stringify({ direction: 'horizontal' }) },
    ])
    const meta = await sharp(buffer).metadata()
    expect(meta.width).toBe(100)
    expect(meta.height).toBe(100)
  })

  it('applies blur', async () => {
    const buffer = await applyHistory(fixturePath, [
      { action: 'blur', parameters: JSON.stringify({ sigma: 2 }) },
    ])
    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('applies sharpen', async () => {
    const buffer = await applyHistory(fixturePath, [
      { action: 'sharpen', parameters: JSON.stringify({ sigma: 1 }) },
    ])
    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(0)
  })
})
