import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { getBearerToken } from "@/core/http/auth-header";
import type { AccessContext } from "@/modules/auth/application/access-control";
import type { Permission } from "@/modules/auth/domain/permissions";
import type { UserRecord } from "@/infrastructure/memory/store";

export type AuthSession = {
  user: UserRecord;
  token: string | null;
};

/** Lấy user đã đăng nhập hoặc ném 401 */
export async function requireAuth(req: NextRequest): Promise<AuthSession> {
  const c = getContainer();
  const token = getBearerToken(req);
  const user = await c.auth.requireUser(token);
  return { user, token };
}

/**
 * Xác thực + phân quyền theo tenant.
 * - tenantId: query `tenantId`, body.tenantId, hoặc tham số truyền vào
 * - permissions: cần ít nhất một (mặc định) hoặc tất cả nếu `mode: "all"`
 */
export async function requireAccess(
  req: NextRequest,
  options: {
    tenantId?: string | null;
    permission?: Permission | Permission[];
    mode?: "any" | "all";
    allowWithoutTenant?: boolean;
  } = {},
): Promise<AccessContext> {
  const c = getContainer();
  const { user } = await requireAuth(req);

  let tenantId = options.tenantId ?? req.nextUrl.searchParams.get("tenantId");

  if (tenantId === undefined || tenantId === null) {
    // thử đọc body clone an toàn — caller nên truyền tenantId khi đã parse body
    tenantId = null;
  }

  if (!tenantId && !options.allowWithoutTenant && !user.isSuperAdmin) {
    // fallback: tenant đầu tiên của user (tiện cho dashboard single-tenant)
    const tenants = c.tenants.listForUser(user.id);
    tenantId = tenants[0]?.id ?? null;
  }

  const ctx = c.access.resolve(user, tenantId);

  if (options.permission) {
    const list = Array.isArray(options.permission) ? options.permission : [options.permission];
    if (options.mode === "all") {
      c.access.assertAll(ctx, list);
    } else {
      c.access.assertAny(ctx, list);
    }
  }

  return ctx;
}

/** Helper khi body JSON đã có tenantId */
export async function requireAccessWithBody(
  req: NextRequest,
  body: { tenantId?: string | null },
  permission?: Permission | Permission[],
  mode: "any" | "all" = "any",
): Promise<{ ctx: AccessContext; body: typeof body }> {
  const ctx = await requireAccess(req, {
    tenantId: body.tenantId ?? null,
    permission,
    mode,
  });
  return { ctx, body };
}
