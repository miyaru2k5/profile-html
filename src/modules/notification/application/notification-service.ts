import { createId } from "@/core/types/ids";
import { getMemoryStore, type NotificationRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createNotificationSchema = z.object({
  tenantId: z.string().optional().nullable(),
  userId: z.string().min(1),
  title: z.string().min(1).max(160),
  body: z.string().min(1).max(2000),
  channel: z.enum(["IN_APP", "EMAIL", "WEBHOOK"]).default("IN_APP"),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export class NotificationService {
  listForUser(userId: string) {
    return getMemoryStore()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  create(input: z.infer<typeof createNotificationSchema>) {
    const record: NotificationRecord = {
      id: createId("ntf"),
      tenantId: input.tenantId ?? null,
      userId: input.userId,
      channel: input.channel,
      status: "SENT",
      title: input.title,
      body: input.body,
      payload: input.payload ?? {},
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    getMemoryStore().notifications.push(record);
    return record;
  }

  markRead(id: string, userId: string) {
    const n = getMemoryStore().notifications.find((x) => x.id === id && x.userId === userId);
    if (!n) return null;
    n.status = "READ";
    n.readAt = new Date().toISOString();
    return n;
  }
}
