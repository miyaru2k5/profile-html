import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type AiMessageRecord, type AiSessionRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createSessionSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().max(120).optional().nullable(),
});

export const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(4000),
});

function buildAssistantReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("seo") || lower.includes("meta")) {
    return "Gợi ý SEO: title ≤ 60 ký tự, mô tả 140–160 ký tự, canonical đúng domain, JSON-LD Person + WebPage, ảnh OG 1200×630.";
  }
  if (lower.includes("giá") || lower.includes("price") || lower.includes("billing") || lower.includes("gói")) {
    return "Gói Free: 3 hồ sơ. Gói Pro: tên miền riêng, trợ lý AI, phân tích nâng cao. Đổi gói tại Bảng điều khiển → Thanh toán.";
  }
  if (lower.includes("domain") || lower.includes("dns") || lower.includes("tên miền")) {
    return "Thêm tên miền: tạo TXT `_miyaru-verify.<domain>` kèm token, trỏ CNAME về host nền tảng, rồi bấm Xác minh. HTTPS bật khi domain ACTIVE.";
  }
  return `Mình đã nhận: “${message.slice(0, 200)}”. Bạn có thể nhờ mình soạn bio, gợi ý bố cục block, SEO, hoặc checklist xuất bản profile.`;
}

export class AiService {
  listSessions(tenantId: string, userId: string) {
    return getMemoryStore()
      .aiSessions.filter((s) => s.tenantId === tenantId && s.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  createSession(input: z.infer<typeof createSessionSchema>) {
    const ts = new Date().toISOString();
    const session: AiSessionRecord = {
      id: createId("ai"),
      tenantId: input.tenantId,
      userId: input.userId,
      title: input.title ?? "Trợ lý profile",
      createdAt: ts,
      updatedAt: ts,
    };
    getMemoryStore().aiSessions.push(session);
    getMemoryStore().aiMessages.push({
      id: createId("msg"),
      sessionId: session.id,
      role: "SYSTEM",
      content: "Bạn là trợ lý AI của Miyaru Profile, hỗ trợ SEO, bố cục và tăng trưởng.",
      metadata: {},
      createdAt: ts,
    });
    return session;
  }

  getMessages(sessionId: string) {
    return getMemoryStore()
      .aiMessages.filter((m) => m.sessionId === sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async chat(input: z.infer<typeof chatSchema>) {
    const session = getMemoryStore().aiSessions.find((s) => s.id === input.sessionId);
    if (!session) throw AppError.notFound("AiSession", input.sessionId);
    const ts = new Date().toISOString();

    const userMsg: AiMessageRecord = {
      id: createId("msg"),
      sessionId: session.id,
      role: "USER",
      content: input.message,
      metadata: {},
      createdAt: ts,
    };
    getMemoryStore().aiMessages.push(userMsg);

    const assistantMsg: AiMessageRecord = {
      id: createId("msg"),
      sessionId: session.id,
      role: "ASSISTANT",
      content: buildAssistantReply(input.message),
      metadata: { model: process.env.AI_MODEL ?? "miyaru-local-rules" },
      createdAt: new Date().toISOString(),
    };
    getMemoryStore().aiMessages.push(assistantMsg);
    session.updatedAt = assistantMsg.createdAt;
    return { user: userMsg, assistant: assistantMsg };
  }
}
