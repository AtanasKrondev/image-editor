import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globalSetup: ['src/vitest.global-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./data/test.db',
      UPLOAD_DIR: './uploads-test',
    },
  },
})
