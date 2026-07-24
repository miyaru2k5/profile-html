import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { fail, ok } from "@/core/http/api-response";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { AppError } from "@/core/errors/app-error";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const domain = getMemoryStore().domains.find((d) => d.id === id);
    if (!domain) throw AppError.notFound("Domain", id);
    await requireAccess(req, { tenantId: domain.tenantId, permission: "domains:verify" });
    const body = (await req.json().catch(() => ({}))) as { token?: string };
    return ok(getContainer().domains.verify(id, body.token));
  } catch (e) {
    return fail(e);
  }
}
