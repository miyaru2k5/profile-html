import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type BlockType, type PageBlockRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createBlockSchema = z.object({
  tenantId: z.string().min(1),
  profileId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  type: z.enum([
    "HERO",
    "TEXT",
    "LINKS",
    "SOCIAL",
    "STATS",
    "TAGS",
    "TIMELINE",
    "MEDIA",
    "CTA",
    "EMBED",
    "CUSTOM",
  ]),
  title: z.string().max(120).optional().nullable(),
  content: z.record(z.string(), z.unknown()).default({}),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const reorderBlocksSchema = z.object({
  profileId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
});

export class PageBuilderService {
  listByProfile(profileId: string) {
    return getMemoryStore()
      .blocks.filter((b) => b.profileId === profileId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  create(input: z.infer<typeof createBlockSchema>) {
    const ts = new Date().toISOString();
    const block: PageBlockRecord = {
      id: createId("blk"),
      tenantId: input.tenantId,
      profileId: input.profileId ?? null,
      templateId: input.templateId ?? null,
      type: input.type as BlockType,
      title: input.title ?? null,
      content: input.content,
      sortOrder: input.sortOrder ?? getMemoryStore().blocks.length,
      isVisible: input.isVisible ?? true,
      createdAt: ts,
      updatedAt: ts,
    };
    getMemoryStore().blocks.push(block);
    return block;
  }

  update(id: string, patch: Partial<z.infer<typeof createBlockSchema>>) {
    const block = getMemoryStore().blocks.find((b) => b.id === id);
    if (!block) throw AppError.notFound("PageBlock", id);
    Object.assign(block, {
      ...patch,
      type: (patch.type as BlockType | undefined) ?? block.type,
      updatedAt: new Date().toISOString(),
    });
    return block;
  }

  reorder(input: z.infer<typeof reorderBlocksSchema>) {
    input.orderedIds.forEach((id, index) => {
      const block = getMemoryStore().blocks.find((b) => b.id === id && b.profileId === input.profileId);
      if (block) {
        block.sortOrder = index;
        block.updatedAt = new Date().toISOString();
      }
    });
    return this.listByProfile(input.profileId);
  }

  remove(id: string) {
    const store = getMemoryStore();
    const before = store.blocks.find((b) => b.id === id);
    if (!before) throw AppError.notFound("PageBlock", id);
    store.blocks = store.blocks.filter((b) => b.id !== id);
  }
}
