import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { createSessionSchema } from "@/modules/ai/application/ai-service";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) return ok([]);
    const ctx = await requireAccess(req, { tenantId, permission: "ai:use" });
    return ok(getContainer().ai.listSessions(tenantId, ctx.user.id));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const ctx = await requireAccess(req, {
      tenantId: raw.tenantId,
      permission: "ai:use",
    });
    const body = createSessionSchema.parse({ ...raw, userId: ctx.user.id });
    return created(getContainer().ai.createSession(body));
  } catch (e) {
    return fail(e);
  }
}
