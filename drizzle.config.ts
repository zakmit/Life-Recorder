import { defineConfig } from 'drizzle-kit'

// Drizzle Kit generates plain SQL migrations from the schema below.
// Migrations are applied to D1 via `wrangler d1 migrations apply`
// (see the db:migrate:* scripts in package.json), not by drizzle-kit directly.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'd1-http',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
})
