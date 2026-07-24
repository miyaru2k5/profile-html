import { NextResponse, type NextRequest } from "next/server";
import { getAppHosts, PRIMARY_DOMAIN } from "@/shared/lib/domain";

const APP_HOSTS = getAppHosts();

/** Hosts that should render the primary profile at `/` */
const PROFILE_ROOT_HOSTS = new Set(
  [
    PRIMARY_DOMAIN,
    `www.${PRIMARY_DOMAIN}`,
    process.env.PROFILE_ROOT_HOSTS?.split(",") ?? [],
  ]
    .flat()
    .map((h) => String(h).trim().toLowerCase())
    .filter(Boolean),
);

export function middleware(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();
  const { pathname } = req.nextUrl;

  // Redirect apex www → non-www for primary brand domain
  if (host === `www.${PRIMARY_DOMAIN}`) {
    const url = req.nextUrl.clone();
    url.host = PRIMARY_DOMAIN;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/host")
  ) {
    return NextResponse.next();
  }

  // Primary brand domain + other custom domains → profile host renderer at /
  const isProfileRoot = PROFILE_ROOT_HOSTS.has(host);
  const isCustomHost = host && !APP_HOSTS.has(host);

  if (pathname === "/" && (isProfileRoot || isCustomHost)) {
    const url = req.nextUrl.clone();
    url.pathname = "/host";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
