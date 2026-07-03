import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Fall back to a placeholder connection string so config loading (and
    // `prisma generate` during install) never fails when DATABASE_URL is unset,
    // e.g. on CI/Vercel. The real URL must be set for migrations and at runtime.
    url:
      process.env.DATABASE_URL ??
      "postgresql://user:pass@localhost:5432/postgres",
  },
});
