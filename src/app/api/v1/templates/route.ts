import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess, requireAuth } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { createTemplateSchema } from "@/modules/template/application/template-service";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId") ?? undefined;
    if (tenantId) {
      await requireAccess(req, { tenantId, permission: "templates:read" });
    }
    return ok(getContainer().templates.list(tenantId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createTemplateSchema.parse(await req.json());
    if (body.tenantId) {
      await requireAccess(req, { tenantId: body.tenantId, permission: "templates:write" });
    } else {
      await requireAuth(req);
    }
    return created(getContainer().templates.create(body));
  } catch (e) {
    return fail(e);
  }
}
