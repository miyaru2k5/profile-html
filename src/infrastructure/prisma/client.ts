/**
 * Prisma wiring for Supabase/Postgres.
 * Runtime app data path uses repository interfaces + memory store by default
 * so local quality gates pass without a live database.
 *
 * Production: set DATABASE_URL and instantiate PrismaClient with @prisma/adapter-pg.
 */
export type PrismaLike = {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
};

let prismaRef: PrismaLike | null = null;

export function getPrismaClient(): PrismaLike | null {
  if (!process.env.DATABASE_URL) return null;
  return prismaRef;
}

export function setPrismaClient(client: PrismaLike) {
  prismaRef = client;
}
