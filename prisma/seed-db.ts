/**
 * Seed Postgres (Supabase) — tối thiểu 5 bản ghi mỗi bảng.
 * Chạy: npx tsx prisma/seed-db.ts
 */
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createId } from "../src/core/types/ids";

const N = 5;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Thiếu DATABASE_URL");
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("→ Kết nối DB...");
  await prisma.$connect();

  console.log("→ Xóa dữ liệu cũ (cascade-safe order)...");
  // Child → parent
  await prisma.aiMessage.deleteMany();
  await prisma.aiSession.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.marketplaceItem.deleteMany();
  await prisma.tenantPlugin.deleteMany();
  await prisma.plugin.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.crmLead.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.analyticsDaily.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.pageBlock.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.timelineItem.deleteMany();
  await prisma.profileTag.deleteMany();
  await prisma.profileStat.deleteMany();
  await prisma.quickLink.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.profileI18n.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.template.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.session.deleteMany();
  await prisma.tenantMember.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ Seed Plans (5)...");
  const planDefs = [
    { code: "free", name: "Free", priceCents: 0, maxProfiles: 3, maxMembers: 2, maxDomains: 1 },
    { code: "starter", name: "Starter", priceCents: 9900000, maxProfiles: 10, maxMembers: 5, maxDomains: 3 },
    { code: "pro", name: "Pro", priceCents: 29900000, maxProfiles: 1000, maxMembers: 50, maxDomains: 100 },
    { code: "business", name: "Business", priceCents: 79900000, maxProfiles: 5000, maxMembers: 200, maxDomains: 500 },
    { code: "enterprise", name: "Enterprise", priceCents: 199900000, maxProfiles: 99999, maxMembers: 9999, maxDomains: 9999 },
  ];
  const plans = [];
  for (const p of planDefs) {
    plans.push(
      await prisma.plan.create({
        data: {
          id: createId("plan"),
          code: p.code,
          name: p.name,
          description: `Gói ${p.name}`,
          priceCents: p.priceCents,
          currency: "VND",
          interval: "MONTHLY",
          features: { analytics: true },
          maxProfiles: p.maxProfiles,
          maxMembers: p.maxMembers,
          maxDomains: p.maxDomains,
          isActive: true,
        },
      }),
    );
  }

  console.log("→ Seed Users (5)...");
  const userDefs = [
    { email: "miyaru2k5@gmail.com", name: "Miyaru Yue", isSuperAdmin: true },
    { email: "admin@miyaru.online", name: "Quản trị viên", isSuperAdmin: false },
    { email: "member@miyaru.online", name: "Thành viên", isSuperAdmin: false },
    { email: "viewer@miyaru.online", name: "Chỉ xem", isSuperAdmin: false },
    { email: "editor@miyaru.online", name: "Biên tập viên", isSuperAdmin: false },
  ];
  const users = [];
  for (let i = 0; i < N; i++) {
    const u = userDefs[i];
    users.push(
      await prisma.user.create({
        data: {
          id: createId("user"),
          email: u.email,
          name: u.name,
          isSuperAdmin: u.isSuperAdmin,
          locale: "vi",
          avatarUrl:
            i === 0
              ? "https://s240-ava-talk.zadn.vn/5/1/5/9/3/240/8008f8072cdfc9f872a0c905e2e70595.jpg"
              : null,
          supabaseId: i === 0 ? "seed-supabase-miyaru" : null,
        },
      }),
    );
  }
  const owner = users[0];

  console.log("→ Seed Tenants (5)...");
  const tenantNames = [
    { name: "Miyaru Online", slug: "miyaru" },
    { name: "Studio Cam", slug: "studio-cam" },
    { name: "Agency Bắc", slug: "agency-bac" },
    { name: "Brand Lab", slug: "brand-lab" },
    { name: "Growth Hub", slug: "growth-hub" },
  ];
  const tenants = [];
  for (let i = 0; i < N; i++) {
    tenants.push(
      await prisma.tenant.create({
        data: {
          id: createId("tenant"),
          name: tenantNames[i].name,
          slug: tenantNames[i].slug,
          ownerId: owner.id,
          planId: plans[i].id,
          status: "active",
          settings: { brandColor: "#ff7a00" },
          logoUrl: owner.avatarUrl,
        },
      }),
    );
  }
  const mainTenant = tenants[0];

  console.log("→ Seed TenantMembers (5)...");
  const roles = ["TENANT_OWNER", "TENANT_ADMIN", "MEMBER", "VIEWER", "MEMBER"] as const;
  for (let i = 0; i < N; i++) {
    await prisma.tenantMember.create({
      data: {
        id: createId("member"),
        tenantId: mainTenant.id,
        userId: users[i].id,
        role: roles[i],
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    });
  }

  console.log("→ Seed Sessions (5)...");
  for (let i = 0; i < N; i++) {
    const exp = new Date();
    exp.setDate(exp.getDate() + 30);
    await prisma.session.create({
      data: {
        id: createId("sess"),
        userId: users[i].id,
        token: `seed-db-token-${i + 1}-${createId("tok")}`,
        expiresAt: exp,
      },
    });
  }

  console.log("→ Seed Themes (5)...");
  const themeColors = ["#ff7a00", "#7c3aed", "#10b981", "#f43f5e", "#334155"];
  const themes = [];
  for (let i = 0; i < N; i++) {
    themes.push(
      await prisma.theme.create({
        data: {
          id: createId("theme"),
          tenantId: i < 3 ? null : mainTenant.id,
          name: ["Miyaru Cam", "Đêm Tím", "Xanh Ngọc", "Hồng San Hô", "Xám Tối"][i],
          slug: ["miyaru-orange", "night-violet", "mint-green", "coral-pink", "slate-dark"][i],
          description: `Theme seed #${i + 1}`,
          isSystem: i < 3,
          isPublic: true,
          tokens: { primary: themeColors[i] },
        },
      }),
    );
  }

  console.log("→ Seed Templates (5)...");
  const templates = [];
  for (let i = 0; i < N; i++) {
    templates.push(
      await prisma.template.create({
        data: {
          id: createId("tpl"),
          tenantId: i < 3 ? null : mainTenant.id,
          name: ["Profile cổ điển", "Link-in-bio", "Agency", "Creator", "SME"][i],
          slug: ["classic-profile", "minimal-bio", "agency-portfolio", "creator-reels", "sme-landing"][i],
          description: `Template seed #${i + 1}`,
          isSystem: i < 3,
          isPublic: true,
          layout: { sections: ["hero", "links"], columns: 2 },
        },
      }),
    );
  }

  console.log("→ Seed Profiles (5)...");
  const profileDefs = [
    { slug: "miyaru", displayName: "Miyaru Yue", status: "PUBLISHED" as const, primary: true },
    { slug: "beauty-spa-demo", displayName: "Beauty Spa Demo", status: "PUBLISHED" as const, primary: false },
    { slug: "giapha-demo", displayName: "Gia Phả Demo", status: "PUBLISHED" as const, primary: false },
    { slug: "studio-cam", displayName: "Studio Cam", status: "DRAFT" as const, primary: false },
    { slug: "growth-lab", displayName: "Growth Lab", status: "ARCHIVED" as const, primary: false },
  ];
  const profiles = [];
  for (let i = 0; i < N; i++) {
    const p = profileDefs[i];
    profiles.push(
      await prisma.profile.create({
        data: {
          id: createId("profile"),
          tenantId: mainTenant.id,
          ownerId: owner.id,
          slug: p.slug,
          displayName: p.displayName,
          handle: p.slug,
          headline: `${p.displayName} · Digital`,
          bio: `Bio seed cho ${p.displayName}`,
          avatarUrl: owner.avatarUrl,
          bannerUrl: "https://cover-talk.zadn.vn/5/7/6/7/2/8008f8072cdfc9f872a0c905e2e70595.jpg",
          email: i === 0 ? "miyaru2k5@gmail.com" : null,
          phone: i === 0 ? "+84383277782" : null,
          location: "Việt Nam",
          locale: "vi",
          status: p.status,
          themeId: themes[i].id,
          templateId: templates[i].id,
          isPrimary: p.primary,
          publishedAt: p.status === "PUBLISHED" ? new Date() : null,
          settings: {},
          seoTitle: `${p.displayName} | Miyaru`,
          seoDescription: `Profile ${p.displayName}`,
        },
      }),
    );
  }
  const mainProfile = profiles[0];

  console.log("→ Seed SocialLink / QuickLink / Stat / Tag / Timeline / I18n (5 mỗi)...");
  for (let i = 0; i < N; i++) {
    await prisma.socialLink.create({
      data: {
        id: createId("soc"),
        profileId: mainProfile.id,
        platform: ["zalo", "facebook", "tiktok", "youtube", "telegram"][i],
        label: ["Zalo", "Facebook", "TikTok", "YouTube", "Telegram"][i],
        handle: ["0383277782", "yue.vn", "@yue.vn", "@yue-vn", "@yue_vn"][i],
        url: [
          "https://zalo.me/0383277782",
          "https://facebook.com/yue.vn",
          "https://tiktok.com/@yue.vn",
          "https://youtube.com/@yue-vn",
          "https://t.me/yue_vn",
        ][i],
        sortOrder: i,
        isVisible: true,
      },
    });
    await prisma.quickLink.create({
      data: {
        id: createId("link"),
        profileId: mainProfile.id,
        title: ["Beauty Spa", "Profile", "Admin", "Gia Phả", "Marketing"][i],
        description: `Liên kết mẫu #${i + 1}`,
        url: [
          "https://beautyspa.miyaru.online/",
          "https://miyaru.online/",
          "https://admin.miyaru.online",
          "https://giapha.miyaru.online/",
          "https://zalo.me/0383277782",
        ][i],
        priceLabel: i < 4 ? "Thiết kế giá:" : null,
        priceValue: i < 4 ? "99k" : null,
        isPriced: i < 4,
        sortOrder: i,
        isVisible: true,
      },
    });
    await prisma.profileStat.create({
      data: {
        id: createId("stat"),
        profileId: mainProfile.id,
        label: ["Khách hàng", "Theo dõi", "Kinh nghiệm", "Dự án", "Ads"][i],
        value: ["555+", "5M+", "5Y+", "120+", "300+"][i],
        sortOrder: i,
      },
    });
    await prisma.profileTag.create({
      data: {
        id: createId("tag"),
        profileId: mainProfile.id,
        label: ["Facebook Ads", "TikTok Ads", "SEO", "Branding", "Website"][i],
        sortOrder: i,
      },
    });
    await prisma.timelineItem.create({
      data: {
        id: createId("tl"),
        profileId: mainProfile.id,
        title: `Mốc sự nghiệp #${i + 1}`,
        description: `Mô tả timeline seed #${i + 1}`,
        badge: ["Hiện tại", "Dịch vụ", "Dịch vụ", "Khởi đầu", "Nền tảng"][i],
        period: ["2025", "2024", "2023", "2022", "2021"][i],
        sortOrder: i,
      },
    });
    await prisma.profileI18n.create({
      data: {
        id: createId("i18n"),
        profileId: mainProfile.id,
        locale: ["vi", "en", "ja", "ko", "zh"][i],
        displayName: mainProfile.displayName,
        headline: mainProfile.headline,
        bio: mainProfile.bio,
      },
    });
  }

  console.log("→ Seed Domains (5)...");
  const hosts = ["miyaru.online", "www.miyaru.online", "profile.miyaru.online", "localhost", "demo.miyaru.online"];
  for (let i = 0; i < N; i++) {
    await prisma.domain.create({
      data: {
        id: createId("dom"),
        tenantId: mainTenant.id,
        profileId: mainProfile.id,
        hostname: hosts[i],
        type: hosts[i] === "localhost" ? "SUBDOMAIN" : "CUSTOM",
        status: "ACTIVE",
        isPrimary: i === 0,
        verifiedAt: new Date(),
        sslStatus: "active",
      },
    });
  }

  console.log("→ Seed PageBlocks (5)...");
  const blockTypes = ["HERO", "LINKS", "SOCIAL", "TAGS", "TIMELINE"] as const;
  for (let i = 0; i < N; i++) {
    await prisma.pageBlock.create({
      data: {
        id: createId("blk"),
        tenantId: mainTenant.id,
        profileId: mainProfile.id,
        templateId: templates[0].id,
        type: blockTypes[i],
        title: `Block ${blockTypes[i]}`,
        content: { seed: true, i },
        sortOrder: i,
        isVisible: true,
      },
    });
  }

  console.log("→ Seed MediaAssets (5)...");
  for (let i = 0; i < N; i++) {
    await prisma.mediaAsset.create({
      data: {
        id: createId("media"),
        tenantId: mainTenant.id,
        profileId: mainProfile.id,
        uploadedBy: owner.id,
        kind: "IMAGE",
        filename: `seed-${i + 1}.jpg`,
        mimeType: "image/jpeg",
        sizeBytes: 100000 + i * 1000,
        storageKey: `${mainTenant.id}/seed-${i + 1}.jpg`,
        publicUrl: `https://miyaru.online/media/seed-${i + 1}.jpg`,
        width: 1200,
        height: 630,
        alt: `Ảnh seed ${i + 1}`,
      },
    });
  }

  console.log("→ Seed Analytics (5 events + 5 daily)...");
  for (let i = 0; i < N; i++) {
    await prisma.analyticsEvent.create({
      data: {
        id: createId("evt"),
        profileId: mainProfile.id,
        eventType: i % 2 === 0 ? "page_view" : "link_click",
        path: "/profile/miyaru",
        country: "VN",
        city: ["HCM", "HN", "DN", "CT", "HP"][i],
        metadata: { seed: true },
        createdAt: daysAgo(i),
      },
    });
    const day = daysAgo(i);
    day.setHours(0, 0, 0, 0);
    await prisma.analyticsDaily.create({
      data: {
        id: createId("aday"),
        tenantId: mainTenant.id,
        profileId: mainProfile.id,
        date: day,
        views: 50 + i * 10,
        clicks: 5 + i,
        uniques: 40 + i * 8,
      },
    });
  }

  console.log("→ Seed ActivityLog + AuditLog (5)...");
  for (let i = 0; i < N; i++) {
    await prisma.activityLog.create({
      data: {
        id: createId("act"),
        tenantId: mainTenant.id,
        userId: users[i].id,
        action: ["seed.completed", "profile.published", "domain.verified", "member.invited", "media.uploaded"][i],
        entity: "Profile",
        entityId: mainProfile.id,
        metadata: { seed: true },
        createdAt: daysAgo(i),
      },
    });
    await prisma.auditLog.create({
      data: {
        id: createId("audit"),
        tenantId: mainTenant.id,
        actorId: owner.id,
        action: ["create", "update", "publish", "invite", "upload"][i],
        resource: "Profile",
        resourceId: mainProfile.id,
        after: { seed: i },
        ip: `203.0.113.${10 + i}`,
        createdAt: daysAgo(i),
      },
    });
  }

  console.log("→ Seed Subscriptions + Invoices (5)...");
  for (let i = 0; i < N; i++) {
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    await prisma.subscription.create({
      data: {
        id: createId("sub"),
        tenantId: tenants[i].id,
        planId: plans[i].id,
        status: i === 1 ? "TRIALING" : "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: end,
      },
    });
    await prisma.invoice.create({
      data: {
        id: createId("inv"),
        tenantId: tenants[i].id,
        amountCents: plans[i].priceCents,
        currency: "VND",
        status: i === 1 ? "draft" : "paid",
        paidAt: i === 1 ? null : new Date(),
        metadata: { plan: plans[i].code },
      },
    });
  }

  console.log("→ Seed CrmLeads (5)...");
  const leadStatus = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;
  for (let i = 0; i < N; i++) {
    await prisma.crmLead.create({
      data: {
        id: createId("lead"),
        tenantId: mainTenant.id,
        ownerId: owner.id,
        name: ["Nguyễn An", "Trần Bình", "Lê Chi", "Phạm Dũng", "Hoàng Em"][i],
        email: `lead${i + 1}@example.com`,
        phone: `090000000${i}`,
        source: ["zalo", "facebook", "web", "tiktok", "referral"][i],
        status: leadStatus[i],
        notes: `Lead seed #${i + 1}`,
        metadata: {},
      },
    });
  }

  console.log("→ Seed Notifications (5)...");
  for (let i = 0; i < N; i++) {
    await prisma.notification.create({
      data: {
        id: createId("ntf"),
        tenantId: mainTenant.id,
        userId: owner.id,
        channel: "IN_APP",
        status: i < 2 ? "READ" : "SENT",
        title: `Thông báo seed #${i + 1}`,
        body: `Nội dung thông báo mẫu ${i + 1}`,
        payload: {},
        readAt: i < 2 ? new Date() : null,
      },
    });
  }

  console.log("→ Seed Plugins + TenantPlugin + Marketplace (5)...");
  const plugins = [];
  for (let i = 0; i < N; i++) {
    plugins.push(
      await prisma.plugin.create({
        data: {
          id: createId("plugin"),
          code: ["qr-boost", "seo-audit", "lead-form", "utm-tracker", "whatsapp-cta"][i],
          name: ["QR Boost", "SEO Audit", "Lead Form", "UTM Tracker", "WhatsApp CTA"][i],
          description: `Plugin seed #${i + 1}`,
          version: `1.${i}.0`,
          isPublic: true,
          manifest: {},
        },
      }),
    );
  }
  for (let i = 0; i < N; i++) {
    await prisma.tenantPlugin.create({
      data: {
        id: createId("tp"),
        tenantId: mainTenant.id,
        pluginId: plugins[i].id,
        status: i < 3 ? "ENABLED" : "INSTALLED",
        config: {},
      },
    });
  }
  for (let i = 0; i < N; i++) {
    await prisma.marketplaceItem.create({
      data: {
        id: createId("mp"),
        type: i < 3 ? "PLUGIN" : i === 3 ? "THEME" : "TEMPLATE",
        slug: i < 3 ? plugins[i].code : `item-${i + 1}`,
        title: i < 3 ? plugins[i].name : `Marketplace #${i + 1}`,
        description: `Marketplace seed #${i + 1}`,
        priceCents: i * 4900000,
        currency: "VND",
        pluginId: i < 3 ? plugins[i].id : null,
        metadata: {},
        isPublished: true,
      },
    });
  }

  console.log("→ Seed AiSession + AiMessage (5)...");
  for (let i = 0; i < N; i++) {
    const session = await prisma.aiSession.create({
      data: {
        id: createId("ai"),
        tenantId: mainTenant.id,
        userId: owner.id,
        title: `Phiên AI #${i + 1}`,
      },
    });
    await prisma.aiMessage.create({
      data: {
        id: createId("msg"),
        sessionId: session.id,
        role: i === 0 ? "SYSTEM" : i % 2 === 0 ? "USER" : "ASSISTANT",
        content: `Tin nhắn seed #${i + 1}`,
        metadata: {},
      },
    });
  }

  console.log("→ Seed QrCode (5)...");
  for (let i = 0; i < N; i++) {
    await prisma.qrCode.create({
      data: {
        id: createId("qr"),
        profileId: profiles[i].id,
        label: i === 0 ? "Default" : `QR #${i + 1}`,
        targetUrl: i === 0 ? "https://miyaru.online/" : `https://miyaru.online/profile/${profiles[i].slug}`,
      },
    });
  }

  // Counts
  const counts: Record<string, number> = {
    User: await prisma.user.count(),
    Session: await prisma.session.count(),
    Tenant: await prisma.tenant.count(),
    TenantMember: await prisma.tenantMember.count(),
    Plan: await prisma.plan.count(),
    Subscription: await prisma.subscription.count(),
    Invoice: await prisma.invoice.count(),
    Profile: await prisma.profile.count(),
    SocialLink: await prisma.socialLink.count(),
    QuickLink: await prisma.quickLink.count(),
    ProfileStat: await prisma.profileStat.count(),
    ProfileTag: await prisma.profileTag.count(),
    TimelineItem: await prisma.timelineItem.count(),
    ProfileI18n: await prisma.profileI18n.count(),
    Domain: await prisma.domain.count(),
    Theme: await prisma.theme.count(),
    Template: await prisma.template.count(),
    PageBlock: await prisma.pageBlock.count(),
    MediaAsset: await prisma.mediaAsset.count(),
    AnalyticsEvent: await prisma.analyticsEvent.count(),
    AnalyticsDaily: await prisma.analyticsDaily.count(),
    ActivityLog: await prisma.activityLog.count(),
    AuditLog: await prisma.auditLog.count(),
    CrmLead: await prisma.crmLead.count(),
    Notification: await prisma.notification.count(),
    Plugin: await prisma.plugin.count(),
    TenantPlugin: await prisma.tenantPlugin.count(),
    MarketplaceItem: await prisma.marketplaceItem.count(),
    AiSession: await prisma.aiSession.count(),
    AiMessage: await prisma.aiMessage.count(),
    QrCode: await prisma.qrCode.count(),
  };

  console.log("\n✅ Seed DB xong. Số bản ghi:");
  console.table(counts);

  const under = Object.entries(counts).filter(([, n]) => n < N);
  if (under.length) {
    console.warn("⚠ Dưới 5 bản ghi:", under);
    process.exitCode = 1;
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
