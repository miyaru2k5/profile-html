"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { ROLE_LABELS_VI } from "@/modules/auth/domain/permissions";
import type { Role } from "@/infrastructure/memory/store";

type MemberRow = {
  id: string;
  role: Role;
  status: string;
  user: { id: string; email: string; name: string | null } | null;
};

export default function MembersPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [canInvite, setCanInvite] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"TENANT_ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [loading, setLoading] = useState(false);

  async function load() {
    const token = localStorage.getItem("miyaru_session");
    if (!token) return;
    const meRes = await fetch("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me = await meRes.json();
    if (!me.success) return;
    const tid = me.data.activeTenantId as string | null;
    setTenantId(tid);
    const perms = (me.data.permissions ?? []) as string[];
    setCanInvite(perms.includes("members:invite"));
    setCanManage(perms.includes("members:manage"));
    if (!tid) return;
    const res = await fetch(`/api/v1/members?tenantId=${tid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.success) setMembers(json.data);
    else toast.error(json.error?.message ?? "Không tải được thành viên");
  }

  useEffect(() => {
    void load();
  }, []);

  async function invite() {
    if (!tenantId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("miyaru_session");
      const res = await fetch("/api/v1/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tenantId, email, role }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Mời thất bại");
      toast.success("Đã mời thành viên (mật khẩu mặc định: demo1234)");
      setEmail("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(memberId: string, next: Role) {
    if (!tenantId || next === "SUPER_ADMIN") return;
    const token = localStorage.getItem("miyaru_session");
    const res = await fetch("/api/v1/members", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ tenantId, memberId, role: next }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error?.message ?? "Không đổi được vai trò");
      return;
    }
    toast.success("Đã cập nhật vai trò");
    await load();
  }

  async function removeMember(memberId: string) {
    if (!tenantId) return;
    const token = localStorage.getItem("miyaru_session");
    const res = await fetch("/api/v1/members", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ tenantId, memberId }),
    });
    const json = await res.json();
    if (!json.success) {
      toast.error(json.error?.message ?? "Không xóa được");
      return;
    }
    toast.success("Đã gỡ thành viên");
    await load();
  }

  return (
    <DashboardShell title="Thành viên" subtitle="Phân quyền theo vai trò trong workspace">
      {canInvite ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Mời thành viên</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Vai trò</label>
              <select
                className="flex h-10 rounded-xl border border-stone-200 bg-white px-3 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
              >
                <option value="TENANT_ADMIN">Quản trị viên</option>
                <option value="MEMBER">Thành viên</option>
                <option value="VIEWER">Chỉ xem</option>
              </select>
            </div>
            <Button onClick={invite} disabled={loading || !email}>
              {loading ? "Đang mời..." : "Mời"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{members.length} thành viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 rounded-xl border border-stone-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-semibold">{m.user?.name ?? "—"}</div>
                <div className="text-sm text-stone-500">{m.user?.email}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={m.status === "ACTIVE" ? "success" : "secondary"}>
                  {ROLE_LABELS_VI[m.role] ?? m.role}
                </Badge>
                {canManage && m.role !== "TENANT_OWNER" ? (
                  <>
                    <select
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2 text-xs"
                      value={m.role}
                      onChange={(e) => void changeRole(m.id, e.target.value as Role)}
                    >
                      <option value="TENANT_ADMIN">Quản trị viên</option>
                      <option value="MEMBER">Thành viên</option>
                      <option value="VIEWER">Chỉ xem</option>
                    </select>
                    <Button size="sm" variant="outline" onClick={() => void removeMember(m.id)}>
                      Gỡ
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
