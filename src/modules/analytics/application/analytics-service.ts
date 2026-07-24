import { createId } from "@/core/types/ids";
import { getMemoryStore } from "@/infrastructure/memory/store";

export class AnalyticsService {
  private store() {
    return getMemoryStore();
  }

  async trackView(
    profileId: string,
    opts: { path?: string; userAgent?: string; referrer?: string; country?: string; city?: string },
  ) {
    const profile = this.store().profiles.find((p) => p.id === profileId);
    if (!profile) return null;
    const ts = new Date().toISOString();
    const event = {
      id: createId("evt"),
      profileId,
      eventType: "page_view",
      path: opts.path ?? null,
      referrer: opts.referrer ?? null,
      userAgent: opts.userAgent ?? null,
      country: opts.country ?? null,
      city: opts.city ?? null,
      metadata: {},
      createdAt: ts,
    };
    this.store().analyticsEvents.push(event);

    const day = ts.slice(0, 10);
    let daily = this.store().analyticsDaily.find((d) => d.profileId === profileId && d.date.startsWith(day));
    if (!daily) {
      daily = {
        id: createId("aday"),
        tenantId: profile.tenantId,
        profileId,
        date: `${day}T00:00:00.000Z`,
        views: 0,
        clicks: 0,
        uniques: 0,
      };
      this.store().analyticsDaily.push(daily);
    }
    daily.views += 1;
    daily.uniques += 1;
    return event;
  }

  async trackClick(profileId: string, targetUrl: string, label?: string) {
    const profile = this.store().profiles.find((p) => p.id === profileId);
    if (!profile) return null;
    const ts = new Date().toISOString();
    const event = {
      id: createId("evt"),
      profileId,
      eventType: "link_click",
      path: targetUrl,
      referrer: null,
      userAgent: null,
      country: null,
      city: null,
      metadata: { label: label ?? null },
      createdAt: ts,
    };
    this.store().analyticsEvents.push(event);
    const day = ts.slice(0, 10);
    let daily = this.store().analyticsDaily.find((d) => d.profileId === profileId && d.date.startsWith(day));
    if (!daily) {
      daily = {
        id: createId("aday"),
        tenantId: profile.tenantId,
        profileId,
        date: `${day}T00:00:00.000Z`,
        views: 0,
        clicks: 0,
        uniques: 0,
      };
      this.store().analyticsDaily.push(daily);
    }
    daily.clicks += 1;
    return event;
  }

  summary(profileId: string) {
    const events = this.store().analyticsEvents.filter((e) => e.profileId === profileId);
    const daily = this.store().analyticsDaily.filter((d) => d.profileId === profileId);
    return {
      totalViews: events.filter((e) => e.eventType === "page_view").length,
      totalClicks: events.filter((e) => e.eventType === "link_click").length,
      daily,
      recent: events.slice(-50).reverse(),
    };
  }

  tenantSummary(tenantId: string) {
    const profileIds = this.store()
      .profiles.filter((p) => p.tenantId === tenantId)
      .map((p) => p.id);
    const events = this.store().analyticsEvents.filter((e) => profileIds.includes(e.profileId));
    return {
      totalViews: events.filter((e) => e.eventType === "page_view").length,
      totalClicks: events.filter((e) => e.eventType === "link_click").length,
      profiles: profileIds.length,
    };
  }
}
