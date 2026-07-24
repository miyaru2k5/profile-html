import { getContainer } from "@/core/di/container";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { SUBSCRIPTION_STATUS_VI, viLabel } from "@/shared/lib/i18n-vi";

export default async function BillingPage() {
  const session = await requireDashboardSession();
  const c = getContainer();
  const sub = c.billing.getSubscription(session.activeTenant.id);
  const invoices = c.billing.listInvoices(session.activeTenant.id);
  const plans = c.billing.listPlans();

  return (
    <DashboardShell title="Thanh toán" subtitle={`Workspace: ${session.activeTenant.name}`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gói hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            {sub ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{sub.plan?.name}</span>
                  <Badge variant="success">
                    {viLabel(SUBSCRIPTION_STATUS_VI, sub.subscription.status)}
                  </Badge>
                </div>
                <p className="text-stone-500">
                  Kỳ hạn đến{" "}
                  {new Date(sub.subscription.currentPeriodEnd).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-stone-500">Chưa có đăng ký gói</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Các gói khả dụng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="rounded-xl border border-stone-100 px-3 py-3 text-sm">
                <div className="font-semibold">{p.name}</div>
                <div className="text-stone-500">
                  tối đa {p.maxProfiles} hồ sơ · {p.maxDomains} tên miền
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Hóa đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {invoices.length === 0 ? (
            <p className="text-sm text-stone-500">Chưa có hóa đơn.</p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm"
              >
                <span>
                  {(inv.amountCents / 100).toLocaleString("vi-VN")} {inv.currency}
                </span>
                <Badge>{inv.status === "paid" ? "Đã thanh toán" : inv.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
