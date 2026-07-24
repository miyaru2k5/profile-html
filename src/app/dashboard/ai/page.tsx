"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

type Msg = { role: string; content: string };

export default function AiPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("Gợi ý SEO cho profile digital marketing");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function ensureSession() {
    const token = localStorage.getItem("miyaru_session");
    const tenantsRes = await fetch("/api/v1/tenants", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const tenantsJson = await tenantsRes.json();
    if (!tenantsJson.success || !tenantsJson.data[0]) {
      throw new Error("Cần đăng nhập trước");
    }
    const tenantId = tenantsJson.data[0].id as string;
    const res = await fetch("/api/v1/ai/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ tenantId, title: "Trợ lý bảng điều khiển" }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? "Không tạo được phiên AI");
    setSessionId(json.data.id);
    return json.data.id as string;
  }

  async function send() {
    setLoading(true);
    try {
      const token = localStorage.getItem("miyaru_session");
      const sid = sessionId ?? (await ensureSession());
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ sessionId: sid, message }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? "Chat thất bại");
      setMessages((prev) => [
        ...prev,
        { role: "USER", content: json.data.user.content },
        { role: "ASSISTANT", content: json.data.assistant.content },
      ]);
      setMessage("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lỗi AI");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      title="Trợ lý AI"
      subtitle="Hỗ trợ SEO, bio và tăng trưởng kênh"
    >
      <Card>
        <CardHeader>
          <CardTitle>Hội thoại</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-48 space-y-3 rounded-xl bg-stone-50 p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-stone-500">
                Hỏi về SEO, tên miền, giá gói hoặc bố cục profile.
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={
                    m.role === "USER"
                      ? "ml-8 rounded-xl bg-orange-500 px-3 py-2 text-sm text-white"
                      : "mr-8 rounded-xl bg-white px-3 py-2 text-sm text-stone-700 shadow-sm"
                  }
                >
                  {m.content}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn của bạn"
            />
            <Button onClick={send} disabled={loading || !message.trim()}>
              {loading ? "..." : "Gửi"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
