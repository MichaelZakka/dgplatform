# منصة القرارات الرقمية | محافظة دمشق

Digital Decisions Platform — an official government web platform for Damascus
Governorate to **publish official decisions** and **collect citizen
suggestions**.

Built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **CSS
Modules** (no Tailwind). The interface is **Arabic-first and RTL**.

## Features

### Public

- **Homepage (`/`)** — searchable, filterable grid of published decisions
  (filter by category and date range).
- **Decision detail (`/decisions/[id]`)** — full decision text, prominent PDF
  download, and a citizen suggestion form (`status: pending`).

### Admin (prototype — no auth)

- **Dashboard (`/admin`)** — stats cards and recent activity.
- **Publish decision (`/admin/decisions/new`)** — create/publish a decision or
  save as draft.
- **Suggestions moderation (`/admin/suggestions`)** — table of suggestions with
  status/category filters and approve/reject actions.

## API routes

| Method | Route                    | Description                                   |
| ------ | ------------------------ | --------------------------------------------- |
| GET    | `/api/decisions`         | List decisions (`?search=&category=&year=&month=`) |
| POST   | `/api/decisions`         | Create a decision                             |
| GET    | `/api/decisions/[id]`    | Get a single decision                         |
| GET    | `/api/suggestions`       | List suggestions (`?status=&category=&decisionId=`) |
| POST   | `/api/suggestions`       | Submit a citizen suggestion (`status: pending`) |
| PATCH  | `/api/suggestions/[id]`  | Update suggestion status (`approved`/`rejected`) |
| DELETE | `/api/suggestions/[id]`  | Remove a suggestion                           |

Data is held in an **in-memory store** (`src/lib/store.ts`) seeded with 6 mock
decisions. No database is required for the prototype. The store is attached to
`globalThis` so it survives hot reloads during development.

## Project structure

```
src/
  app/
    page.tsx                      # Public homepage
    decisions/[id]/page.tsx       # Single decision view
    admin/
      layout.tsx                  # Admin shell + sidebar
      page.tsx                    # Admin dashboard
      decisions/new/page.tsx      # Publish a decision
      suggestions/page.tsx        # Moderate suggestions
    api/
      decisions/route.ts
      decisions/[id]/route.ts
      suggestions/route.ts
      suggestions/[id]/route.ts
    globals.css                   # Design tokens, resets, base styles
  components/                     # *.tsx + *.module.css
  lib/
    types.ts                      # TypeScript types
    store.ts                      # In-memory seed store
    db.ts                         # Data-access helpers
    format.ts                     # Arabic date/number formatting
```

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> **Note:** `next/font/google` downloads the Cairo and IBM Plex Sans Arabic
> fonts at build/dev time, so the first run requires network access.

## Design system

Brand tokens live in `src/app/globals.css`. The platform uses a formal,
institutional aesthetic: ivory-mist background, forest/emerald surfaces,
golden-wheat accents, square corners (official-document feel), and borders
instead of generic shadows for depth.
