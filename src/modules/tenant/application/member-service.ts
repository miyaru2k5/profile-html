import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type Role, type TenantMemberRecord } from "@/infrastructure/memory/store";
import type { AccessControlService } from "@/modules/auth/application/access-control";
import type { AccessContext } from "@/modules/auth/application/access-control";
import { z } from "zod";

export const inviteMemberSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["TENANT_ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
  name: z.string().min(1).max(120).optional(),
});

export const updateMemberRoleSchema = z.object({
  tenantId: z.string().min(1),
  memberId: z.string().min(1),
  role: z.enum(["TENANT_ADMIN", "MEMBER", "VIEWER", "TENANT_OWNER"]),
});

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 1,
  MEMBER: 2,
  TENANT_ADMIN: 3,
  TENANT_OWNER: 4,
  SUPER_ADMIN: 5,
};

export class MemberService {
  constructor(private readonly access: AccessControlService) {}

  private store() {
    return getMemoryStore();
  }

  list(tenantId: string) {
    const members = this.store().members.filter((m) => m.tenantId === tenantId);
    return members.map((m) => {
      const user = this.store().users.find((u) => u.id === m.userId);
      return {
        ...m,
        user: user
          ? {
              id: user.id,
              email: user.email,
              name: user.name,
              avatarUrl: user.avatarUrl,
              isSuperAdmin: user.isSuperAdmin,
            }
          : null,
      };
    });
  }

  invite(ctx: AccessContext, input: z.infer<typeof inviteMemberSchema>) {
    this.access.assert(ctx, "members:invite");
    if (ctx.tenantId !== input.tenantId && !ctx.isSuperAdmin) {
      throw AppError.forbidden("Tenant không khớp");
    }

    this.assertCanAssignRole(ctx, input.role);

    const email = input.email.toLowerCase();
    let user = this.store().users.find((u) => u.email === email);
    const ts = new Date().toISOString();

    if (!user) {
      user = {
        id: createId("user"),
        email,
        name: input.name ?? email.split("@")[0],
        avatarUrl: null,
        supabaseId: null,
        locale: "vi",
        isSuperAdmin: false,
        passwordHash: "seed:demo1234",
        createdAt: ts,
        updatedAt: ts,
      };
      this.store().users.push(user);
    }

    const existing = this.store().members.find(
      (m) => m.tenantId === input.tenantId && m.userId === user!.id,
    );
    if (existing && existing.status === "ACTIVE") {
      throw AppError.conflict("Người dùng đã là thành viên workspace");
    }
    if (existing) {
      existing.status = "ACTIVE";
      existing.role = input.role;
      existing.joinedAt = ts;
      return existing;
    }

    const member: TenantMemberRecord = {
      id: createId("member"),
      tenantId: input.tenantId,
      userId: user.id,
      role: input.role,
      status: "ACTIVE",
      invitedAt: ts,
      joinedAt: ts,
    };
    this.store().members.push(member);
    return member;
  }

  updateRole(ctx: AccessContext, input: z.infer<typeof updateMemberRoleSchema>) {
    this.access.assert(ctx, "members:manage");
    const member = this.store().members.find(
      (m) => m.id === input.memberId && m.tenantId === input.tenantId,
    );
    if (!member) throw AppError.notFound("Thành viên", input.memberId);

    this.assertCanAssignRole(ctx, input.role);
    // Không cho hạ/xóa owner cuối cùng
    if (member.role === "TENANT_OWNER" && input.role !== "TENANT_OWNER") {
      const owners = this.store().members.filter(
        (m) =>
          m.tenantId === input.tenantId &&
          m.role === "TENANT_OWNER" &&
          m.status === "ACTIVE" &&
          m.id !== member.id,
      );
      if (owners.length === 0) {
        throw AppError.validation("Phải còn ít nhất một chủ workspace");
      }
    }

    member.role = input.role;
    return member;
  }

  remove(ctx: AccessContext, tenantId: string, memberId: string) {
    this.access.assert(ctx, "members:manage");
    const member = this.store().members.find((m) => m.id === memberId && m.tenantId === tenantId);
    if (!member) throw AppError.notFound("Thành viên", memberId);

    if (member.userId === ctx.user.id) {
      throw AppError.validation("Không thể tự xóa chính mình");
    }

    if (member.role === "TENANT_OWNER") {
      const owners = this.store().members.filter(
        (m) =>
          m.tenantId === tenantId &&
          m.role === "TENANT_OWNER" &&
          m.status === "ACTIVE" &&
          m.id !== member.id,
      );
      if (owners.length === 0) {
        throw AppError.validation("Không thể xóa chủ workspace cuối cùng");
      }
    }

    // Actor phải có rank cao hơn target (trừ super admin)
    if (!ctx.isSuperAdmin && ctx.role) {
      if (ROLE_RANK[ctx.role] <= ROLE_RANK[member.role]) {
        throw AppError.forbidden("Không thể xóa thành viên ngang hoặc cao hơn bạn");
      }
    }

    member.status = "REMOVED";
    return member;
  }

  private assertCanAssignRole(ctx: AccessContext, role: Role) {
    if (ctx.isSuperAdmin) return;
    if (role === "SUPER_ADMIN") {
      throw AppError.forbidden("Không thể gán vai trò siêu quản trị");
    }
    if (role === "TENANT_OWNER" && ctx.role !== "TENANT_OWNER") {
      throw AppError.forbidden("Chỉ chủ workspace mới được chuyển quyền sở hữu");
    }
    if (ctx.role && ROLE_RANK[role] > ROLE_RANK[ctx.role]) {
      throw AppError.forbidden("Không thể gán vai trò cao hơn vai trò của bạn");
    }
  }
}
