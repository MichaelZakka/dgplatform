import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // DATABASE_URL must be set at runtime and for migrations.
    // During `prisma generate` (postinstall) no connection is made, so an
    // empty placeholder is safe there.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder",
  },
});
