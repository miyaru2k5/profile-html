import { seedStore } from "./seed";

export type Role = "SUPER_ADMIN" | "TENANT_OWNER" | "TENANT_ADMIN" | "MEMBER" | "VIEWER";
export type ProfileStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SUSPENDED";
export type DomainStatus = "PENDING" | "VERIFYING" | "ACTIVE" | "FAILED" | "DISABLED";
export type DomainType = "SUBDOMAIN" | "CUSTOM";
export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE";
export type BlockType =
  | "HERO"
  | "TEXT"
  | "LINKS"
  | "SOCIAL"
  | "STATS"
  | "TAGS"
  | "TIMELINE"
  | "MEDIA"
  | "CTA"
  | "EMBED"
  | "CUSTOM";
export type CrmLeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";
export type NotificationChannel = "IN_APP" | "EMAIL" | "WEBHOOK";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ";
export type PluginStatus = "INSTALLED" | "ENABLED" | "DISABLED" | "ERROR";
export type MarketplaceItemType = "TEMPLATE" | "THEME" | "PLUGIN" | "BLOCK";
export type AiMessageRole = "SYSTEM" | "USER" | "ASSISTANT";
export type MediaKind = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER";

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  supabaseId: string | null;
  locale: string;
  isSuperAdmin: boolean;
  passwordHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface TenantRecord {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logoUrl: string | null;
  planId: string | null;
  status: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMemberRecord {
  id: string;
  tenantId: string;
  userId: string;
  role: Role;
  status: "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
  invitedAt: string;
  joinedAt: string | null;
}

export interface ProfileRecord {
  id: string;
  tenantId: string;
  ownerId: string;
  slug: string;
  displayName: string;
  handle: string | null;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  locale: string;
  status: ProfileStatus;
  themeId: string | null;
  templateId: string | null;
  isPrimary: boolean;
  publishedAt: string | null;
  settings: Record<string, unknown>;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImageUrl: string | null;
  twitterHandle: string | null;
  jsonLd: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinkRecord {
  id: string;
  profileId: string;
  platform: string;
  label: string;
  handle: string | null;
  url: string;
  icon: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface QuickLinkRecord {
  id: string;
  profileId: string;
  title: string;
  description: string | null;
  url: string;
  icon: string | null;
  priceLabel: string | null;
  priceValue: string | null;
  accent: string | null;
  sortOrder: number;
  isVisible: boolean;
  isPriced: boolean;
}

export interface ProfileStatRecord {
  id: string;
  profileId: string;
  label: string;
  value: string;
  sortOrder: number;
}

export interface ProfileTagRecord {
  id: string;
  profileId: string;
  label: string;
  sortOrder: number;
}

export interface TimelineItemRecord {
  id: string;
  profileId: string;
  title: string;
  description: string | null;
  badge: string | null;
  period: string | null;
  icon: string | null;
  accent: string | null;
  sortOrder: number;
}

export interface DomainRecord {
  id: string;
  tenantId: string;
  profileId: string | null;
  hostname: string;
  type: DomainType;
  status: DomainStatus;
  isPrimary: boolean;
  verificationToken: string | null;
  verifiedAt: string | null;
  sslStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeRecord {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  isPublic: boolean;
  tokens: Record<string, unknown>;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRecord {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  isPublic: boolean;
  layout: Record<string, unknown>;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageBlockRecord {
  id: string;
  tenantId: string;
  profileId: string | null;
  templateId: string | null;
  type: BlockType;
  title: string | null;
  content: Record<string, unknown>;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetRecord {
  id: string;
  tenantId: string;
  profileId: string | null;
  uploadedBy: string | null;
  kind: MediaKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  publicUrl: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
}

export interface AnalyticsEventRecord {
  id: string;
  profileId: string;
  eventType: string;
  path: string | null;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  city: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AnalyticsDailyRecord {
  id: string;
  tenantId: string;
  profileId: string;
  date: string;
  views: number;
  clicks: number;
  uniques: number;
}

export interface ActivityLogRecord {
  id: string;
  tenantId: string | null;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  tenantId: string | null;
  actorId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PlanRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  interval: "MONTHLY" | "YEARLY";
  features: Record<string, unknown>;
  maxProfiles: number;
  maxMembers: number;
  maxDomains: number;
  isActive: boolean;
  createdAt: string;
}

export interface SubscriptionRecord {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  amountCents: number;
  currency: string;
  status: string;
  issuedAt: string;
  paidAt: string | null;
  pdfUrl: string | null;
  metadata: Record<string, unknown>;
}

export interface CrmLeadRecord {
  id: string;
  tenantId: string;
  ownerId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: CrmLeadStatus;
  notes: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  tenantId: string | null;
  userId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  createdAt: string;
  readAt: string | null;
}

export interface PluginRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  version: string;
  isPublic: boolean;
  manifest: Record<string, unknown>;
  createdAt: string;
}

export interface TenantPluginRecord {
  id: string;
  tenantId: string;
  pluginId: string;
  status: PluginStatus;
  config: Record<string, unknown>;
  installedAt: string;
}

export interface MarketplaceItemRecord {
  id: string;
  type: MarketplaceItemType;
  slug: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  previewUrl: string | null;
  pluginId: string | null;
  metadata: Record<string, unknown>;
  isPublished: boolean;
  createdAt: string;
}

export interface AiSessionRecord {
  id: string;
  tenantId: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessageRecord {
  id: string;
  sessionId: string;
  role: AiMessageRole;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface QrCodeRecord {
  id: string;
  profileId: string;
  label: string;
  targetUrl: string;
  imageData: string | null;
  createdAt: string;
}

export interface MemoryStore {
  users: UserRecord[];
  sessions: SessionRecord[];
  tenants: TenantRecord[];
  members: TenantMemberRecord[];
  profiles: ProfileRecord[];
  socialLinks: SocialLinkRecord[];
  quickLinks: QuickLinkRecord[];
  stats: ProfileStatRecord[];
  tags: ProfileTagRecord[];
  timeline: TimelineItemRecord[];
  domains: DomainRecord[];
  themes: ThemeRecord[];
  templates: TemplateRecord[];
  blocks: PageBlockRecord[];
  media: MediaAssetRecord[];
  analyticsEvents: AnalyticsEventRecord[];
  analyticsDaily: AnalyticsDailyRecord[];
  activityLogs: ActivityLogRecord[];
  auditLogs: AuditLogRecord[];
  plans: PlanRecord[];
  subscriptions: SubscriptionRecord[];
  invoices: InvoiceRecord[];
  crmLeads: CrmLeadRecord[];
  notifications: NotificationRecord[];
  plugins: PluginRecord[];
  tenantPlugins: TenantPluginRecord[];
  marketplace: MarketplaceItemRecord[];
  aiSessions: AiSessionRecord[];
  aiMessages: AiMessageRecord[];
  qrCodes: QrCodeRecord[];
}

export function nowIso() {
  return new Date().toISOString();
}

export function emptyStore(): MemoryStore {
  return {
    users: [],
    sessions: [],
    tenants: [],
    members: [],
    profiles: [],
    socialLinks: [],
    quickLinks: [],
    stats: [],
    tags: [],
    timeline: [],
    domains: [],
    themes: [],
    templates: [],
    blocks: [],
    media: [],
    analyticsEvents: [],
    analyticsDaily: [],
    activityLogs: [],
    auditLogs: [],
    plans: [],
    subscriptions: [],
    invoices: [],
    crmLeads: [],
    notifications: [],
    plugins: [],
    tenantPlugins: [],
    marketplace: [],
    aiSessions: [],
    aiMessages: [],
    qrCodes: [],
  };
}

const globalForStore = globalThis as unknown as { __miyaruMemoryStore?: MemoryStore };

export function getMemoryStore(): MemoryStore {
  if (!globalForStore.__miyaruMemoryStore) {
    globalForStore.__miyaruMemoryStore = seedStore();
  }
  return globalForStore.__miyaruMemoryStore;
}

export function resetMemoryStore(seed = true): MemoryStore {
  globalForStore.__miyaruMemoryStore = seed ? seedStore() : emptyStore();
  return globalForStore.__miyaruMemoryStore;
}

export { seedStore } from "./seed";
