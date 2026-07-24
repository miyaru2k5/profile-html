import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { fail, ok } from "@/core/http/api-response";
import { changePlanSchema } from "@/modules/billing/application/billing-service";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) return ok(null);
    await requireAccess(req, { tenantId, permission: "billing:read" });
    return ok(getContainer().billing.getSubscription(tenantId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = changePlanSchema.parse(await req.json());
    await requireAccess(req, { tenantId: body.tenantId, permission: "billing:manage" });
    return ok(getContainer().billing.changePlan(body));
  } catch (e) {
    return fail(e);
  }
}
