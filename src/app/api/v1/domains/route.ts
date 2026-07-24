import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { createDomainSchema } from "@/modules/domain/application/domain-service";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) return ok([]);
    await requireAccess(req, { tenantId, permission: "domains:read" });
    return ok(getContainer().domains.listByTenant(tenantId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createDomainSchema.parse(await req.json());
    await requireAccess(req, { tenantId: body.tenantId, permission: "domains:create" });
    return created(getContainer().domains.create(body));
  } catch (e) {
    return fail(e);
  }
}
