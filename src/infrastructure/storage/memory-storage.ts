import type { PutObjectInput, PutObjectResult, StorageProvider } from "@/infrastructure/storage/storage-provider";

const globalForFiles = globalThis as unknown as {
  __miyaruFiles?: Map<string, { body: Buffer; contentType: string }>;
};

function files() {
  if (!globalForFiles.__miyaruFiles) {
    globalForFiles.__miyaruFiles = new Map();
  }
  return globalForFiles.__miyaruFiles;
}

export class MemoryStorageProvider implements StorageProvider {
  getPublicUrl(key: string): string {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://miyaru.online";
    return `${base}/api/v1/media/file/${encodeURIComponent(key)}`;
  }

  async putObject(input: PutObjectInput): Promise<PutObjectResult> {
    files().set(input.key, { body: input.body, contentType: input.contentType });
    return { key: input.key, publicUrl: this.getPublicUrl(input.key) };
  }

  async deleteObject(key: string): Promise<void> {
    files().delete(key);
  }

  getObject(key: string) {
    return files().get(key) ?? null;
  }
}
