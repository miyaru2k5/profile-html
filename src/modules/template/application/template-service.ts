import { AppError } from "@/core/errors/app-error";
import { createId, slugify } from "@/core/types/ids";
import { getMemoryStore, type TemplateRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createTemplateSchema = z.object({
  tenantId: z.string().optional().nullable(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(64).optional(),
  description: z.string().max(500).optional().nullable(),
  layout: z.record(z.string(), z.unknown()).default({}),
  isPublic: z.boolean().optional(),
});

export class TemplateService {
  list(tenantId?: string) {
    return getMemoryStore().templates.filter(
      (t) => t.isSystem || t.isPublic || (tenantId && t.tenantId === tenantId),
    );
  }

  get(id: string) {
    const template = getMemoryStore().templates.find((t) => t.id === id);
    if (!template) throw AppError.notFound("Template", id);
    return template;
  }

  create(input: z.infer<typeof createTemplateSchema>) {
    const slug = slugify(input.slug ?? input.name);
    const ts = new Date().toISOString();
    const template: TemplateRecord = {
      id: createId("tpl"),
      tenantId: input.tenantId ?? null,
      name: input.name,
      slug,
      description: input.description ?? null,
      isSystem: false,
      isPublic: input.isPublic ?? false,
      layout: input.layout,
      previewUrl: null,
      createdAt: ts,
      updatedAt: ts,
    };
    getMemoryStore().templates.push(template);
    return template;
  }
}
