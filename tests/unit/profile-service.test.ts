import { beforeEach, describe, expect, it } from "vitest";
import { resetMemoryStore } from "@/infrastructure/memory/store";
import { resetContainer } from "@/core/di/container";

describe("ProfileService", () => {
  beforeEach(() => {
    resetMemoryStore(true);
    resetContainer();
  });

  it("returns published seed profile by slug", async () => {
    const { getContainer } = await import("@/core/di/container");
    const aggregate = await getContainer().profiles.getPublicBySlug("miyaru");
    expect(aggregate.profile.displayName).toBe("Miyaru Yue");
    expect(aggregate.socialLinks.length).toBeGreaterThan(0);
    expect(aggregate.quickLinks.length).toBeGreaterThan(0);
    expect(aggregate.timeline.length).toBe(5);
  });

  it("creates and publishes a new profile", async () => {
    const { getContainer } = await import("@/core/di/container");
    const c = getContainer();
    const tenant = c.tenants.listForUser(
      (await import("@/infrastructure/memory/store")).getMemoryStore().users[0].id,
    )[0];
    const ownerId = tenant.ownerId;
    const created = await c.profiles.create({
      tenantId: tenant.id,
      ownerId,
      slug: "demo-brand",
      displayName: "Demo Brand",
      bio: "A demo profile",
    });
    expect(created.status).toBe("DRAFT");
    const published = await c.profiles.publish(created.id, ownerId);
    expect(published.status).toBe("PUBLISHED");
    const publicProfile = await c.profiles.getPublicBySlug("demo-brand");
    expect(publicProfile.profile.displayName).toBe("Demo Brand");
  });

  it("rejects unknown public slug", async () => {
    const { getContainer } = await import("@/core/di/container");
    await expect(getContainer().profiles.getPublicBySlug("missing-slug")).rejects.toThrow(
      /không tìm thấy/i,
    );
  });
});
