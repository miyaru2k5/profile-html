import { getMemoryStore } from "@/infrastructure/memory/store";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { DOMAIN_STATUS_VI, DOMAIN_TYPE_VI, viLabel } from "@/shared/lib/i18n-vi";

export default async function DomainsPage() {
  const session = await requireDashboardSession();
  const domains = getMemoryStore().domains.filter(
    (d) => d.tenantId === session.activeTenant.id,
  );
  return (
    <DashboardShell title="Tên miền" subtitle={`Workspace: ${session.activeTenant.name}`}>
      <Card>
        <CardHeader>
          <CardTitle>Tên miền đã đăng ký</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {domains.length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có tên miền trong workspace.</p>
          ) : (
            domains.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-100 px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{d.hostname}</div>
                  <div className="text-xs text-stone-500">
                    {viLabel(DOMAIN_TYPE_VI, d.type)} · SSL {d.sslStatus}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.isPrimary ? <Badge>Chính</Badge> : null}
                  <Badge variant={d.status === "ACTIVE" ? "success" : "secondary"}>
                    {viLabel(DOMAIN_STATUS_VI, d.status)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
