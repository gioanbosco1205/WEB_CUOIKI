// server/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// KHÔNG dùng process.env.NODE_ENV, luôn cache trong global
const globalForPrisma = {
  prisma: undefined as PrismaClient | undefined,
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

// Luôn cache (không kiểm tra NODE_ENV)
globalForPrisma.prisma = prisma;

export default prisma;