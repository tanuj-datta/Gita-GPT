import * as PrismaClientNS from '@prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientNS.PrismaClient | undefined;
};

let prismaInstance: PrismaClientNS.PrismaClient;

if (typeof window === 'undefined') {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    
    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClientNS.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaInstance;
    }
  } else {
    console.warn("⚠️ DATABASE_URL environment variable is missing. Please set it in .env or .env.local.");
    const dummyPool = new Pool();
    const dummyAdapter = new PrismaPg(dummyPool);
    prismaInstance = new PrismaClientNS.PrismaClient({
      adapter: dummyAdapter
    });
  }
} else {
  prismaInstance = null as any;
}

export const prisma = prismaInstance;
