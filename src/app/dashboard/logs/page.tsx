import { getContainer } from "@/core/di/container";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default async function LogsPage() {
  const session = await requireDashboardSession();
  const tenantId = session.activeTenant.id;
  const activity = getContainer().activity.list(tenantId);
  // Audit chi tiết: owner/admin hoặc super admin
  const canAudit =
    session.isSuperAdmin ||
    session.access.permissions.includes("logs:audit");
  const audit = canAudit ? getContainer().audit.list(tenantId) : [];

  return (
    <DashboardShell title="Nhật ký" subtitle={`Workspace: ${session.activeTenant.name}`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activity.length === 0 ? (
              <p className="text-sm text-stone-500">Chưa có hoạt động.</p>
            ) : (
              activity.map((l) => (
                <div key={l.id} className="rounded-lg border border-stone-100 px-3 py-2 text-sm">
                  <div className="font-semibold">{l.action}</div>
                  <div className="text-stone-500">
                    {l.entity} · {new Date(l.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kiểm toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!canAudit ? (
              <p className="text-sm text-stone-500">Bạn không có quyền xem nhật ký kiểm toán.</p>
            ) : audit.length === 0 ? (
              <p className="text-sm text-stone-500">Chưa có bản ghi kiểm toán.</p>
            ) : (
              audit.map((l) => (
                <div key={l.id} className="rounded-lg border border-stone-100 px-3 py-2 text-sm">
                  <div className="font-semibold">
                    {l.action} {l.resource}
                  </div>
                  <div className="text-stone-500">
                    {new Date(l.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
