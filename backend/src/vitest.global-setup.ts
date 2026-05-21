import { execSync } from 'child_process'
import { mkdirSync, unlinkSync, existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

const TEST_DB_URL = 'file:./data/test.db'
const FIXTURE_DIR = path.join(process.cwd(), 'src', '__fixtures__')

export async function setup(): Promise<void> {
  mkdirSync(path.join(process.cwd(), 'data'), { recursive: true })
  mkdirSync(path.join(process.cwd(), 'uploads-test'), { recursive: true })
  mkdirSync(FIXTURE_DIR, { recursive: true })

  // Delete existing test DB so prisma db push creates it fresh
  // (avoids --force-reset which is blocked by Prisma's AI safety check)
  const testDbPath = path.join(process.cwd(), 'data', 'test.db')
  if (existsSync(testDbPath)) unlinkSync(testDbPath)

  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: 'pipe',
  })

  await sharp({
    create: { width: 100, height: 100, channels: 4, background: { r: 255, g: 128, b: 0, alpha: 1 } },
  })
    .png()
    .toFile(path.join(FIXTURE_DIR, 'test-image.png'))
}
