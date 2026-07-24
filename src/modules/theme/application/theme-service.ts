import { AppError } from "@/core/errors/app-error";
import { createId, slugify } from "@/core/types/ids";
import { getMemoryStore, type ThemeRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createThemeSchema = z.object({
  tenantId: z.string().optional().nullable(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(64).optional(),
  description: z.string().max(500).optional().nullable(),
  tokens: z.record(z.string(), z.unknown()).default({}),
  isPublic: z.boolean().optional(),
});

export class ThemeService {
  list(tenantId?: string) {
    const themes = getMemoryStore().themes;
    return themes.filter((t) => t.isSystem || t.isPublic || (tenantId && t.tenantId === tenantId));
  }

  get(id: string) {
    const theme = getMemoryStore().themes.find((t) => t.id === id);
    if (!theme) throw AppError.notFound("Theme", id);
    return theme;
  }

  create(input: z.infer<typeof createThemeSchema>) {
    const slug = slugify(input.slug ?? input.name);
    const ts = new Date().toISOString();
    const theme: ThemeRecord = {
      id: createId("theme"),
      tenantId: input.tenantId ?? null,
      name: input.name,
      slug,
      description: input.description ?? null,
      isSystem: false,
      isPublic: input.isPublic ?? false,
      tokens: input.tokens,
      previewUrl: null,
      createdAt: ts,
      updatedAt: ts,
    };
    getMemoryStore().themes.push(theme);
    return theme;
  }
}
