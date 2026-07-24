"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Package,
  Settings,
  Store,
  Users,
  ImageIcon,
  FileText,
  BarChart3,
  UserCog,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { DASHBOARD_NAV_PERMISSIONS } from "@/modules/auth/domain/permissions";

const nav = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/dashboard/profiles", label: "Hồ sơ", icon: Users },
  { href: "/dashboard/domains", label: "Tên miền", icon: Globe2 },
  { href: "/dashboard/media", label: "Thư viện media", icon: ImageIcon },
  { href: "/dashboard/analytics", label: "Phân tích", icon: BarChart3 },
  { href: "/dashboard/crm", label: "CRM", icon: FileText },
  { href: "/dashboard/billing", label: "Thanh toán", icon: CreditCard },
  { href: "/dashboard/ai", label: "Trợ lý AI", icon: Bot },
  { href: "/dashboard/marketplace", label: "Cửa hàng", icon: Store },
  { href: "/dashboard/members", label: "Thành viên", icon: UserCog },
  { href: "/dashboard/logs", label: "Nhật ký", icon: Activity },
  { href: "/dashboard/settings", label: "Cài đặt", icon: Settings },
];

function readSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromLs = localStorage.getItem("miyaru_session");
  if (fromLs) return fromLs;
  const match = document.cookie.match(/(?:^|;\s*)miyaru_session=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function hasNavAccess(href: string, permissions: string[] | null, ready: boolean): boolean {
  if (!ready || permissions === null) return true; // đang tải
  const need = DASHBOARD_NAV_PERMISSIONS[href];
  if (need == null) return true;
  const list = Array.isArray(need) ? need : [need];
  return list.some((p) => permissions.includes(p));
}

export function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [ready, setReady] = useState(false);
  const [roleLabel, setRoleLabel] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = readSessionToken();
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }
    localStorage.setItem("miyaru_session", token);

    fetch("/api/v1/auth/me", {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          router.replace("/login?next=/dashboard");
          return;
        }
        setPermissions((json.data.permissions as string[]) ?? []);
        setRoleLabel((json.data.roleLabel as string | null) ?? null);
        setUserName((json.data.user?.name as string | null) ?? null);
        setIsSuperAdmin(Boolean(json.data.user?.isSuperAdmin));
        setReady(true);
      })
      .catch(() => {
        router.replace("/login?next=/dashboard");
      });
  }, [pathname, router]);

  const visibleNav = useMemo(
    () => nav.filter((item) => hasNavAccess(item.href, permissions, ready)),
    [permissions, ready],
  );

  function logout() {
    localStorage.removeItem("miyaru_session");
    document.cookie = "miyaru_session=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f3f1ec] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-stone-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="font-mono text-sm font-bold tracking-[0.16em] uppercase">
            MI<span className="text-orange-500">YA</span>RU
          </Link>
          <Package className="h-4 w-4 text-orange-500 lg:hidden" />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6">
          {visibleNav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition",
                  active
                    ? "bg-orange-50 text-orange-700"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-stone-200 bg-white/80 px-5 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-stone-900">{title}</h1>
            {subtitle ? <p className="text-sm text-stone-500">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {roleLabel ? (
              <Badge
                variant={isSuperAdmin ? "default" : "secondary"}
                className="hidden sm:inline-flex"
              >
                {userName ? `${userName} · ` : ""}
                {isSuperAdmin ? "Super Admin" : roleLabel}
              </Badge>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/profile/miyaru" target="_blank">
                Xem profile
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
