import { AppError } from "@/core/errors/app-error";
import type { ActivityLogService } from "@/modules/activity-log/application/activity-log-service";
import type { AnalyticsService } from "@/modules/analytics/application/analytics-service";
import type { AuditLogService } from "@/modules/audit-log/application/audit-log-service";
import type { CreateProfileDto, UpdateProfileDto } from "@/modules/profile/application/dto";
import type { ProfileRepository } from "@/modules/profile/domain/types";
import type { SeoService } from "@/modules/seo/application/seo-service";
import type { QrService } from "@/modules/profile/application/qr-service";

export class ProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly seo: SeoService,
    private readonly qr: QrService,
    private readonly activity: ActivityLogService,
    private readonly audit: AuditLogService,
    private readonly analytics: AnalyticsService,
  ) {}

  listByTenant(tenantId: string) {
    return this.profiles.listByTenant(tenantId);
  }

  async getById(id: string) {
    const aggregate = await this.profiles.getAggregate(id);
    if (!aggregate) throw AppError.notFound("Profile", id);
    return aggregate;
  }

  async getPublicBySlug(slug: string, opts?: { track?: boolean; path?: string; ua?: string; ref?: string }) {
    const aggregate = await this.profiles.getAggregateBySlug(slug);
    if (!aggregate || aggregate.profile.status !== "PUBLISHED") {
      throw AppError.notFound("Profile", slug);
    }
    if (opts?.track) {
      await this.analytics.trackView(aggregate.profile.id, {
        path: opts.path ?? `/profile/${slug}`,
        userAgent: opts.ua,
        referrer: opts.ref,
      });
    }
    return aggregate;
  }

  async getPublicByHostname(hostname: string, opts?: { track?: boolean; path?: string; ua?: string; ref?: string }) {
    const aggregate = await this.profiles.getAggregateByHostname(hostname);
    if (!aggregate || aggregate.profile.status !== "PUBLISHED") {
      throw AppError.notFound("Profile theo host", hostname);
    }
    if (opts?.track) {
      await this.analytics.trackView(aggregate.profile.id, {
        path: opts.path ?? "/",
        userAgent: opts.ua,
        referrer: opts.ref,
      });
    }
    return aggregate;
  }

  async create(input: CreateProfileDto, actorId?: string) {
    const profile = await this.profiles.create({
      ...input,
      avatarUrl: input.avatarUrl || null,
      bannerUrl: input.bannerUrl || null,
      email: input.email || null,
      ogImageUrl: input.ogImageUrl || null,
    });
    await this.activity.log({
      tenantId: profile.tenantId,
      userId: actorId ?? profile.ownerId,
      action: "profile.created",
      entity: "Profile",
      entityId: profile.id,
    });
    await this.audit.record({
      tenantId: profile.tenantId,
      actorId: actorId ?? profile.ownerId,
      action: "create",
      resource: "Profile",
      resourceId: profile.id,
      after: profile as unknown as Record<string, unknown>,
    });
    return profile;
  }

  async update(id: string, input: UpdateProfileDto, actorId?: string) {
    const before = await this.profiles.findById(id);
    if (!before) throw AppError.notFound("Profile", id);

    const profile = await this.profiles.update(id, {
      ...input,
      avatarUrl: input.avatarUrl === "" ? null : input.avatarUrl,
      bannerUrl: input.bannerUrl === "" ? null : input.bannerUrl,
      email: input.email === "" ? null : input.email,
      ogImageUrl: input.ogImageUrl === "" ? null : input.ogImageUrl,
    });

    if (profile.status === "PUBLISHED") {
      const aggregate = await this.profiles.getAggregate(id);
      if (aggregate) {
        const meta = this.seo.buildMetadata(aggregate);
        await this.profiles.update(id, { jsonLd: meta.jsonLd as Record<string, unknown> });
        await this.qr.ensureDefault(profile.id, meta.canonical);
      }
    }

    await this.activity.log({
      tenantId: profile.tenantId,
      userId: actorId ?? profile.ownerId,
      action: "profile.updated",
      entity: "Profile",
      entityId: profile.id,
      metadata: { fields: Object.keys(input) },
    });
    await this.audit.record({
      tenantId: profile.tenantId,
      actorId: actorId ?? profile.ownerId,
      action: "update",
      resource: "Profile",
      resourceId: profile.id,
      before: before as unknown as Record<string, unknown>,
      after: profile as unknown as Record<string, unknown>,
    });
    return profile;
  }

  async publish(id: string, actorId?: string) {
    return this.update(id, { status: "PUBLISHED" }, actorId);
  }

  async remove(id: string, actorId?: string) {
    const before = await this.profiles.findById(id);
    if (!before) throw AppError.notFound("Profile", id);
    await this.profiles.delete(id);
    await this.activity.log({
      tenantId: before.tenantId,
      userId: actorId ?? before.ownerId,
      action: "profile.deleted",
      entity: "Profile",
      entityId: id,
    });
    await this.audit.record({
      tenantId: before.tenantId,
      actorId: actorId ?? before.ownerId,
      action: "delete",
      resource: "Profile",
      resourceId: id,
      before: before as unknown as Record<string, unknown>,
    });
  }
}
