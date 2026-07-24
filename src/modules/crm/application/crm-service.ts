import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type CrmLeadRecord, type CrmLeadStatus } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createLeadSchema = z.object({
  tenantId: z.string().min(1),
  ownerId: z.string().optional().nullable(),
  name: z.string().min(1).max(120),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  source: z.string().max(80).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(40).optional().nullable(),
  source: z.string().max(80).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]).optional(),
  ownerId: z.string().optional().nullable(),
});

export class CrmService {
  list(tenantId: string) {
    return getMemoryStore()
      .crmLeads.filter((l) => l.tenantId === tenantId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  create(input: z.infer<typeof createLeadSchema>) {
    const ts = new Date().toISOString();
    const lead: CrmLeadRecord = {
      id: createId("lead"),
      tenantId: input.tenantId,
      ownerId: input.ownerId ?? null,
      name: input.name,
      email: input.email || null,
      phone: input.phone ?? null,
      source: input.source ?? null,
      status: "NEW",
      notes: input.notes ?? null,
      metadata: {},
      createdAt: ts,
      updatedAt: ts,
    };
    getMemoryStore().crmLeads.push(lead);
    return lead;
  }

  update(id: string, input: z.infer<typeof updateLeadSchema>) {
    const lead = getMemoryStore().crmLeads.find((l) => l.id === id);
    if (!lead) throw AppError.notFound("CrmLead", id);
    Object.assign(lead, {
      ...input,
      email: input.email === "" ? null : input.email ?? lead.email,
      status: (input.status as CrmLeadStatus | undefined) ?? lead.status,
      updatedAt: new Date().toISOString(),
    });
    return lead;
  }
}
