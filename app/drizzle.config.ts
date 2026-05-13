import { defineConfig } from 'drizzle-kit';
import { resolve } from 'node:path';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/shared/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: resolve(__dirname, 'local.db'),
  },
  verbose: true,
  strict: true,
});
