import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import {
  createBlockSchema,
  reorderBlocksSchema,
} from "@/modules/page-builder/application/page-builder-service";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.nextUrl.searchParams.get("profileId");
    if (!profileId) return ok([]);
    return ok(getContainer().pageBuilder.listByProfile(profileId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const c = getContainer();
    const json = await req.json();
    if (json.orderedIds) {
      const body = reorderBlocksSchema.parse(json);
      const profile = (await import("@/infrastructure/memory/store")).getMemoryStore().profiles.find(
        (p) => p.id === body.profileId,
      );
      if (profile) {
        await requireAccess(req, { tenantId: profile.tenantId, permission: "blocks:write" });
      }
      return ok(c.pageBuilder.reorder(body));
    }
    const body = createBlockSchema.parse(json);
    await requireAccess(req, { tenantId: body.tenantId, permission: "blocks:write" });
    return created(c.pageBuilder.create(body));
  } catch (e) {
    return fail(e);
  }
}
