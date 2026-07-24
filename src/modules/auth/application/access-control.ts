import { AppError } from "@/core/errors/app-error";
import { getMemoryStore, type Role, type TenantMemberRecord, type UserRecord } from "@/infrastructure/memory/store";
import {
  permissionsForRole,
  roleHasPermission,
  type Permission,
} from "@/modules/auth/domain/permissions";

export type AccessContext = {
  user: UserRecord;
  tenantId: string | null;
  role: Role | null;
  member: TenantMemberRecord | null;
  permissions: Permission[];
  isSuperAdmin: boolean;
};

export class AccessControlService {
  private store() {
    return getMemoryStore();
  }

  resolve(user: UserRecord, tenantId?: string | null): AccessContext {
    const isSuperAdmin = Boolean(user.isSuperAdmin);

    if (!tenantId) {
      return {
        user,
        tenantId: null,
        role: isSuperAdmin ? "SUPER_ADMIN" : null,
        member: null,
        permissions: isSuperAdmin ? permissionsForRole("SUPER_ADMIN", true) : ["tenants:create"],
        isSuperAdmin,
      };
    }

    const member =
      this.store().members.find(
        (m) => m.tenantId === tenantId && m.userId === user.id && m.status === "ACTIVE",
      ) ?? null;

    if (!member && !isSuperAdmin) {
      throw AppError.forbidden("Bạn không phải thành viên workspace này");
    }

    const role: Role = isSuperAdmin ? "SUPER_ADMIN" : (member?.role ?? "VIEWER");
    return {
      user,
      tenantId,
      role,
      member,
      permissions: permissionsForRole(role, isSuperAdmin),
      isSuperAdmin,
    };
  }

  can(ctx: AccessContext, permission: Permission): boolean {
    if (ctx.isSuperAdmin) return true;
    return ctx.permissions.includes(permission);
  }

  assert(ctx: AccessContext, permission: Permission, message?: string): void {
    if (!this.can(ctx, permission)) {
      throw AppError.forbidden(
        message ?? `Bạn không có quyền: ${permission}`,
      );
    }
  }

  assertAny(ctx: AccessContext, permissions: Permission[], message?: string): void {
    if (permissions.some((p) => this.can(ctx, p))) return;
    throw AppError.forbidden(message ?? `Bạn không có quyền: ${permissions.join(" | ")}`);
  }

  assertAll(ctx: AccessContext, permissions: Permission[], message?: string): void {
    for (const p of permissions) this.assert(ctx, p, message);
  }

  /** Kiểm tra role membership trực tiếp (không qua permission string) */
  assertMinRole(ctx: AccessContext, minRole: Role): void {
    const order: Role[] = ["VIEWER", "MEMBER", "TENANT_ADMIN", "TENANT_OWNER", "SUPER_ADMIN"];
    const have = ctx.isSuperAdmin ? "SUPER_ADMIN" : ctx.role;
    if (!have) throw AppError.forbidden("Thiếu vai trò trong workspace");
    if (order.indexOf(have) < order.indexOf(minRole)) {
      throw AppError.forbidden(`Yêu cầu vai trò tối thiểu: ${minRole}`);
    }
  }

  listPermissions(role: Role, isSuperAdmin = false): Permission[] {
    return permissionsForRole(role, isSuperAdmin);
  }

  checkRolePermission(role: Role, permission: Permission, isSuperAdmin = false): boolean {
    return roleHasPermission(role, permission, isSuperAdmin);
  }
}
