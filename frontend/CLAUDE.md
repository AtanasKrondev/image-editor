# Frontend

## Important — Read Before Writing Code

This Next.js version may contain breaking changes. APIs, conventions, and file structure may differ from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code. Heed all deprecation notices.

---

## Stack

- **Language:** TypeScript (all `.ts`/`.tsx` files)
- **Framework:** Next.js v15+ (App Router)
- **Styling:** Tailwind CSS v4 (CSS-based config), ShadcnUI
- **State Management:** React Context (undo/redo)
- **HTTP Client:** Fetch API + SWR (data fetching / cache revalidation)

## Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css              (@import "tailwindcss" — Tailwind v4)
│   ├── components/
│   │   ├── ui/                      (ShadcnUI generated)
│   │   ├── ImageUploader.tsx
│   │   ├── ImageLibrary.tsx
│   │   ├── ImageEditor.tsx
│   │   ├── EditHistory.tsx
│   │   └── ToolPanel.tsx
│   ├── hooks/
│   │   └── useEditHistory.ts
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── index.ts
├── public/
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── Dockerfile
```

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Testing

Framework: Vitest + React Testing Library. Run with `npm test`.

Test files:
- `src/hooks/useEditHistory.test.ts` — unit tests for undo/redo logic: add entries, undo, redo, clear history

No component tests — UI is verified manually. Only the hook contains pure logic worth isolating.

## Notes

- Tailwind v4: use `@import "tailwindcss"` in `globals.css` — no `tailwind.config.js`
- All routing uses the `app/` directory (App Router)
- React Context is sufficient for undo/redo state at this scope
- Import alias `@/*` resolves to `src/*`
