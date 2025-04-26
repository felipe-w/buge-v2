import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schemas",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
