import { AppError } from "@/core/errors/app-error";
import { createId, slugify } from "@/core/types/ids";
import { getMemoryStore, type ProfileRecord } from "@/infrastructure/memory/store";
import type {
  CreateProfileInput,
  ProfileAggregate,
  ProfileRepository,
  UpdateProfileInput,
} from "@/modules/profile/domain/types";

export class MemoryProfileRepository implements ProfileRepository {
  private store() {
    return getMemoryStore();
  }

  async findById(id: string): Promise<ProfileRecord | null> {
    return this.store().profiles.find((p) => p.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<ProfileRecord | null> {
    return this.store().profiles.find((p) => p.slug === slug) ?? null;
  }

  async findByHostname(hostname: string): Promise<ProfileRecord | null> {
    const host = hostname.toLowerCase().split(":")[0];
    const domain = this.store().domains.find(
      (d) => d.hostname.toLowerCase() === host && d.status === "ACTIVE" && d.profileId,
    );
    if (!domain?.profileId) return null;
    return this.findById(domain.profileId);
  }

  async listByTenant(tenantId: string): Promise<ProfileRecord[]> {
    return this.store()
      .profiles.filter((p) => p.tenantId === tenantId)
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async create(input: CreateProfileInput): Promise<ProfileRecord> {
    const slug = slugify(input.slug);
    if (!slug) throw AppError.validation("Slug không hợp lệ");
    if (await this.findBySlug(slug)) throw AppError.conflict(`Slug '${slug}' đã được sử dụng`);

    const ts = new Date().toISOString();
    const profile: ProfileRecord = {
      id: createId("profile"),
      tenantId: input.tenantId,
      ownerId: input.ownerId,
      slug,
      displayName: input.displayName,
      handle: input.handle ?? null,
      headline: input.headline ?? null,
      bio: input.bio ?? null,
      avatarUrl: input.avatarUrl ?? null,
      bannerUrl: input.bannerUrl ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      location: input.location ?? null,
      locale: input.locale ?? "vi",
      status: "DRAFT",
      themeId: input.themeId ?? null,
      templateId: input.templateId ?? null,
      isPrimary: false,
      publishedAt: null,
      settings: {},
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      seoKeywords: input.seoKeywords ?? null,
      ogImageUrl: input.ogImageUrl ?? null,
      twitterHandle: input.twitterHandle ?? null,
      jsonLd: null,
      createdAt: ts,
      updatedAt: ts,
    };
    this.store().profiles.push(profile);
    return profile;
  }

  async update(id: string, input: UpdateProfileInput): Promise<ProfileRecord> {
    const profile = await this.findById(id);
    if (!profile) throw AppError.notFound("Profile", id);

    Object.assign(profile, {
      ...input,
      updatedAt: new Date().toISOString(),
    });

    if (input.status === "PUBLISHED" && !profile.publishedAt) {
      profile.publishedAt = new Date().toISOString();
    }

    return profile;
  }

  async delete(id: string): Promise<void> {
    const s = this.store();
    s.profiles = s.profiles.filter((p) => p.id !== id);
    s.socialLinks = s.socialLinks.filter((x) => x.profileId !== id);
    s.quickLinks = s.quickLinks.filter((x) => x.profileId !== id);
    s.stats = s.stats.filter((x) => x.profileId !== id);
    s.tags = s.tags.filter((x) => x.profileId !== id);
    s.timeline = s.timeline.filter((x) => x.profileId !== id);
    s.blocks = s.blocks.filter((x) => x.profileId !== id);
    s.qrCodes = s.qrCodes.filter((x) => x.profileId !== id);
    s.domains = s.domains.map((d) =>
      d.profileId === id ? { ...d, profileId: null } : d,
    );
  }

  private buildAggregate(profile: ProfileRecord): ProfileAggregate {
    const s = this.store();
    return {
      profile,
      socialLinks: s.socialLinks
        .filter((x) => x.profileId === profile.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      quickLinks: s.quickLinks
        .filter((x) => x.profileId === profile.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      stats: s.stats
        .filter((x) => x.profileId === profile.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      tags: s.tags
        .filter((x) => x.profileId === profile.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      timeline: s.timeline
        .filter((x) => x.profileId === profile.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      theme: s.themes.find((t) => t.id === profile.themeId) ?? null,
      template: s.templates.find((t) => t.id === profile.templateId) ?? null,
      domains: s.domains.filter((d) => d.profileId === profile.id),
      blocks: s.blocks
        .filter((b) => b.profileId === profile.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
      qrCodes: s.qrCodes.filter((q) => q.profileId === profile.id),
    };
  }

  async getAggregate(id: string): Promise<ProfileAggregate | null> {
    const profile = await this.findById(id);
    return profile ? this.buildAggregate(profile) : null;
  }

  async getAggregateBySlug(slug: string): Promise<ProfileAggregate | null> {
    const profile = await this.findBySlug(slug);
    return profile ? this.buildAggregate(profile) : null;
  }

  async getAggregateByHostname(hostname: string): Promise<ProfileAggregate | null> {
    const profile = await this.findByHostname(hostname);
    return profile ? this.buildAggregate(profile) : null;
  }
}
