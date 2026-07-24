import type { NextRequest } from "next/server";

export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  const cookie = req.cookies.get("miyaru_session")?.value;
  return cookie ?? null;
}
