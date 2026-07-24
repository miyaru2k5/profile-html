import { AppError } from "@/core/errors/app-error";
import { getMemoryStore } from "@/infrastructure/memory/store";

export class MarketplaceService {
  list(type?: string) {
    return getMemoryStore().marketplace.filter(
      (i) => i.isPublished && (!type || i.type === type),
    );
  }

  getBySlug(slug: string) {
    const item = getMemoryStore().marketplace.find((i) => i.slug === slug && i.isPublished);
    if (!item) throw AppError.notFound("MarketplaceItem", slug);
    return item;
  }
}
