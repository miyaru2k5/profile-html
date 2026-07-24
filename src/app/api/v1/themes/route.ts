import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess, requireAuth } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { createThemeSchema } from "@/modules/theme/application/theme-service";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId") ?? undefined;
    if (tenantId) {
      await requireAccess(req, { tenantId, permission: "themes:read" });
    }
    return ok(getContainer().themes.list(tenantId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createThemeSchema.parse(await req.json());
    if (body.tenantId) {
      await requireAccess(req, { tenantId: body.tenantId, permission: "themes:write" });
    } else {
      await requireAuth(req);
    }
    return created(getContainer().themes.create(body));
  } catch (e) {
    return fail(e);
  }
}
