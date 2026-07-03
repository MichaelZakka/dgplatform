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

## Database

Data is persisted in a **database via [Prisma ORM](https://www.prisma.io/)**.
The default setup uses **SQLite** (a single `prisma/dev.db` file), so no external
database server is required for local development. To switch to PostgreSQL later,
change the `provider` in `prisma/schema.prisma` and update `DATABASE_URL`.

- **Schema:** `prisma/schema.prisma` (`Decision` and `Suggestion` models)
- **Config:** `prisma.config.ts` (Prisma 7 config: schema path, migrations, seed)
- **Client:** `src/lib/prisma.ts` (singleton, uses the `better-sqlite3` driver adapter)
- **Data access:** `src/lib/db.ts` (async helpers used by pages and API routes)
- **Seed data:** `prisma/seed.ts` (6 mock decisions + 3 suggestions)

The connection string is read from `DATABASE_URL` in `.env`
(see `.env.example`). Uploaded decision PDFs are still stored on disk under
`public/files/decisions/`.

### Database commands

```bash
npx prisma migrate dev      # create/apply migrations (also generates the client)
npx prisma generate         # (re)generate the Prisma client
npm run db:seed             # seed the database with mock data
npm run db:studio           # open Prisma Studio to inspect data
```

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
    prisma.ts                     # Prisma client singleton (SQLite adapter)
    db.ts                         # Async data-access helpers (Prisma)
    format.ts                     # Arabic date/number formatting
  generated/prisma/               # Generated Prisma client (gitignored)
prisma/
  schema.prisma                   # Database schema
  seed.ts                         # Seed script
  migrations/                     # Migration history
```

## Getting started

```bash
npm install                 # installs deps and generates the Prisma client
cp .env.example .env        # then set DATABASE_URL (defaults to SQLite)
npx prisma migrate dev      # create the database and apply migrations
npm run db:seed             # (optional) load mock data
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
