import { ActivityLogService } from "@/modules/activity-log/application/activity-log-service";
import { AiService } from "@/modules/ai/application/ai-service";
import { AnalyticsService } from "@/modules/analytics/application/analytics-service";
import { AuditLogService } from "@/modules/audit-log/application/audit-log-service";
import { AccessControlService } from "@/modules/auth/application/access-control";
import { AuthService } from "@/modules/auth/application/auth-service";
import { BillingService } from "@/modules/billing/application/billing-service";
import { CrmService } from "@/modules/crm/application/crm-service";
import { DomainService } from "@/modules/domain/application/domain-service";
import { MarketplaceService } from "@/modules/marketplace/application/marketplace-service";
import { MediaService } from "@/modules/media/application/media-service";
import { NotificationService } from "@/modules/notification/application/notification-service";
import { PageBuilderService } from "@/modules/page-builder/application/page-builder-service";
import { PluginService } from "@/modules/plugins/application/plugin-service";
import { ProfileService } from "@/modules/profile/application/profile-service";
import { QrService } from "@/modules/profile/application/qr-service";
import { MemoryProfileRepository } from "@/modules/profile/infrastructure/memory-profile-repository";
import { SeoService } from "@/modules/seo/application/seo-service";
import { TemplateService } from "@/modules/template/application/template-service";
import { MemberService } from "@/modules/tenant/application/member-service";
import { TenantService } from "@/modules/tenant/application/tenant-service";
import { ThemeService } from "@/modules/theme/application/theme-service";
import { MemoryStorageProvider } from "@/infrastructure/storage/memory-storage";
import type { StorageProvider } from "@/infrastructure/storage/storage-provider";
import { SupabaseStorageProvider } from "@/infrastructure/storage/supabase-storage";

export type AppContainer = {
  auth: AuthService;
  access: AccessControlService;
  tenants: TenantService;
  members: MemberService;
  profiles: ProfileService;
  domains: DomainService;
  themes: ThemeService;
  templates: TemplateService;
  pageBuilder: PageBuilderService;
  analytics: AnalyticsService;
  media: MediaService;
  seo: SeoService;
  activity: ActivityLogService;
  audit: AuditLogService;
  billing: BillingService;
  crm: CrmService;
  ai: AiService;
  plugins: PluginService;
  marketplace: MarketplaceService;
  notifications: NotificationService;
  qr: QrService;
  storage: StorageProvider;
};

function createStorage(): StorageProvider {
  const wantsSupabase = (process.env.STORAGE_PROVIDER ?? "").toLowerCase() === "supabase";
  const hasKeys =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  if (wantsSupabase && hasKeys) {
    return new SupabaseStorageProvider();
  }
  return new MemoryStorageProvider();
}

export function createContainer(): AppContainer {
  const storage = createStorage();
  const activity = new ActivityLogService();
  const audit = new AuditLogService();
  const analytics = new AnalyticsService();
  const seo = new SeoService();
  const qr = new QrService();
  const profileRepo = new MemoryProfileRepository();
  const access = new AccessControlService();

  return {
    auth: new AuthService(),
    access,
    tenants: new TenantService(),
    members: new MemberService(access),
    profiles: new ProfileService(profileRepo, seo, qr, activity, audit, analytics),
    domains: new DomainService(),
    themes: new ThemeService(),
    templates: new TemplateService(),
    pageBuilder: new PageBuilderService(),
    analytics,
    media: new MediaService(storage),
    seo,
    activity,
    audit,
    billing: new BillingService(),
    crm: new CrmService(),
    ai: new AiService(),
    plugins: new PluginService(),
    marketplace: new MarketplaceService(),
    notifications: new NotificationService(),
    qr,
    storage,
  };
}

const globalForContainer = globalThis as unknown as { __miyaruContainer?: AppContainer };

export function getContainer(): AppContainer {
  if (!globalForContainer.__miyaruContainer) {
    globalForContainer.__miyaruContainer = createContainer();
  }
  return globalForContainer.__miyaruContainer;
}

export function resetContainer() {
  globalForContainer.__miyaruContainer = createContainer();
  return globalForContainer.__miyaruContainer;
}
