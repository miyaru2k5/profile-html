/**
 * Seed dữ liệu mẫu: mỗi bảng / collection tối thiểu 5 bản ghi.
 * Profile chính: slug `miyaru` (PUBLISHED) gắn domain miyaru.online
 */
import { createId } from "@/core/types/ids";
import {
  emptyStore,
  nowIso,
  type BlockType,
  type MemoryStore,
  type Role,
  type UserRecord,
} from "./store";

const SEED_N = 5;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function seedStore(): MemoryStore {
  const store = emptyStore();
  const ts = nowIso();

  // ── Plans (5) ──────────────────────────────────────────
  const planDefs = [
    { code: "free", name: "Free", description: "Gói khởi đầu cho cá nhân", priceCents: 0, maxProfiles: 3, maxMembers: 2, maxDomains: 1 },
    { code: "starter", name: "Starter", description: "Cho freelaner & creator", priceCents: 9900000, maxProfiles: 10, maxMembers: 5, maxDomains: 3 },
    { code: "pro", name: "Pro", description: "Không giới hạn hồ sơ, tên miền và trợ lý AI", priceCents: 29900000, maxProfiles: 1000, maxMembers: 50, maxDomains: 100 },
    { code: "business", name: "Business", description: "Đội nhóm agency & studio", priceCents: 79900000, maxProfiles: 5000, maxMembers: 200, maxDomains: 500 },
    { code: "enterprise", name: "Enterprise", description: "SLA, SSO và hỗ trợ riêng", priceCents: 199900000, maxProfiles: 99999, maxMembers: 9999, maxDomains: 9999 },
  ];
  for (const p of planDefs) {
    store.plans.push({
      id: createId("plan"),
      code: p.code,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      currency: "VND",
      interval: "MONTHLY",
      features: { analytics: true, customDomain: p.code !== "free", ai: !["free", "starter"].includes(p.code) },
      maxProfiles: p.maxProfiles,
      maxMembers: p.maxMembers,
      maxDomains: p.maxDomains,
      isActive: true,
      createdAt: ts,
    });
  }
  const planPro = store.plans.find((p) => p.code === "pro")!;
  const planFree = store.plans.find((p) => p.code === "free")!;

  // ── Users (5) ──────────────────────────────────────────
  const userDefs: { email: string; name: string; isSuperAdmin: boolean; role: Role }[] = [
    { email: "miyaru2k5@gmail.com", name: "Miyaru Yue", isSuperAdmin: true, role: "TENANT_OWNER" },
    { email: "admin@miyaru.online", name: "Quản trị viên", isSuperAdmin: false, role: "TENANT_ADMIN" },
    { email: "member@miyaru.online", name: "Thành viên", isSuperAdmin: false, role: "MEMBER" },
    { email: "viewer@miyaru.online", name: "Chỉ xem", isSuperAdmin: false, role: "VIEWER" },
    { email: "editor@miyaru.online", name: "Biên tập viên", isSuperAdmin: false, role: "MEMBER" },
  ];
  const users: UserRecord[] = userDefs.map((u, i) => ({
    id: createId("user"),
    email: u.email,
    name: u.name,
    avatarUrl:
      i === 0
        ? "https://s240-ava-talk.zadn.vn/5/1/5/9/3/240/8008f8072cdfc9f872a0c905e2e70595.jpg"
        : null,
    supabaseId: i === 0 ? "seed-supabase-miyaru" : null,
    locale: "vi",
    isSuperAdmin: u.isSuperAdmin,
    passwordHash: i === 0 ? "seed:miyaru-demo" : "seed:demo1234",
    createdAt: ts,
    updatedAt: ts,
  }));
  store.users.push(...users);
  const owner = users[0];

  // ── Tenants (5) ────────────────────────────────────────
  const tenantDefs = [
    { name: "Miyaru Online", slug: "miyaru", planId: planPro.id },
    { name: "Studio Cam", slug: "studio-cam", planId: planFree.id },
    { name: "Agency Bắc", slug: "agency-bac", planId: planPro.id },
    { name: "Brand Lab", slug: "brand-lab", planId: store.plans.find((p) => p.code === "starter")!.id },
    { name: "Growth Hub", slug: "growth-hub", planId: store.plans.find((p) => p.code === "business")!.id },
  ];
  for (let i = 0; i < SEED_N; i++) {
    const def = tenantDefs[i];
    store.tenants.push({
      id: createId("tenant"),
      name: def.name,
      slug: def.slug,
      ownerId: owner.id,
      logoUrl: owner.avatarUrl,
      planId: def.planId,
      status: "active",
      settings: { brandColor: "#ff7a00", timezone: "Asia/Ho_Chi_Minh", index: i },
      createdAt: ts,
      updatedAt: ts,
    });
  }
  const mainTenant = store.tenants[0];

  // ── Members (5) — 1 owner + 4 roles trên tenant chính ─
  for (let i = 0; i < SEED_N; i++) {
    store.members.push({
      id: createId("member"),
      tenantId: mainTenant.id,
      userId: users[i].id,
      role: userDefs[i].role,
      status: "ACTIVE",
      invitedAt: ts,
      joinedAt: ts,
    });
  }

  // ── Sessions (5) ───────────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    const exp = new Date();
    exp.setDate(exp.getDate() + 30 - i);
    store.sessions.push({
      id: createId("sess"),
      userId: users[i].id,
      token: `seed-session-token-${i + 1}-${createId("tok")}`,
      expiresAt: exp.toISOString(),
      createdAt: ts,
    });
  }

  // ── Subscriptions (5) — 1 / tenant ─────────────────────
  for (let i = 0; i < SEED_N; i++) {
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    store.subscriptions.push({
      id: createId("sub"),
      tenantId: store.tenants[i].id,
      planId: store.tenants[i].planId ?? planFree.id,
      status: i === 0 ? "ACTIVE" : i === 1 ? "TRIALING" : "ACTIVE",
      currentPeriodStart: ts,
      currentPeriodEnd: end.toISOString(),
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: ts,
      updatedAt: ts,
    });
  }

  // ── Themes (5) ─────────────────────────────────────────
  const themeDefs = [
    { name: "Miyaru Cam", slug: "miyaru-orange", primary: "#ff7a00", system: true },
    { name: "Đêm Tím", slug: "night-violet", primary: "#7c3aed", system: true },
    { name: "Xanh Ngọc", slug: "mint-green", primary: "#10b981", system: true },
    { name: "Hồng San Hô", slug: "coral-pink", primary: "#f43f5e", system: false },
    { name: "Xám Tối", slug: "slate-dark", primary: "#334155", system: false },
  ];
  for (let i = 0; i < SEED_N; i++) {
    const t = themeDefs[i];
    store.themes.push({
      id: createId("theme"),
      tenantId: t.system ? null : mainTenant.id,
      name: t.name,
      slug: t.slug,
      description: `Giao diện ${t.name} — mẫu seed #${i + 1}`,
      isSystem: t.system,
      isPublic: true,
      tokens: {
        primary: t.primary,
        background: "#f7f6f2",
        card: "#ffffff",
        text: "#18160f",
        muted: "#5c5650",
      },
      previewUrl: null,
      createdAt: ts,
      updatedAt: ts,
    });
  }
  const mainTheme = store.themes[0];

  // ── Templates (5) ──────────────────────────────────────
  const tplDefs = [
    { name: "Profile cổ điển", slug: "classic-profile", sections: ["hero", "intro", "skills", "social", "links", "timeline"] },
    { name: "Link-in-bio tối giản", slug: "minimal-bio", sections: ["hero", "links", "social"] },
    { name: "Agency portfolio", slug: "agency-portfolio", sections: ["hero", "stats", "links", "timeline"] },
    { name: "Creator reels", slug: "creator-reels", sections: ["hero", "media", "social", "cta"] },
    { name: "Doanh nghiệp vừa", slug: "sme-landing", sections: ["hero", "intro", "tags", "links", "cta"] },
  ];
  for (let i = 0; i < SEED_N; i++) {
    const t = tplDefs[i];
    store.templates.push({
      id: createId("tpl"),
      tenantId: i < 3 ? null : mainTenant.id,
      name: t.name,
      slug: t.slug,
      description: `Mẫu ${t.name} — seed #${i + 1}`,
      isSystem: i < 3,
      isPublic: true,
      layout: { sections: t.sections, columns: i % 2 === 0 ? 2 : 1 },
      previewUrl: null,
      createdAt: ts,
      updatedAt: ts,
    });
  }
  const mainTemplate = store.templates[0];

  // ── Profiles (5) ───────────────────────────────────────
  const profileDefs = [
    {
      slug: "miyaru",
      displayName: "Miyaru Yue",
      handle: "miyaru.online",
      headline: "Social Media Consultant · Digital Marketer",
      bio: "Xin chào! Mình là Miyaru Yue (miyaru.online) — chuyên gia tư vấn Digital Marketing, Facebook Ads, TikTok Ads và thiết kế website tại Việt Nam với hơn 5 năm kinh nghiệm.",
      status: "PUBLISHED" as const,
      isPrimary: true,
      email: "miyaru2k5@gmail.com",
      phone: "+84383277782",
    },
    {
      slug: "beauty-spa-demo",
      displayName: "Beauty Spa Demo",
      handle: "beautyspa",
      headline: "Website spa & làm đẹp",
      bio: "Profile demo cho dịch vụ thiết kế website spa chuyên nghiệp.",
      status: "PUBLISHED" as const,
      isPrimary: false,
      email: "spa@miyaru.online",
      phone: null,
    },
    {
      slug: "giapha-demo",
      displayName: "Gia Phả Demo",
      handle: "giapha",
      headline: "Website gia phả dòng họ",
      bio: "Mẫu profile cho website gia phả và lưu giữ lịch sử dòng họ.",
      status: "PUBLISHED" as const,
      isPrimary: false,
      email: null,
      phone: null,
    },
    {
      slug: "studio-cam",
      displayName: "Studio Cam",
      handle: "studiocam",
      headline: "Thiết kế thương hiệu",
      bio: "Studio thiết kế nhận diện thương hiệu và content visual.",
      status: "DRAFT" as const,
      isPrimary: false,
      email: "studio@miyaru.online",
      phone: null,
    },
    {
      slug: "growth-lab",
      displayName: "Growth Lab",
      handle: "growthlab",
      headline: "Tăng trưởng organic",
      bio: "Lab thử nghiệm chiến lược content và growth hacking hợp pháp.",
      status: "ARCHIVED" as const,
      isPrimary: false,
      email: null,
      phone: null,
    },
  ];
  for (let i = 0; i < SEED_N; i++) {
    const p = profileDefs[i];
    store.profiles.push({
      id: createId("profile"),
      tenantId: mainTenant.id,
      ownerId: owner.id,
      slug: p.slug,
      displayName: p.displayName,
      handle: p.handle,
      headline: p.headline,
      bio: p.bio,
      avatarUrl: owner.avatarUrl,
      bannerUrl: "https://cover-talk.zadn.vn/5/7/6/7/2/8008f8072cdfc9f872a0c905e2e70595.jpg",
      email: p.email,
      phone: p.phone,
      location: "Việt Nam",
      locale: "vi",
      status: p.status,
      themeId: store.themes[i % store.themes.length].id,
      templateId: store.templates[i % store.templates.length].id,
      isPrimary: p.isPrimary,
      publishedAt: p.status === "PUBLISHED" ? ts : null,
      settings: { showVerified: i === 0, pwa: true },
      seoTitle: `${p.displayName} | Miyaru Profile`,
      seoDescription: p.bio,
      seoKeywords: `${p.displayName}, miyaru.online, digital marketing`,
      ogImageUrl: "https://cover-talk.zadn.vn/5/7/6/7/2/8008f8072cdfc9f872a0c905e2e70595.jpg",
      twitterHandle: "@yue_vn",
      jsonLd: null,
      createdAt: ts,
      updatedAt: ts,
    });
  }
  const mainProfile = store.profiles[0];

  // ── Stats (5) ──────────────────────────────────────────
  const statDefs = [
    { label: "Khách hàng", value: "555+" },
    { label: "Theo dõi", value: "5M+" },
    { label: "Kinh nghiệm", value: "5Y+" },
    { label: "Dự án web", value: "120+" },
    { label: "Chiến dịch ads", value: "300+" },
  ];
  statDefs.forEach((s, i) => {
    store.stats.push({
      id: createId("stat"),
      profileId: mainProfile.id,
      label: s.label,
      value: s.value,
      sortOrder: i,
    });
  });

  // ── Tags (5 tối thiểu — giữ thêm vài tag thực tế) ─────
  const tags = [
    "Facebook Ads",
    "TikTok Ads",
    "Content Strategy",
    "Organic Growth",
    "Thiết kế Website",
  ];
  tags.forEach((label, i) => {
    store.tags.push({ id: createId("tag"), profileId: mainProfile.id, label, sortOrder: i });
  });

  // ── Social links (5) ───────────────────────────────────
  const socials = [
    { platform: "zalo", label: "Zalo", handle: "0383277782", url: "https://zalo.me/0383277782", icon: "zalo" },
    { platform: "facebook", label: "Facebook", handle: "yue.vn", url: "https://facebook.com/yue.vn", icon: "facebook" },
    { platform: "tiktok", label: "TikTok", handle: "@yue.vn", url: "https://tiktok.com/@yue.vn", icon: "tiktok" },
    { platform: "youtube", label: "YouTube", handle: "@yue-vn", url: "https://youtube.com/@yue-vn", icon: "youtube" },
    { platform: "telegram", label: "Telegram", handle: "@yue_vn", url: "https://t.me/yue_vn", icon: "telegram" },
  ];
  socials.forEach((s, i) => {
    store.socialLinks.push({
      id: createId("soc"),
      profileId: mainProfile.id,
      ...s,
      sortOrder: i,
      isVisible: true,
    });
  });

  // ── Quick links (5) ────────────────────────────────────
  const links = [
    { title: "Beauty Spa", description: "Website spa & làm đẹp", url: "https://beautyspa.miyaru.online/", priceValue: "999k", accent: "rd", isPriced: true },
    { title: "Thiết kế Profile", description: "Profile cá nhân · miyaru.online", url: "https://miyaru.online/", priceValue: "99k", accent: "pu", isPriced: true },
    { title: "Check Admin", description: "Dashboard dịch vụ", url: "https://admin.miyaru.online", priceValue: "99k", accent: "gr", isPriced: true },
    { title: "Gia Phả", description: "Website gia phả dòng họ", url: "https://giapha.miyaru.online/", priceValue: "99k", accent: "bl", isPriced: true },
    { title: "Tư vấn Marketing", description: "Chiến lược organic", url: "https://zalo.me/0383277782", priceValue: null, accent: "or", isPriced: false },
  ];
  links.forEach((l, i) => {
    store.quickLinks.push({
      id: createId("link"),
      profileId: mainProfile.id,
      title: l.title,
      description: l.description,
      url: l.url,
      icon: "link",
      priceLabel: l.isPriced ? "Thiết kế giá:" : null,
      priceValue: l.priceValue,
      accent: l.accent,
      sortOrder: i,
      isVisible: true,
      isPriced: l.isPriced,
    });
  });

  // ── Timeline (5) ───────────────────────────────────────
  const timeline = [
    { title: "Tư vấn tăng trưởng kênh & thiết kế website", badge: "Hiện tại", period: "2025 — nay", accent: "or" },
    { title: "Digital Marketing & Quảng cáo mạng xã hội", badge: "Dịch vụ", period: "2023 — 2024", accent: "gr" },
    { title: "Tư vấn định hướng & vận hành kênh", badge: "Dịch vụ", period: "2023 — 2024", accent: "bl" },
    { title: "Sáng tạo nội dung số & cộng đồng", badge: "Khởi đầu", period: "2022", accent: "gr" },
    { title: "Tự học Digital Marketing", badge: "Nền tảng", period: "2021 — 2022", accent: "pu" },
  ];
  timeline.forEach((t, i) => {
    store.timeline.push({
      id: createId("tl"),
      profileId: mainProfile.id,
      title: t.title,
      description: `${t.title} — mô tả seed #${i + 1}.`,
      badge: t.badge,
      period: t.period,
      icon: "rocket",
      accent: t.accent,
      sortOrder: i,
    });
  });

  // ── Domains (5) ────────────────────────────────────────
  const domainDefs = [
    { hostname: "miyaru.online", primary: true, type: "CUSTOM" as const },
    { hostname: "www.miyaru.online", primary: false, type: "CUSTOM" as const },
    { hostname: "profile.miyaru.online", primary: false, type: "CUSTOM" as const },
    { hostname: "localhost", primary: false, type: "SUBDOMAIN" as const },
    { hostname: "demo.miyaru.online", primary: false, type: "CUSTOM" as const },
  ];
  domainDefs.forEach((d) => {
    store.domains.push({
      id: createId("dom"),
      tenantId: mainTenant.id,
      profileId: mainProfile.id,
      hostname: d.hostname,
      type: d.type,
      status: "ACTIVE",
      isPrimary: d.primary,
      verificationToken: null,
      verifiedAt: ts,
      sslStatus: "active",
      createdAt: ts,
      updatedAt: ts,
    });
  });

  // ── Page blocks (5) ────────────────────────────────────
  const blockTypes: BlockType[] = ["HERO", "LINKS", "SOCIAL", "TAGS", "TIMELINE"];
  const blockTitles = ["Banner & danh tính", "Liên kết nhanh", "Mạng xã hội", "Kỹ năng", "Hành trình"];
  for (let i = 0; i < SEED_N; i++) {
    store.blocks.push({
      id: createId("blk"),
      tenantId: mainTenant.id,
      profileId: mainProfile.id,
      templateId: mainTemplate.id,
      type: blockTypes[i],
      title: blockTitles[i],
      content: { seed: true, index: i },
      sortOrder: i,
      isVisible: true,
      createdAt: ts,
      updatedAt: ts,
    });
  }

  // ── Media (5) ──────────────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    const key = `${mainTenant.id}/seed/image-${i + 1}.jpg`;
    store.media.push({
      id: createId("media"),
      tenantId: mainTenant.id,
      profileId: mainProfile.id,
      uploadedBy: owner.id,
      kind: "IMAGE",
      filename: `seed-image-${i + 1}.jpg`,
      mimeType: "image/jpeg",
      sizeBytes: 120000 + i * 1000,
      storageKey: key,
      publicUrl: `https://miyaru.online/media/seed-image-${i + 1}.jpg`,
      width: 1200,
      height: 630,
      alt: `Ảnh mẫu ${i + 1}`,
      createdAt: ts,
    });
  }

  // ── Analytics events (5) ───────────────────────────────
  const eventTypes = ["page_view", "page_view", "link_click", "page_view", "link_click"];
  for (let i = 0; i < SEED_N; i++) {
    store.analyticsEvents.push({
      id: createId("evt"),
      profileId: mainProfile.id,
      eventType: eventTypes[i],
      path: eventTypes[i] === "link_click" ? "https://zalo.me/0383277782" : "/profile/miyaru",
      referrer: i % 2 === 0 ? "https://google.com" : null,
      userAgent: "seed-agent",
      country: "VN",
      city: ["HCM", "HN", "DN", "CT", "HP"][i],
      metadata: { seed: true, i },
      createdAt: daysAgo(i),
    });
  }

  // ── Analytics daily (5) ────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    store.analyticsDaily.push({
      id: createId("aday"),
      tenantId: mainTenant.id,
      profileId: mainProfile.id,
      date: daysAgo(i).slice(0, 10) + "T00:00:00.000Z",
      views: 50 + i * 12,
      clicks: 5 + i * 2,
      uniques: 40 + i * 8,
    });
  }

  // ── Activity logs (5) ──────────────────────────────────
  const actions = ["seed.completed", "profile.published", "domain.verified", "member.invited", "media.uploaded"];
  for (let i = 0; i < SEED_N; i++) {
    store.activityLogs.push({
      id: createId("act"),
      tenantId: mainTenant.id,
      userId: users[i].id,
      action: actions[i],
      entity: ["platform", "Profile", "Domain", "Member", "Media"][i],
      entityId: mainTenant.id,
      metadata: { seed: true, i },
      createdAt: daysAgo(i),
    });
  }

  // ── Audit logs (5) ─────────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    store.auditLogs.push({
      id: createId("audit"),
      tenantId: mainTenant.id,
      actorId: owner.id,
      action: ["create", "update", "publish", "invite", "upload"][i],
      resource: ["Profile", "Domain", "Profile", "Member", "Media"][i],
      resourceId: createId("res"),
      before: i === 0 ? null : { status: "DRAFT" },
      after: { status: "PUBLISHED", seed: i },
      ip: `203.0.113.${10 + i}`,
      userAgent: "seed-agent",
      createdAt: daysAgo(i),
    });
  }

  // ── Invoices (5) ───────────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    store.invoices.push({
      id: createId("inv"),
      tenantId: store.tenants[i].id,
      amountCents: store.plans[i].priceCents,
      currency: "VND",
      status: i === 0 ? "paid" : i === 1 ? "draft" : "paid",
      issuedAt: daysAgo(i * 7),
      paidAt: i === 1 ? null : daysAgo(i * 7 - 1),
      pdfUrl: null,
      metadata: { planCode: store.plans[i].code },
    });
  }

  // ── CRM leads (5) ──────────────────────────────────────
  const leadNames = ["Nguyễn An", "Trần Bình", "Lê Chi", "Phạm Dũng", "Hoàng Em"];
  const leadStatuses = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;
  for (let i = 0; i < SEED_N; i++) {
    store.crmLeads.push({
      id: createId("lead"),
      tenantId: mainTenant.id,
      ownerId: users[Math.min(i, users.length - 1)].id,
      name: leadNames[i],
      email: `lead${i + 1}@example.com`,
      phone: `090000000${i}`,
      source: ["zalo", "facebook", "website", "tiktok", "referral"][i],
      status: leadStatuses[i],
      notes: `Lead mẫu #${i + 1}`,
      metadata: { seed: true },
      createdAt: daysAgo(i),
      updatedAt: daysAgo(i),
    });
  }

  // ── Notifications (5) ──────────────────────────────────
  const notifTitles = [
    "Chào mừng đến Miyaru Profile",
    "Domain miyaru.online đã ACTIVE",
    "Lead mới từ Zalo",
    "Hóa đơn Pro đã thanh toán",
    "Plugin QR Boost đã bật",
  ];
  for (let i = 0; i < SEED_N; i++) {
    store.notifications.push({
      id: createId("ntf"),
      tenantId: mainTenant.id,
      userId: owner.id,
      channel: "IN_APP",
      status: i < 2 ? "READ" : "SENT",
      title: notifTitles[i],
      body: `${notifTitles[i]} — thông báo seed #${i + 1}`,
      payload: { href: i === 0 ? "https://miyaru.online/" : "/dashboard" },
      createdAt: daysAgo(i),
      readAt: i < 2 ? daysAgo(i) : null,
    });
  }

  // ── Plugins (5) ────────────────────────────────────────
  const pluginDefs = [
    { code: "qr-boost", name: "QR Boost", description: "Tạo mã QR thương hiệu cho profile" },
    { code: "seo-audit", name: "SEO Audit", description: "Kiểm tra SEO on-page tự động" },
    { code: "lead-form", name: "Lead Form", description: "Form thu lead gắn profile" },
    { code: "utm-tracker", name: "UTM Tracker", description: "Theo dõi chiến dịch UTM" },
    { code: "whatsapp-cta", name: "WhatsApp CTA", description: "Nút gọi WhatsApp nổi" },
  ];
  for (let i = 0; i < SEED_N; i++) {
    store.plugins.push({
      id: createId("plugin"),
      code: pluginDefs[i].code,
      name: pluginDefs[i].name,
      description: pluginDefs[i].description,
      version: `1.${i}.0`,
      isPublic: true,
      manifest: { permissions: ["profile.read"] },
      createdAt: ts,
    });
  }

  // ── Tenant plugins (5) ─────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    store.tenantPlugins.push({
      id: createId("tp"),
      tenantId: mainTenant.id,
      pluginId: store.plugins[i].id,
      status: i < 3 ? "ENABLED" : "INSTALLED",
      config: { seed: true },
      installedAt: ts,
    });
  }

  // ── Marketplace (5) ────────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    store.marketplace.push({
      id: createId("mp"),
      type: i < 3 ? "PLUGIN" : i === 3 ? "THEME" : "TEMPLATE",
      slug: i < 3 ? pluginDefs[i].code : i === 3 ? "miyaru-orange" : "classic-profile",
      title: i < 3 ? pluginDefs[i].name : i === 3 ? "Giao diện Miyaru Cam" : "Profile cổ điển",
      description: i < 3 ? pluginDefs[i].description : "Mục marketplace seed",
      priceCents: i === 0 ? 0 : i * 4900000,
      currency: "VND",
      previewUrl: null,
      pluginId: i < 3 ? store.plugins[i].id : null,
      metadata: { seed: true },
      isPublished: true,
      createdAt: ts,
    });
  }

  // ── AI sessions (5) + messages (≥5) ────────────────────
  for (let i = 0; i < SEED_N; i++) {
    const sessionId = createId("ai");
    store.aiSessions.push({
      id: sessionId,
      tenantId: mainTenant.id,
      userId: owner.id,
      title: `Phiên trợ lý #${i + 1}`,
      createdAt: daysAgo(i),
      updatedAt: daysAgo(i),
    });
    store.aiMessages.push({
      id: createId("msg"),
      sessionId,
      role: i === 0 ? "SYSTEM" : i % 2 === 0 ? "USER" : "ASSISTANT",
      content:
        i === 0
          ? "Bạn là trợ lý AI của Miyaru Profile."
          : i % 2 === 0
            ? `Câu hỏi seed #${i + 1} về SEO profile`
            : `Trả lời mẫu #${i + 1}: tối ưu title, mô tả và canonical.`,
      metadata: { seed: true },
      createdAt: daysAgo(i),
    });
  }

  // ── QR codes (5) ───────────────────────────────────────
  for (let i = 0; i < SEED_N; i++) {
    store.qrCodes.push({
      id: createId("qr"),
      profileId: store.profiles[i].id,
      label: i === 0 ? "Default" : `QR #${i + 1}`,
      targetUrl: i === 0 ? "https://miyaru.online/" : `https://miyaru.online/profile/${store.profiles[i].slug}`,
      imageData: null,
      createdAt: ts,
    });
  }

  return store;
}

