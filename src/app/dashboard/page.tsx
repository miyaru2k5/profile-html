import Link from "next/link";
import { getContainer } from "@/core/di/container";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { requireDashboardSession } from "@/core/http/dashboard-session";
import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { PLAN_INTERVAL_VI, PROFILE_STATUS_VI, viLabel } from "@/shared/lib/i18n-vi";

export default async function DashboardPage() {
  const session = await requireDashboardSession();
  const c = getContainer();
  const store = getMemoryStore();
  const tenant = session.activeTenant;

  // Chỉ data của workspace hiện tại (super admin cũng scope theo activeTenant trừ khi mở rộng sau)
  const profiles = store.profiles.filter((p) => p.tenantId === tenant.id);
  const domains = store.domains.filter((d) => d.tenantId === tenant.id);
  const analytics = c.analytics.tenantSummary(tenant.id);
  const plans = c.billing.listPlans();
  const sub = c.billing.getSubscription(tenant.id);

  const cards = [
    { label: "Hồ sơ", value: profiles.length },
    { label: "Tên miền", value: domains.length },
    { label: "Lượt xem", value: analytics.totalViews },
    { label: "Lượt bấm", value: analytics.totalClicks },
  ];

  return (
    <DashboardShell
      title="Tổng quan"
      subtitle={`${tenant.name} · ${tenant.slug}${session.isSuperAdmin ? " · Super Admin" : ""}`}
    >
      {!session.isSuperAdmin ? (
        <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          Bạn đang ở workspace <strong>{tenant.name}</strong> với vai trò{" "}
          <strong>{session.roleLabel}</strong>. Đây không phải trang siêu quản trị toàn
          platform — chỉ dữ liệu workspace của bạn.
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Đăng nhập Super Admin — có quyền platform:admin.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-stone-500">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-stone-900">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ trong workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profiles.length === 0 ? (
              <p className="text-sm text-stone-500">
                Chưa có hồ sơ. Tạo profile mới trong workspace của bạn.
              </p>
            ) : (
              profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-3"
                >
                  <div>
                    <div className="font-semibold">{p.displayName}</div>
                    <div className="text-xs text-stone-500">/{p.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === "PUBLISHED" ? "success" : "secondary"}>
                      {viLabel(PROFILE_STATUS_VI, p.status)}
                    </Badge>
                    <Link
                      className="text-sm font-semibold text-orange-600"
                      href={`/profile/${p.slug}`}
                    >
                      Mở
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gói dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sub?.plan ? (
              <div className="rounded-xl border border-orange-100 bg-orange-50/50 px-3 py-3 text-sm">
                Gói hiện tại: <strong>{sub.plan.name}</strong> (
                {viLabel(
                  { TRIALING: "Dùng thử", ACTIVE: "Đang dùng", PAST_DUE: "Quá hạn", CANCELED: "Đã hủy", INCOMPLETE: "Chưa xong" },
                  sub.subscription.status,
                )}
                )
              </div>
            ) : null}
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-stone-100 px-3 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{plan.name}</div>
                  <Badge>{plan.code}</Badge>
                </div>
                <p className="mt-1 text-sm text-stone-500">{plan.description}</p>
                <p className="mt-2 text-sm font-bold text-orange-600">
                  {(plan.priceCents / 100).toLocaleString("vi-VN")} {plan.currency}/
                  {viLabel(PLAN_INTERVAL_VI, plan.interval)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
