import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "@/modules/tenant/application/member-service";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) return ok([]);
    await requireAccess(req, { tenantId, permission: "members:read" });
    return ok(getContainer().members.list(tenantId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = inviteMemberSchema.parse(await req.json());
    const ctx = await requireAccess(req, {
      tenantId: body.tenantId,
      permission: "members:invite",
    });
    return created(getContainer().members.invite(ctx, body));
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = updateMemberRoleSchema.parse(await req.json());
    const ctx = await requireAccess(req, {
      tenantId: body.tenantId,
      permission: "members:manage",
    });
    return ok(getContainer().members.updateRole(ctx, body));
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = z
      .object({ tenantId: z.string().min(1), memberId: z.string().min(1) })
      .parse(await req.json());
    const ctx = await requireAccess(req, {
      tenantId: body.tenantId,
      permission: "members:manage",
    });
    return ok(getContainer().members.remove(ctx, body.tenantId, body.memberId));
  } catch (e) {
    return fail(e);
  }
}
