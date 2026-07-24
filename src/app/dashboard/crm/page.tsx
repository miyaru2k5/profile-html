import { getMemoryStore } from "@/infrastructure/memory/store";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { CRM_STATUS_VI, viLabel } from "@/shared/lib/i18n-vi";

export default async function CrmPage() {
  const session = await requireDashboardSession();
  const leads = getMemoryStore().crmLeads.filter(
    (l) => l.tenantId === session.activeTenant.id,
  );
  return (
    <DashboardShell title="CRM" subtitle={`Workspace: ${session.activeTenant.name}`}>
      <Card>
        <CardHeader>
          <CardTitle>{leads.length} lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leads.length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có lead trong workspace.</p>
          ) : (
            leads.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl border border-stone-100 px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-sm text-stone-500">
                    {l.email ?? l.phone ?? l.source ?? "—"}
                  </div>
                </div>
                <Badge>{viLabel(CRM_STATUS_VI, l.status)}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