/** Đếm số bản ghi mỗi bảng (dùng test/health) */
export function countSeedTables(store: MemoryStore): Record<string, number> {
  return {
    users: store.users.length,
    sessions: store.sessions.length,
    tenants: store.tenants.length,
    members: store.members.length,
    profiles: store.profiles.length,
    socialLinks: store.socialLinks.length,
    quickLinks: store.quickLinks.length,
    stats: store.stats.length,
    tags: store.tags.length,
    timeline: store.timeline.length,
    domains: store.domains.length,
    themes: store.themes.length,
    templates: store.templates.length,
    blocks: store.blocks.length,
    media: store.media.length,
    analyticsEvents: store.analyticsEvents.length,
    analyticsDaily: store.analyticsDaily.length,
    activityLogs: store.activityLogs.length,
    auditLogs: store.auditLogs.length,
    plans: store.plans.length,
    subscriptions: store.subscriptions.length,
    invoices: store.invoices.length,
    crmLeads: store.crmLeads.length,
    notifications: store.notifications.length,
    plugins: store.plugins.length,
    tenantPlugins: store.tenantPlugins.length,
    marketplace: store.marketplace.length,
    aiSessions: store.aiSessions.length,
    aiMessages: store.aiMessages.length,
    qrCodes: store.qrCodes.length,
  };
}
