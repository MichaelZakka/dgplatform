import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Fall back to the local SQLite file so config loading (and `prisma generate`
    // during install) never fails when DATABASE_URL is unset, e.g. on CI/Vercel.
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
