/**
 * Prisma seed entrypoint.
 * Local/demo runtime uses the in-memory seed (`src/infrastructure/memory/store.ts`).
 * When DATABASE_URL points to Postgres, run migrations then port seed data with Prisma Client + adapter.
 */
import { seedStore, resetMemoryStore } from "../src/infrastructure/memory/store";

const store = resetMemoryStore(true);
const profile = store.profiles[0];

console.log(
  JSON.stringify(
    {
      seeded: true,
      users: store.users.length,
      tenants: store.tenants.length,
      profiles: store.profiles.length,
      primaryProfile: profile?.slug,
      domains: store.domains.map((d) => d.hostname),
    },
    null,
    2,
  ),
);

// Ensure seed factory is referenced for tree-shaking safety in tooling
seedStore();
