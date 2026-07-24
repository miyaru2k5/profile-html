import type { NextRequest } from "next/server";
import { MemoryStorageProvider } from "@/infrastructure/storage/memory-storage";

type Params = { params: Promise<{ key: string[] }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { key } = await params;
  const storageKey = key.map(decodeURIComponent).join("/");
  const storage = new MemoryStorageProvider();
  const file = storage.getObject(storageKey);
  if (!file) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
