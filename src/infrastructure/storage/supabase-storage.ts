import { AppError } from "@/core/errors/app-error";
import { createServerSupabaseClient } from "@/infrastructure/supabase/client";
import type { PutObjectInput, PutObjectResult, StorageProvider } from "@/infrastructure/storage/storage-provider";

export class SupabaseStorageProvider implements StorageProvider {
  private bucket: string;
  private client;

  constructor() {
    try {
      this.client = createServerSupabaseClient();
    } catch {
      throw AppError.internal("Chưa cấu hình Supabase Storage");
    }
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "media";
  }

  getPublicUrl(key: string): string {
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(key);
    return data.publicUrl;
  }

  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    const { error } = await this.client.storage.from(this.bucket).upload(input.key, input.body, {
      contentType: input.contentType,
      upsert: true,
    });
    if (error) throw new AppError("STORAGE_ERROR", error.message, 500);
    return { key: input.key, publicUrl: this.getPublicUrl(input.key) };
  }

  async deleteObject(key: string): Promise<void> {
    const { error } = await this.client.storage.from(this.bucket).remove([key]);
    if (error) throw new AppError("STORAGE_ERROR", error.message, 500);
  }
}
