import { beforeEach, describe, expect, it } from "vitest";
import { resetMemoryStore, getMemoryStore } from "@/infrastructure/memory/store";
import { resetContainer, getContainer } from "@/core/di/container";
import { ROLE_PERMISSIONS } from "@/modules/auth/domain/permissions";

describe("RBAC / phân quyền", () => {
  beforeEach(() => {
    resetMemoryStore(true);
    resetContainer();
  });

  it("SUPER_ADMIN / owner có full quyền tenant", () => {
    const c = getContainer();
    const owner = getMemoryStore().users.find((u) => u.email === "miyaru2k5@gmail.com")!;
    const tenant = getMemoryStore().tenants[0];
    const ctx = c.access.resolve(owner, tenant.id);
    expect(ctx.isSuperAdmin).toBe(true);
    expect(c.access.can(ctx, "billing:manage")).toBe(true);
    expect(c.access.can(ctx, "members:manage")).toBe(true);
    expect(c.access.can(ctx, "platform:admin")).toBe(true);
  });

  it("VIEWER chỉ được đọc, không tạo/xóa profile", () => {
    const c = getContainer();
    const viewer = getMemoryStore().users.find((u) => u.email === "viewer@miyaru.online")!;
    const tenant = getMemoryStore().tenants[0];
    const ctx = c.access.resolve(viewer, tenant.id);
    expect(ctx.role).toBe("VIEWER");
    expect(c.access.can(ctx, "profiles:read")).toBe(true);
    expect(c.access.can(ctx, "profiles:create")).toBe(false);
    expect(c.access.can(ctx, "profiles:delete")).toBe(false);
    expect(c.access.can(ctx, "billing:manage")).toBe(false);
    expect(c.access.can(ctx, "ai:use")).toBe(false);
  });

  it("MEMBER được tạo profile và AI, không quản lý billing/members", () => {
    const c = getContainer();
    const member = getMemoryStore().users.find((u) => u.email === "member@miyaru.online")!;
    const tenant = getMemoryStore().tenants[0];
    const ctx = c.access.resolve(member, tenant.id);
    expect(ctx.role).toBe("MEMBER");
    expect(c.access.can(ctx, "profiles:create")).toBe(true);
    expect(c.access.can(ctx, "ai:use")).toBe(true);
    expect(c.access.can(ctx, "billing:manage")).toBe(false);
    expect(c.access.can(ctx, "members:manage")).toBe(false);
  });

  it("TENANT_ADMIN không được billing:manage nhưng có members:invite", () => {
    const c = getContainer();
    const admin = getMemoryStore().users.find((u) => u.email === "admin@miyaru.online")!;
    const tenant = getMemoryStore().tenants[0];
    const ctx = c.access.resolve(admin, tenant.id);
    expect(ctx.role).toBe("TENANT_ADMIN");
    expect(c.access.can(ctx, "members:invite")).toBe(true);
    expect(c.access.can(ctx, "billing:manage")).toBe(false);
    expect(c.access.can(ctx, "profiles:delete")).toBe(true);
  });

  it("assert ném forbidden khi thiếu quyền", () => {
    const c = getContainer();
    const viewer = getMemoryStore().users.find((u) => u.email === "viewer@miyaru.online")!;
    const tenant = getMemoryStore().tenants[0];
    const ctx = c.access.resolve(viewer, tenant.id);
    expect(() => c.access.assert(ctx, "profiles:delete")).toThrow(/không có quyền/i);
  });

  it("user ngoài tenant bị forbidden", () => {
    const c = getContainer();
    const outsider = getMemoryStore().users.find((u) => u.email === "viewer@miyaru.online")!;
    expect(() => c.access.resolve(outsider, "tenant_khong_ton_tai")).toThrow(/không phải thành viên/i);
  });

  it("ma trận role có VIEWER subset MEMBER", () => {
    for (const p of ROLE_PERMISSIONS.VIEWER) {
      expect(ROLE_PERMISSIONS.MEMBER).toContain(p);
    }
  });

  it("mời member cần members:invite", () => {
    const c = getContainer();
    const viewer = getMemoryStore().users.find((u) => u.email === "viewer@miyaru.online")!;
    const tenant = getMemoryStore().tenants[0];
    const ctx = c.access.resolve(viewer, tenant.id);
    expect(() =>
      c.members.invite(ctx, {
        tenantId: tenant.id,
        email: "new@example.com",
        role: "MEMBER",
      }),
    ).toThrow(/không có quyền/i);
  });

  it("owner mời được member mới", () => {
    const c = getContainer();
    const owner = getMemoryStore().users.find((u) => u.email === "miyaru2k5@gmail.com")!;
    const tenant = getMemoryStore().tenants[0];
    const ctx = c.access.resolve(owner, tenant.id);
    const member = c.members.invite(ctx, {
      tenantId: tenant.id,
      email: "moi@example.com",
      role: "MEMBER",
      name: "Người mới",
    });
    expect(member.role).toBe("MEMBER");
    expect(getMemoryStore().users.some((u) => u.email === "moi@example.com")).toBe(true);
  });
});
