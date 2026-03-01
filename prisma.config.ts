import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// .env.local を優先的に読み込む（Prisma は .env.local を自動で読まないため）
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
})
