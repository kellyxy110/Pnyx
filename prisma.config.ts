import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: process.env.PRISMA_ENV_FILE ?? ".env" });

export default defineConfig({
  schema: "prisma/schema.foundation.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
