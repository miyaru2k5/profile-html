import type {
  ProfileRecord,
  SocialLinkRecord,
  QuickLinkRecord,
  ProfileStatRecord,
  ProfileTagRecord,
  TimelineItemRecord,
  ThemeRecord,
  TemplateRecord,
  DomainRecord,
  PageBlockRecord,
  QrCodeRecord,
} from "@/infrastructure/memory/store";

export type ProfileAggregate = {
  profile: ProfileRecord;
  socialLinks: SocialLinkRecord[];
  quickLinks: QuickLinkRecord[];
  stats: ProfileStatRecord[];
  tags: ProfileTagRecord[];
  timeline: TimelineItemRecord[];
  theme: ThemeRecord | null;
  template: TemplateRecord | null;
  domains: DomainRecord[];
  blocks: PageBlockRecord[];
  qrCodes: QrCodeRecord[];
};

export type CreateProfileInput = {
  tenantId: string;
  ownerId: string;
  slug: string;
  displayName: string;
  handle?: string | null;
  headline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  locale?: string;
  themeId?: string | null;
  templateId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  ogImageUrl?: string | null;
  twitterHandle?: string | null;
};

export type UpdateProfileInput = Partial<
  Omit<CreateProfileInput, "tenantId" | "ownerId" | "slug">
> & {
  status?: ProfileRecord["status"];
  jsonLd?: Record<string, unknown> | null;
  settings?: Record<string, unknown>;
};

export interface ProfileRepository {
  findById(id: string): Promise<ProfileRecord | null>;
  findBySlug(slug: string): Promise<ProfileRecord | null>;
  findByHostname(hostname: string): Promise<ProfileRecord | null>;
  listByTenant(tenantId: string): Promise<ProfileRecord[]>;
  create(input: CreateProfileInput): Promise<ProfileRecord>;
  update(id: string, input: UpdateProfileInput): Promise<ProfileRecord>;
  delete(id: string): Promise<void>;
  getAggregate(id: string): Promise<ProfileAggregate | null>;
  getAggregateBySlug(slug: string): Promise<ProfileAggregate | null>;
  getAggregateByHostname(hostname: string): Promise<ProfileAggregate | null>;
}
