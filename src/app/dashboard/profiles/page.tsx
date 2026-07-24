import Link from "next/link";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { PROFILE_STATUS_VI, viLabel } from "@/shared/lib/i18n-vi";

export default async function ProfilesPage() {
  const session = await requireDashboardSession();
  if (!session.access.permissions.includes("profiles:read") && !session.isSuperAdmin) {
    return (
      <DashboardShell title="Hồ sơ" subtitle="Không có quyền">
        <p className="text-sm text-stone-500">Bạn không có quyền xem hồ sơ.</p>
      </DashboardShell>
    );
  }
  const profiles = getMemoryStore().profiles.filter(
    (p) => p.tenantId === session.activeTenant.id,
  );
  return (
    <DashboardShell title="Hồ sơ" subtitle={`Workspace: ${session.activeTenant.name}`}>
      <Card>
        <CardHeader>
          <CardTitle>{profiles.length} hồ sơ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profiles.length === 0 ? (
            <p className="text-sm text-stone-500">Workspace chưa có hồ sơ nào.</p>
          ) : (
            profiles.map((p) => (
              <div key={p.id} className="rounded-xl border border-stone-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{p.displayName}</div>
                    <div className="text-sm text-stone-500">
                      slug: {p.slug} · ngôn ngữ: {p.locale}
                    </div>
                  </div>
                  <Badge variant={p.status === "PUBLISHED" ? "success" : "secondary"}>
                    {viLabel(PROFILE_STATUS_VI, p.status)}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-stone-600">{p.bio}</p>
                <div className="mt-3 flex gap-3 text-sm font-semibold text-orange-600">
                  <Link href={`/profile/${p.slug}`}>Trang công khai</Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
