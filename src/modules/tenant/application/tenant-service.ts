import { AppError } from "@/core/errors/app-error";
import { createId, slugify } from "@/core/types/ids";
import { getMemoryStore, type TenantRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(64).optional(),
  ownerId: z.string().min(1),
});

export class TenantService {
  private store() {
    return getMemoryStore();
  }

  listForUser(userId: string) {
    const memberTenantIds = this.store()
      .members.filter((m) => m.userId === userId && m.status === "ACTIVE")
      .map((m) => m.tenantId);
    return this.store().tenants.filter((t) => memberTenantIds.includes(t.id));
  }

  getById(id: string) {
    const tenant = this.store().tenants.find((t) => t.id === id);
    if (!tenant) throw AppError.notFound("Tenant", id);
    return tenant;
  }

  getBySlug(slug: string) {
    const tenant = this.store().tenants.find((t) => t.slug === slug);
    if (!tenant) throw AppError.notFound("Tenant", slug);
    return tenant;
  }

  create(input: z.infer<typeof createTenantSchema>) {
    const slug = slugify(input.slug ?? input.name);
    if (this.store().tenants.some((t) => t.slug === slug)) {
      throw AppError.conflict(`Slug tenant '${slug}' đã tồn tại`);
    }
    const ts = new Date().toISOString();
    const freePlan = this.store().plans.find((p) => p.code === "free");
    const tenant: TenantRecord = {
      id: createId("tenant"),
      name: input.name,
      slug,
      ownerId: input.ownerId,
      logoUrl: null,
      planId: freePlan?.id ?? null,
      status: "active",
      settings: {},
      createdAt: ts,
      updatedAt: ts,
    };
    this.store().tenants.push(tenant);
    this.store().members.push({
      id: createId("member"),
      tenantId: tenant.id,
      userId: input.ownerId,
      role: "TENANT_OWNER",
      status: "ACTIVE",
      invitedAt: ts,
      joinedAt: ts,
    });
    return tenant;
  }

  listMembers(tenantId: string) {
    return this.store().members.filter((m) => m.tenantId === tenantId);
  }

  assertMember(tenantId: string, userId: string) {
    const member = this.store().members.find(
      (m) => m.tenantId === tenantId && m.userId === userId && m.status === "ACTIVE",
    );
    if (!member) throw AppError.forbidden("Bạn không phải thành viên workspace");
    return member;
  }
}
