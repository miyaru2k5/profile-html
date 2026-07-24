import type { ProfileAggregate } from "@/modules/profile/domain/types";
import { isLocalHost, normalizeHostname, PRIMARY_DOMAIN, publicSiteUrl } from "@/shared/lib/domain";
import { absoluteUrl } from "@/shared/lib/utils";

export class SeoService {
  buildCanonical(profileSlug: string, hostname?: string | null): string {
    const host = normalizeHostname(hostname);
    if (host && !isLocalHost(host)) {
      // Brand domain always canonicalizes to apex miyaru.online
      if (host === PRIMARY_DOMAIN || host === `www.${PRIMARY_DOMAIN}`) {
        return publicSiteUrl("/");
      }
      return `https://${host}/`;
    }
    // Local / path-based profile pages still expose a clean production canonical when configured
    if (profileSlug === "miyaru") {
      return publicSiteUrl("/");
    }
    return absoluteUrl(`/profile/${profileSlug}`);
  }

  buildJsonLd(aggregate: ProfileAggregate, canonical: string): Record<string, unknown> {
    const p = aggregate.profile;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${canonical}#website`,
          url: canonical,
          name: `${p.displayName} Profile`,
          alternateName: [p.handle, p.slug].filter(Boolean),
          inLanguage: p.locale === "vi" ? "vi-VN" : p.locale,
        },
        {
          "@type": "WebPage",
          "@id": `${canonical}#webpage`,
          url: canonical,
          name: p.seoTitle ?? p.displayName,
          description: p.seoDescription ?? p.bio,
          primaryImageOfPage: p.avatarUrl
            ? { "@type": "ImageObject", url: p.avatarUrl }
            : undefined,
        },
        {
          "@type": "Person",
          "@id": `${canonical}#person`,
          name: p.displayName,
          url: canonical,
          image: p.avatarUrl ?? undefined,
          email: p.email ?? undefined,
          telephone: p.phone ?? undefined,
          jobTitle: p.headline ?? undefined,
          description: p.bio ?? undefined,
          sameAs: aggregate.socialLinks.map((s) => s.url),
          address: p.location
            ? { "@type": "PostalAddress", addressCountry: p.location }
            : undefined,
        },
      ],
    };
  }

  buildMetadata(aggregate: ProfileAggregate, hostname?: string | null) {
    const p = aggregate.profile;
    const canonical = this.buildCanonical(p.slug, hostname);
    const title = p.seoTitle ?? `${p.displayName} | Profile`;
    const description = p.seoDescription ?? p.bio ?? "";
    const image = p.ogImageUrl ?? p.bannerUrl ?? p.avatarUrl ?? undefined;
    const jsonLd = p.jsonLd ?? this.buildJsonLd(aggregate, canonical);

    return {
      title,
      description,
      keywords: p.seoKeywords ?? undefined,
      alternates: { canonical },
      openGraph: {
        type: "profile" as const,
        title,
        description,
        url: canonical,
        siteName: p.handle ?? p.displayName,
        images: image ? [{ url: image, width: 1200, height: 630, alt: p.displayName }] : [],
        locale: p.locale === "vi" ? "vi_VN" : p.locale,
      },
      twitter: {
        card: "summary_large_image" as const,
        title,
        description,
        images: image ? [image] : [],
        creator: p.twitterHandle ?? undefined,
      },
      robots: {
        index: p.status === "PUBLISHED",
        follow: p.status === "PUBLISHED",
      },
      jsonLd,
      canonical,
    };
  }
}
