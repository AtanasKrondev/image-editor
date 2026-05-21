import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './app.js';
import { prisma } from './config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, '__fixtures__', 'test-image.png');

describe('GET /api/images', () => {
  afterEach(async () => {
    await prisma.image.deleteMany();
  });

  it('returns an empty array when no images exist', async () => {
    const res = await request(app).get('/api/images');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all uploaded images', async () => {
    await request(app).post('/api/images/upload').attach('images', fixturePath);

    const res = await request(app).get('/api/images');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      original_filename: 'test-image.png',
      width: 100,
      height: 100,
      format: 'png',
    });
    expect(res.body[0].id).toBeDefined();
  });
});

describe('GET /api/images/:id', () => {
  afterEach(async () => {
    await prisma.image.deleteMany();
  });

  it('returns the image metadata for a valid id', async () => {
    const upload = await request(app)
      .post('/api/images/upload')
      .attach('images', fixturePath);
    const id = upload.body[0].id;

    const res = await request(app).get(`/api/images/${id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id,
      original_filename: 'test-image.png',
      width: 100,
      height: 100,
      format: 'png',
    });
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/images/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/images/:id/preview', () => {
  afterEach(async () => {
    await prisma.image.deleteMany();
  });

  it('returns the image binary with correct content-type', async () => {
    const upload = await request(app)
      .post('/api/images/upload')
      .attach('images', fixturePath);
    const id = upload.body[0].id;

    const res = await request(app).get(`/api/images/${id}/preview`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^image\//);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/api/images/nonexistent/preview');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/images/upload', () => {
  afterEach(async () => {
    await prisma.image.deleteMany();
  });

  it('uploads a single image and returns 201 with metadata', async () => {
    const res = await request(app)
      .post('/api/images/upload')
      .attach('images', fixturePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      width: 100,
      height: 100,
      format: 'png',
      original_filename: 'test-image.png',
    });
    expect(res.body[0].id).toBeDefined();
  });

  it('uploads multiple images', async () => {
    const res = await request(app)
      .post('/api/images/upload')
      .attach('images', fixturePath)
      .attach('images', fixturePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveLength(2);
  });
});
