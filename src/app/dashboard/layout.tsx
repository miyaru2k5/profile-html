import { requireDashboardSession } from "@/core/http/dashboard-session";

/**
 * Mọi route /dashboard/* bắt buộc có session hợp lệ.
 * User đăng ký mới = TENANT_OWNER workspace riêng, KHÔNG phải super admin.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Chặn truy cập ẩn danh / session hết hạn trước khi render page
  await requireDashboardSession();
  return children;
}
