import { ok, fail } from "@/core/http/api-response";
import {
  getSupabasePublishableKey,
  getSupabaseS3Endpoint,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/infrastructure/supabase/env";

export async function GET() {
  try {
    const url = getSupabaseUrl();
    const key = getSupabasePublishableKey();
    if (!isSupabaseConfigured() || !url || !key) {
      return ok({
        configured: false,
        auth: null,
        storage: null,
        database: Boolean(process.env.DATABASE_URL),
      });
    }

    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
    };

    const [authRes, storageRes] = await Promise.all([
      fetch(`${url}/auth/v1/health`, { headers, cache: "no-store" }),
      fetch(`${url}/storage/v1/bucket`, { headers, cache: "no-store" }),
    ]);

    const authBody = await authRes.json().catch(() => null);
    const storageBody = await storageRes.json().catch(() => null);

    return ok({
      configured: true,
      projectUrl: url,
      s3Endpoint: getSupabaseS3Endpoint(),
      auth: {
        status: authRes.status,
        ok: authRes.ok,
        name: (authBody as { name?: string } | null)?.name ?? null,
      },
      storage: {
        status: storageRes.status,
        ok: storageRes.ok,
        buckets: Array.isArray(storageBody) ? storageBody.map((b: { name?: string }) => b.name) : [],
      },
      database: {
        configured: Boolean(process.env.DATABASE_URL),
        note: "Schema pushed via Prisma when DATABASE_URL is valid",
      },
      storageProvider: process.env.STORAGE_PROVIDER ?? "memory",
    });
  } catch (e) {
    return fail(e);
  }
}
