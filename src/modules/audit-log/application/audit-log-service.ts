import { createId } from "@/core/types/ids";
import { getMemoryStore, type AuditLogRecord } from "@/infrastructure/memory/store";

export class AuditLogService {
  async record(input: {
    tenantId?: string | null;
    actorId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    ip?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLogRecord> {
    const record: AuditLogRecord = {
      id: createId("audit"),
      tenantId: input.tenantId ?? null,
      actorId: input.actorId ?? null,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      createdAt: new Date().toISOString(),
    };
    getMemoryStore().auditLogs.push(record);
    return record;
  }

  list(tenantId?: string, limit = 100) {
    const logs = getMemoryStore().auditLogs;
    const filtered = tenantId ? logs.filter((l) => l.tenantId === tenantId) : logs;
    return filtered.slice(-limit).reverse();
  }
}
