import { createId } from "@/core/types/ids";
import { getMemoryStore, type ActivityLogRecord } from "@/infrastructure/memory/store";

export class ActivityLogService {
  async log(input: {
    tenantId?: string | null;
    userId?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<ActivityLogRecord> {
    const record: ActivityLogRecord = {
      id: createId("act"),
      tenantId: input.tenantId ?? null,
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      metadata: input.metadata ?? {},
      createdAt: new Date().toISOString(),
    };
    getMemoryStore().activityLogs.push(record);
    return record;
  }

  list(tenantId?: string, limit = 100) {
    const logs = getMemoryStore().activityLogs;
    const filtered = tenantId ? logs.filter((l) => l.tenantId === tenantId) : logs;
    return filtered.slice(-limit).reverse();
  }
}
