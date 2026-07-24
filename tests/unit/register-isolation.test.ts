import { beforeEach, describe, expect, it } from "vitest";
import { resetMemoryStore, getMemoryStore } from "@/infrastructure/memory/store";
import { resetContainer, getContainer } from "@/core/di/container";

describe("Đăng ký tài khoản mới — không phải super admin", () => {
  beforeEach(() => {
    resetMemoryStore(true);
    resetContainer();
  });

  it("user mới isSuperAdmin=false và chỉ thuộc workspace riêng", async () => {
    const c = getContainer();
    const result = await c.auth.register({
      email: "newbie@example.com",
      name: "Người Mới",
      password: "password123",
      tenantName: "Workspace Newbie",
    });

    expect(result.user.isSuperAdmin).toBe(false);
    expect(result.tenant.slug).toMatch(/workspace-newbie|newbie/);

    const stored = getMemoryStore().users.find((u) => u.email === "newbie@example.com");
    expect(stored?.isSuperAdmin).toBe(false);

    const tenants = c.tenants.listForUser(result.user.id);
    expect(tenants).toHaveLength(1);
    expect(tenants[0].id).toBe(result.tenant.id);

    // Không thấy profile seed miyaru trong tenant mới
    const profiles = getMemoryStore().profiles.filter((p) => p.tenantId === result.tenant.id);
    expect(profiles).toHaveLength(0);

    const ctx = c.access.resolve(stored!, result.tenant.id);
    expect(ctx.role).toBe("TENANT_OWNER");
    expect(c.access.can(ctx, "platform:admin")).toBe(false);
    expect(c.access.can(ctx, "profiles:create")).toBe(true);
  });

  it("user mới không resolve được tenant seed miyaru", async () => {
    const c = getContainer();
    const result = await c.auth.register({
      email: "other@example.com",
      name: "Other",
      password: "password123",
    });
    const miyaru = getMemoryStore().tenants.find((t) => t.slug === "miyaru")!;
    const user = getMemoryStore().users.find((u) => u.id === result.user.id)!;
    expect(() => c.access.resolve(user, miyaru.id)).toThrow(/không phải thành viên/i);
  });
});
