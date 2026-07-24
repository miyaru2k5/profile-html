/** Primary public website domain for Miyaru Profile Platform */
export const PRIMARY_DOMAIN =
  process.env.NEXT_PUBLIC_PRIMARY_DOMAIN?.trim() ||
  process.env.PRIMARY_DOMAIN?.trim() ||
  "miyaru.online";

export const PRIMARY_SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || `https://${PRIMARY_DOMAIN}`;

export function getAppHosts(): Set<string> {
  const raw =
    process.env.APP_HOSTS?.trim() ||
    `localhost,127.0.0.1,www.${PRIMARY_DOMAIN}`;
  return new Set(
    raw
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isLocalHost(hostname?: string | null): boolean {
  if (!hostname) return true;
  const host = hostname.split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1";
}

export function normalizeHostname(hostname?: string | null): string | null {
  if (!hostname) return null;
  return hostname.split(":")[0].toLowerCase();
}

export function publicSiteUrl(path = "/"): string {
  const base = PRIMARY_SITE_URL.replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
