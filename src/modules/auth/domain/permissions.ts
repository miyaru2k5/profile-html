import type { Role } from "@/infrastructure/memory/store";

/** Quyền dạng resource:action */
export const PERMISSIONS = [
  // Hồ sơ
  "profiles:read",
  "profiles:create",
  "profiles:update",
  "profiles:delete",
  "profiles:publish",
  // Tên miền
  "domains:read",
  "domains:create",
  "domains:verify",
  "domains:delete",
  // Media
  "media:read",
  "media:upload",
  "media:delete",
  // Phân tích
  "analytics:read",
  // CRM
  "crm:read",
  "crm:write",
  // Thanh toán
  "billing:read",
  "billing:manage",
  // AI
  "ai:use",
  // Plugin & marketplace
  "plugins:read",
  "plugins:install",
  "marketplace:read",
  // Thành viên
  "members:read",
  "members:invite",
  "members:manage",
  // Cài đặt workspace
  "settings:read",
  "settings:write",
  // Nhật ký
  "logs:activity",
  "logs:audit",
  // Theme / template / blocks
  "themes:read",
  "themes:write",
  "templates:read",
  "templates:write",
  "blocks:write",
  // Tenant / platform
  "tenants:create",
  "platform:admin",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_LABELS_VI: Record<Role, string> = {
  SUPER_ADMIN: "Siêu quản trị",
  TENANT_OWNER: "Chủ workspace",
  TENANT_ADMIN: "Quản trị viên",
  MEMBER: "Thành viên",
  VIEWER: "Chỉ xem",
};

const ALL: Permission[] = [...PERMISSIONS];

const OWNER_PERMS: Permission[] = ALL.filter((p) => p !== "platform:admin");

const ADMIN_PERMS: Permission[] = OWNER_PERMS.filter(
  (p) => p !== "billing:manage" && p !== "members:manage",
);

const MEMBER_PERMS: Permission[] = [
  "profiles:read",
  "profiles:create",
  "profiles:update",
  "profiles:publish",
  "domains:read",
  "media:read",
  "media:upload",
  "analytics:read",
  "crm:read",
  "crm:write",
  "billing:read",
  "ai:use",
  "plugins:read",
  "marketplace:read",
  "members:read",
  "settings:read",
  "logs:activity",
  "themes:read",
  "templates:read",
  "blocks:write",
  "tenants:create",
];

const VIEWER_PERMS: Permission[] = [
  "profiles:read",
  "domains:read",
  "media:read",
  "analytics:read",
  "crm:read",
  "billing:read",
  "plugins:read",
  "marketplace:read",
  "members:read",
  "settings:read",
  "themes:read",
  "templates:read",
];

/** Ma trận role → quyền (tenant-scoped; SUPER_ADMIN bypass toàn platform) */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: ALL,
  TENANT_OWNER: OWNER_PERMS,
  TENANT_ADMIN: ADMIN_PERMS,
  MEMBER: MEMBER_PERMS,
  VIEWER: VIEWER_PERMS,
};

export function permissionsForRole(role: Role, isSuperAdmin = false): Permission[] {
  if (isSuperAdmin || role === "SUPER_ADMIN") {
    return [...ALL];
  }
  return [...ROLE_PERMISSIONS[role]];
}

export function roleHasPermission(role: Role, permission: Permission, isSuperAdmin = false): boolean {
  if (isSuperAdmin || role === "SUPER_ADMIN") return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** Quyền tối thiểu để vào từng mục menu dashboard */
export const DASHBOARD_NAV_PERMISSIONS: Record<string, Permission | Permission[] | null> = {
  "/dashboard": null, // mọi thành viên đã đăng nhập
  "/dashboard/profiles": "profiles:read",
  "/dashboard/domains": "domains:read",
  "/dashboard/media": "media:read",
  "/dashboard/analytics": "analytics:read",
  "/dashboard/crm": "crm:read",
  "/dashboard/billing": "billing:read",
  "/dashboard/ai": "ai:use",
  "/dashboard/marketplace": "marketplace:read",
  "/dashboard/logs": ["logs:activity", "logs:audit"],
  "/dashboard/settings": "settings:read",
  "/dashboard/members": "members:read",
};
