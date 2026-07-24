import { getMemoryStore } from "@/infrastructure/memory/store";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default async function MediaPage() {
  const session = await requireDashboardSession();
  const media = getMemoryStore().media.filter((m) => m.tenantId === session.activeTenant.id);
  return (
    <DashboardShell title="Thư viện media" subtitle={`Workspace: ${session.activeTenant.name}`}>
      <Card>
        <CardHeader>
          <CardTitle>{media.length} tệp</CardTitle>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có media trong workspace.</p>
          ) : (
            <div className="space-y-3">
              {media.map((m) => (
                <div key={m.id} className="rounded-xl border border-stone-100 px-4 py-3 text-sm">
                  <div className="font-semibold">{m.filename}</div>
                  <div className="text-stone-500">
                    {m.kind} · {m.mimeType} · {m.sizeBytes} byte
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
