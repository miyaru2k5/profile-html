import QRCode from "qrcode";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type QrCodeRecord } from "@/infrastructure/memory/store";

export class QrService {
  async ensureDefault(profileId: string, targetUrl: string): Promise<QrCodeRecord> {
    const store = getMemoryStore();
    const existing = store.qrCodes.find((q) => q.profileId === profileId && q.label === "Default");
    if (existing) {
      if (existing.targetUrl !== targetUrl) {
        existing.targetUrl = targetUrl;
        existing.imageData = await QRCode.toDataURL(targetUrl, {
          margin: 1,
          width: 512,
          color: { dark: "#18160f", light: "#ffffff" },
        });
      }
      return existing;
    }

    const imageData = await QRCode.toDataURL(targetUrl, {
      margin: 1,
      width: 512,
      color: { dark: "#18160f", light: "#ffffff" },
    });
    const record: QrCodeRecord = {
      id: createId("qr"),
      profileId,
      label: "Default",
      targetUrl,
      imageData,
      createdAt: new Date().toISOString(),
    };
    store.qrCodes.push(record);
    return record;
  }

  async list(profileId: string) {
    return getMemoryStore().qrCodes.filter((q) => q.profileId === profileId);
  }
}
