# Image Editor Web Application

## Project Overview

Full-stack image editor — upload, manage, edit, and download images. Containerized, single `docker-compose up` startup. No auth, no users, open-access global image library.

---

## Core Features

1. **Upload & Library** — multi-upload, gallery view, image switcher, metadata display
2. **Editing Tools** — Crop, Resize, Rotate/Flip, Blur, Sharpen
3. **Undo/Redo** — full history, visual indicator, clear option
4. **Download** — JPEG, PNG, WebP

---

## Key Decisions

- **No auth** — no users, sessions, or login
- **Storage** — original files on filesystem only; stateless replay via Sharp for previews/downloads
- **TypeScript everywhere** — all `.ts`/`.tsx` files; no `.js` source files in either service
- **Express v5** — async errors propagate automatically; no try/catch in route handlers
- **Tailwind v4** — configured via `@import "tailwindcss"` in `globals.css`; no `tailwind.config.js`
- **NextJS App Router** — all routing uses `app/` directory
- **State management** — React Context for undo/redo

---

## DevOps

- Docker & Docker Compose
- Single command: `docker-compose up`
- See `backend/CLAUDE.md` and `frontend/CLAUDE.md` for per-service details

---

## Success Criteria

- Upload multiple images
- Switch between images in library
- Apply all 5 edit types (crop, resize, rotate/flip, blur, sharpen)
- Undo and redo all edits
- Download edited image in JPEG, PNG, WebP
- Backend persists images and edit history to SQLite
- Frontend communicates with backend API
- Single `docker-compose up` starts entire application
- No manual database setup (auto-migrations via `prisma db push`)

---

## Notes for Claude Code

- **All source files must use TypeScript** — no `.js` files anywhere
- Prioritize functionality over UI polish initially
- Use simple, readable code without over-engineering
- Create `.env.example` files (never commit real `.env` files)
- Write tests only for the files listed in `backend/CLAUDE.md` and `frontend/CLAUDE.md` — no additional test files needed
