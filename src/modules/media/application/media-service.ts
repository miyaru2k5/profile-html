import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type MediaAssetRecord, type MediaKind } from "@/infrastructure/memory/store";
import type { StorageProvider } from "@/infrastructure/storage/storage-provider";
import { z } from "zod";

export const uploadMediaSchema = z.object({
  tenantId: z.string().min(1),
  profileId: z.string().optional().nullable(),
  uploadedBy: z.string().optional().nullable(),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  contentBase64: z.string().min(1),
  alt: z.string().max(200).optional().nullable(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
});

function kindFromMime(mime: string): MediaKind {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (mime.includes("pdf") || mime.includes("document")) return "DOCUMENT";
  return "OTHER";
}

export class MediaService {
  constructor(private readonly storage: StorageProvider) {}

  list(tenantId: string) {
    return getMemoryStore().media.filter((m) => m.tenantId === tenantId);
  }

  async upload(input: z.infer<typeof uploadMediaSchema>) {
    const buffer = Buffer.from(input.contentBase64, "base64");
    if (buffer.byteLength !== input.sizeBytes && input.sizeBytes > 0) {
      // tolerate clients that send approximate sizes
    }
    const key = `${input.tenantId}/${Date.now()}-${input.filename}`;
    const stored = await this.storage.putObject({
      key,
      body: buffer,
      contentType: input.mimeType,
    });
    const record: MediaAssetRecord = {
      id: createId("media"),
      tenantId: input.tenantId,
      profileId: input.profileId ?? null,
      uploadedBy: input.uploadedBy ?? null,
      kind: kindFromMime(input.mimeType),
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: buffer.byteLength,
      storageKey: stored.key,
      publicUrl: stored.publicUrl,
      width: input.width ?? null,
      height: input.height ?? null,
      alt: input.alt ?? null,
      createdAt: new Date().toISOString(),
    };
    getMemoryStore().media.push(record);
    return record;
  }

  async remove(id: string) {
    const store = getMemoryStore();
    const asset = store.media.find((m) => m.id === id);
    if (!asset) throw AppError.notFound("MediaAsset", id);
    await this.storage.deleteObject(asset.storageKey);
    store.media = store.media.filter((m) => m.id !== id);
  }
}
