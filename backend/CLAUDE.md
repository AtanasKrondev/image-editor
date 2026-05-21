# Backend

## Stack

- **Language:** TypeScript (all `.ts` files)
- **Runtime:** Node.js v24+
- **Framework:** Express.js v5+
- **Image Processing:** Sharp (latest)
- **File Upload:** Multer (latest)
- **Database:** SQLite with Prisma ORM v7
- **SQLite Adapter:** `@prisma/adapter-better-sqlite3` (required by Prisma v7)
- **Validation:** Zod

## Structure

```
backend/
├── prisma/
│   └── schema.prisma            (no url — datasource url lives in prisma.config.ts)
├── prisma.config.ts             (Prisma v7 config — datasource url, schema path)
├── src/
│   ├── index.ts                 (entry point)
│   ├── generated/               (gitignored — output of prisma generate)
│   │   └── prisma/
│   ├── config/
│   │   ├── database.ts          (Prisma client singleton)
│   │   └── env.ts               (Zod-validated env config)
│   ├── routes/
│   │   └── images.ts
│   ├── controllers/
│   │   └── imagesController.ts
│   ├── services/
│   │   ├── imageProcessing.ts   (Sharp pipeline)
│   │   └── imageRepository.ts   (all DB queries)
│   ├── middleware/
│   │   ├── upload.ts            (Multer config)
│   │   ├── validate.ts          (Zod validation factory)
│   │   └── errorHandler.ts      (global error handler)
│   └── schemas/
│       └── editSchemas.ts       (Zod discriminated union per edit action)
├── uploads/                     (gitignored)
├── data/                        (SQLite db — gitignored)
├── tsconfig.json
├── package.json
├── .env.example
└── Dockerfile
```

## Database Schema

```prisma
model Image {
  id                String        @id @default(uuid())
  filename          String        @unique
  original_filename String
  file_path         String
  size              Int
  width             Int
  height            Int
  format            String
  created_at        DateTime      @default(now())
  updated_at        DateTime      @updatedAt
  editHistory       EditHistory[]
}

model EditHistory {
  id         String   @id @default(uuid())
  image_id   String
  action     String   // "crop" | "resize" | "rotate" | "flip" | "blur" | "sharpen"
  parameters String   // JSON string
  sequence   Int
  created_at DateTime @default(now())
  image      Image    @relation(fields: [image_id], references: [id], onDelete: Cascade)

  @@index([image_id, sequence])
}
```

## API Endpoints

### Image Management

- `POST /api/images/upload` — upload one or more images
- `GET /api/images` — list all images with metadata
- `GET /api/images/:id` — get single image details
- `DELETE /api/images/:id` — delete image and its history

### Editing

- `POST /api/images/:id/edit` — apply an edit `{ action, parameters }`, returns base64 preview
- `GET /api/images/:id/preview` — re-applies full history, returns current preview
- `GET /api/images/:id/history` — ordered edit history
- `DELETE /api/images/:id/history` — clear edit history

### Download

- `GET /api/images/:id/download?format=jpeg|png|webp` — download final edited image

## Image Processing Strategy

Stateless replay — only the original file is stored on disk. Preview and download re-apply the full edit history chain via Sharp each time. Undo = delete last history row and replay.

## Environment Variables

```
NODE_ENV=development
PORT=5000
DATABASE_URL=file:./data/images.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

## Testing

Framework: Vitest + Supertest. Run with `npm test`.

Test files:
- `src/services/imageProcessing.test.ts` — unit tests for the Sharp pipeline (one test per edit action: crop, resize, rotate, flip, blur, sharpen)
- `src/api.test.ts` — integration tests via Supertest: upload, apply edit, get history, undo (delete last history entry), download, delete image

Test setup:
- Use `DATABASE_URL=file::memory:?cache=shared` to run against an in-memory SQLite DB
- Run `prisma db push` in the global test setup before the suite starts
- Use a small fixture image bundled in `src/__fixtures__/` (e.g. a 100×100 PNG) — no network calls

## Notes

- Express v5: async errors propagate automatically — no try/catch needed in route handlers
- Prisma v7: datasource URL lives in `prisma.config.ts`, not `schema.prisma`
- Prisma v7: generated client goes to `src/generated/prisma/` (gitignored) — import from there, not from `@prisma/client`
- Prisma v7: `PrismaClient` requires a driver adapter (`PrismaBetterSqlite3`) — cannot be instantiated without one
- `prisma db push` runs via npm scripts (`dev` and `start`), not in application code
- Image files stored at `/app/uploads/<uuid>.<ext>` — UUID generated on upload, original name kept in DB
- Both `/app/uploads` and `/app/data` must be named Docker volumes (not bind mounts) for persistence across restarts
