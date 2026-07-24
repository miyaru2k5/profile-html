import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { uploadMediaSchema } from "@/modules/media/application/media-service";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) return ok([]);
    await requireAccess(req, { tenantId, permission: "media:read" });
    return ok(getContainer().media.list(tenantId));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = uploadMediaSchema.parse(await req.json());
    const ctx = await requireAccess(req, {
      tenantId: body.tenantId,
      permission: "media:upload",
    });
    return created(await getContainer().media.upload({ ...body, uploadedBy: ctx.user.id }));
  } catch (e) {
    return fail(e);
  }
}
