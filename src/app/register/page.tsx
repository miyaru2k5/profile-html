"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, tenantName: tenantName || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Đăng ký thất bại");
      localStorage.setItem("miyaru_session", json.data.token);
      document.cookie = `miyaru_session=${json.data.token}; path=/; max-age=2592000; samesite=lax`;
      toast.success("Đã tạo workspace riêng (không phải Super Admin)");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Tạo workspace</CardTitle>
          <CardDescription>Bắt đầu nền tảng profile đa tenant của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Họ và tên
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="tenantName">
                Tên workspace
              </label>
              <Input
                id="tenantName"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Ví dụ: Studio của tôi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Mật khẩu
              </label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                minLength={8}
                required
              />
            </div>
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-stone-500">
            Đã có tài khoản?{" "}
            <Link className="font-semibold text-orange-600" href="/login">
              Đăng nhập
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
