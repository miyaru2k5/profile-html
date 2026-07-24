import { getContainer } from "@/core/di/container";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default async function AnalyticsPage() {
  const session = await requireDashboardSession();
  const profiles = getMemoryStore().profiles.filter(
    (p) => p.tenantId === session.activeTenant.id,
  );
  const c = getContainer();
  const summary = profiles[0] ? c.analytics.summary(profiles[0].id) : null;
  const tenantSummary = c.analytics.tenantSummary(session.activeTenant.id);

  return (
    <DashboardShell title="Phân tích" subtitle={`Workspace: ${session.activeTenant.name}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tổng lượt xem (workspace)</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-extrabold">{tenantSummary.totalViews}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng lượt bấm</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-extrabold">{tenantSummary.totalClicks}</CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Sự kiện gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(summary?.recent ?? []).length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có sự kiện trong workspace.</p>
          ) : (
            (summary?.recent ?? []).map((e) => (
              <div key={e.id} className="rounded-lg border border-stone-100 px-3 py-2 text-sm">
                <span className="font-semibold">{e.eventType}</span>
                <span className="text-stone-500">
                  {" "}
                  · {e.path ?? "—"} · {new Date(e.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
