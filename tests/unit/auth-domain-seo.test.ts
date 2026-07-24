import { beforeEach, describe, expect, it } from "vitest";
import { resetMemoryStore, getMemoryStore } from "@/infrastructure/memory/store";
import { resetContainer, getContainer } from "@/core/di/container";

describe("Auth Domain SEO services", () => {
  beforeEach(() => {
    resetMemoryStore(true);
    resetContainer();
  });

  it("logs in seed user", async () => {
    const result = await getContainer().auth.login({
      email: "miyaru2k5@gmail.com",
      password: "demo1234",
    });
    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe("miyaru2k5@gmail.com");
  });

  it("registers a new user and tenant", async () => {
    const result = await getContainer().auth.register({
      email: "new@example.com",
      name: "New User",
      password: "password123",
      tenantName: "New Co",
    });
    expect(result.tenant.slug).toContain("new");
    expect(result.user.email).toBe("new@example.com");
  });

  it("creates and verifies a custom domain", () => {
    const tenant = getMemoryStore().tenants[0];
    const domain = getContainer().domains.create({
      tenantId: tenant.id,
      hostname: "brand.example.com",
      type: "CUSTOM",
      profileId: getMemoryStore().profiles[0].id,
    });
    expect(domain.status).toBe("PENDING");
    const verified = getContainer().domains.verify(domain.id, domain.verificationToken ?? undefined);
    expect(verified.status).toBe("ACTIVE");
  });

  it("builds SEO metadata with JSON-LD", async () => {
    const aggregate = await getContainer().profiles.getPublicBySlug("miyaru");
    const meta = getContainer().seo.buildMetadata(aggregate);
    expect(meta.title).toMatch(/Miyaru/);
    expect(meta.canonical).toBe("https://miyaru.online/");
    expect(meta.jsonLd).toHaveProperty("@graph");
  });

  it("resolves primary domain host to seed profile", async () => {
    const aggregate = await getContainer().profiles.getPublicByHostname("miyaru.online");
    expect(aggregate.profile.slug).toBe("miyaru");
    const meta = getContainer().seo.buildMetadata(aggregate, "miyaru.online");
    expect(meta.canonical).toBe("https://miyaru.online/");
  });
});
