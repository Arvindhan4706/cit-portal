import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  studio: {
    port: 5555,
  },
  migrate: {
    databaseUrl: process.env.DIRECT_URL,
  },
  // Add this block
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
