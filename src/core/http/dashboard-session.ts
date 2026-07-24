import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getContainer } from "@/core/di/container";
import type { AccessContext } from "@/modules/auth/application/access-control";
import type { TenantRecord, UserRecord } from "@/infrastructure/memory/store";
import type { Permission } from "@/modules/auth/domain/permissions";
import { ROLE_LABELS_VI } from "@/modules/auth/domain/permissions";

export type DashboardSession = {
  user: UserRecord;
  tenants: TenantRecord[];
  activeTenant: TenantRecord;
  access: AccessContext;
  isSuperAdmin: boolean;
  roleLabel: string;
  permissions: Permission[];
};

/** Session dashboard từ cookie — redirect /login nếu chưa đăng nhập */
export async function requireDashboardSession(
  preferredTenantId?: string | null,
): Promise<DashboardSession> {
  const jar = await cookies();
  const token = jar.get("miyaru_session")?.value ?? null;
  const c = getContainer();
  const user = await c.auth.getUserByToken(token);
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const tenants = c.tenants.listForUser(user.id);
  // Super admin không thuộc tenant nào vẫn vào được (platform)
  if (tenants.length === 0 && !user.isSuperAdmin) {
    redirect("/login?error=no_workspace");
  }

  let activeTenant =
    (preferredTenantId ? tenants.find((t) => t.id === preferredTenantId) : null) ??
    tenants[0] ??
    null;

  // Super admin không có membership: fallback tenant đầu tiên trong store (chỉ để scope UI)
  if (!activeTenant && user.isSuperAdmin) {
    const { getMemoryStore } = await import("@/infrastructure/memory/store");
    activeTenant = getMemoryStore().tenants[0] ?? null;
  }

  if (!activeTenant) {
    redirect("/login?error=no_workspace");
  }

  // Non-super-admin: phải là member active
  if (!user.isSuperAdmin) {
    c.tenants.assertMember(activeTenant.id, user.id);
  }

  const access = c.access.resolve(user, activeTenant.id);

  return {
    user,
    tenants,
    activeTenant,
    access,
    isSuperAdmin: Boolean(user.isSuperAdmin),
    roleLabel: access.role ? ROLE_LABELS_VI[access.role] : "—",
    permissions: access.permissions,
  };
}

/** Scope helper: super admin xem all; user thường chỉ tenant của mình */
export function scopeTenantId(session: DashboardSession, tenantId?: string | null): string {
  if (session.isSuperAdmin && tenantId) return tenantId;
  return session.activeTenant.id;
}
