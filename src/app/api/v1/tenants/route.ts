import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAuth } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { createTenantSchema } from "@/modules/tenant/application/tenant-service";

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    return ok(getContainer().tenants.listForUser(user.id));
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Mọi user đăng nhập được tạo workspace riêng (trở thành TENANT_OWNER)
    const { user } = await requireAuth(req);
    const body = createTenantSchema.parse({ ...(await req.json()), ownerId: user.id });
    return created(getContainer().tenants.create(body));
  } catch (e) {
    return fail(e);
  }
}
