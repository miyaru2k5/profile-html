import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default async function SettingsPage() {
  const session = await requireDashboardSession();
  const tenant = session.activeTenant;
  const user = session.user;

  return (
    <DashboardShell title="Cài đặt" subtitle={`Workspace: ${tenant.name}`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace (Tenant)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-stone-500">Tên:</span> {tenant.name}
            </div>
            <div>
              <span className="text-stone-500">Slug:</span> {tenant.slug}
            </div>
            <div>
              <span className="text-stone-500">Trạng thái:</span>{" "}
              {tenant.status === "active" ? "Hoạt động" : tenant.status}
            </div>
            <div>
              <span className="text-stone-500">Vai trò của bạn:</span> {session.roleLabel}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-stone-500">Tên:</span> {user.name}
            </div>
            <div>
              <span className="text-stone-500">Email:</span> {user.email}
            </div>
            <div>
              <span className="text-stone-500">Siêu quản trị platform:</span>{" "}
              {user.isSuperAdmin ? (
                <span className="font-semibold text-orange-600">Có</span>
              ) : (
                <span className="font-semibold text-stone-700">Không</span>
              )}
            </div>
            {!user.isSuperAdmin ? (
              <p className="mt-2 rounded-lg bg-stone-50 p-2 text-xs text-stone-500">
                Tài khoản đăng ký mới chỉ là chủ workspace riêng, không có quyền Super Admin
                toàn hệ thống.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
