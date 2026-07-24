import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { fail, ok } from "@/core/http/api-response";
import { chatSchema } from "@/modules/ai/application/ai-service";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { AppError } from "@/core/errors/app-error";

export async function POST(req: NextRequest) {
  try {
    const c = getContainer();
    const body = chatSchema.parse(await req.json());
    const session = getMemoryStore().aiSessions.find((s) => s.id === body.sessionId);
    if (!session) throw AppError.notFound("AiSession", body.sessionId);
    await requireAccess(req, { tenantId: session.tenantId, permission: "ai:use" });
    return ok(await c.ai.chat(body));
  } catch (e) {
    return fail(e);
  }
}
