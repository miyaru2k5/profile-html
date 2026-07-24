import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAuth } from "@/core/http/require-access";
import { fail, ok } from "@/core/http/api-response";
import { PERMISSIONS, ROLE_LABELS_VI, ROLE_PERMISSIONS } from "@/modules/auth/domain/permissions";

/** Ma trận quyền + quyền hiện tại của user (để UI/admin) */
export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    const c = getContainer();
    const tenants = c.tenants.listForUser(user.id);
    const activeTenantId = tenantId ?? tenants[0]?.id ?? null;
    const ctx = c.access.resolve(user, activeTenantId);

    return ok({
      permissionsCatalog: PERMISSIONS,
      roleMatrix: ROLE_PERMISSIONS,
      roleLabels: ROLE_LABELS_VI,
      current: {
        userId: user.id,
        isSuperAdmin: user.isSuperAdmin,
        tenantId: ctx.tenantId,
        role: ctx.role,
        roleLabel: ctx.role ? ROLE_LABELS_VI[ctx.role] : null,
        permissions: ctx.permissions,
      },
    });
  } catch (e) {
    return fail(e);
  }
}
