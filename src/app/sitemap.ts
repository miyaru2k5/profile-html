import type { MetadataRoute } from "next";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { publicSiteUrl } from "@/shared/lib/domain";

export default function sitemap(): MetadataRoute.Sitemap {
  const profiles = getMemoryStore().profiles.filter((p) => p.status === "PUBLISHED");
  const base = publicSiteUrl("/").replace(/\/$/, "");

  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...profiles.map((p) => ({
      url: p.slug === "miyaru" ? `${base}/` : `${base}/profile/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: p.slug === "miyaru" ? 1 : 0.9,
    })),
  ];
}
