import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { fail, ok } from "@/core/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId") ?? undefined;
    if (tenantId) {
      await requireAccess(req, { tenantId, permission: "logs:activity" });
    } else {
      await requireAccess(req, { permission: "logs:activity", allowWithoutTenant: true });
    }
    return ok(getContainer().activity.list(tenantId));
  } catch (e) {
    return fail(e);
  }
}
