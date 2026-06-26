// @ts-nocheck
import { defineConfig } from '@prisma/config';

export default defineConfig({
  studio: {
    port: 5555,
  },
  migrate: {
    databaseUrl: 'file:./dev.db',
  },
  datasource: {
    url: 'file:./dev.db',
  },
});
