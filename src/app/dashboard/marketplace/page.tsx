import { getContainer } from "@/core/di/container";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

const TYPE_VI: Record<string, string> = {
  TEMPLATE: "Mẫu",
  THEME: "Giao diện",
  PLUGIN: "Plugin",
  BLOCK: "Khối",
};

export default async function MarketplacePage() {
  await requireDashboardSession();
  const items = getContainer().marketplace.list();
  return (
    <DashboardShell title="Cửa hàng" subtitle="Theme, template và plugin công khai">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{item.title}</CardTitle>
                <Badge>{TYPE_VI[item.type] ?? item.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-500">{item.description}</p>
              <p className="mt-3 text-sm font-bold text-orange-600">
                {(item.priceCents / 100).toLocaleString("vi-VN")} {item.currency}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
