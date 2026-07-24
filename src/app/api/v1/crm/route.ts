import type { NextRequest } from "next/server";
import { z } from "zod";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { createLeadSchema, updateLeadSchema } from "@/modules/crm/application/crm-service";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { AppError } from "@/core/errors/app-error";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) return ok([]);
    await requireAccess(req, { tenantId, permission: "crm:read" });
    return ok(getContainer().crm.list(tenantId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createLeadSchema.parse(await req.json());
    const ctx = await requireAccess(req, { tenantId: body.tenantId, permission: "crm:write" });
    return created(getContainer().crm.create({ ...body, ownerId: body.ownerId ?? ctx.user.id }));
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json();
    const id = z.string().min(1).parse(json.id);
    const body = updateLeadSchema.parse(json);
    const lead = getMemoryStore().crmLeads.find((l) => l.id === id);
    if (!lead) throw AppError.notFound("CrmLead", id);
    await requireAccess(req, { tenantId: lead.tenantId, permission: "crm:write" });
    return ok(getContainer().crm.update(id, body));
  } catch (e) {
    return fail(e);
  }
}
