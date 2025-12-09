import { defineConfig } from "@prisma/cli";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});



