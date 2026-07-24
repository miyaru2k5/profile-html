import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { fail, ok } from "@/core/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") ?? undefined;
    return ok(getContainer().marketplace.list(type ?? undefined));
  } catch (e) {
    return fail(e);
  }
}
