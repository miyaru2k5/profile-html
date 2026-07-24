import type { MetadataRoute } from "next";
import { getMemoryStore } from "@/infrastructure/memory/store";
import { PRIMARY_DOMAIN, publicSiteUrl } from "@/shared/lib/domain";

export default function robots(): MetadataRoute.Robots {
  const base = publicSiteUrl("/").replace(/\/$/, "");
  const customHosts = getMemoryStore()
    .domains.filter(
      (d) =>
        d.status === "ACTIVE" &&
        d.type === "CUSTOM" &&
        d.hostname !== PRIMARY_DOMAIN &&
        d.hostname !== `www.${PRIMARY_DOMAIN}`,
    )
    .map((d) => d.hostname);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
    ],
    sitemap: [`${base}/sitemap.xml`, ...customHosts.map((h) => `https://${h}/sitemap.xml`)],
    host: PRIMARY_DOMAIN,
  };
}
