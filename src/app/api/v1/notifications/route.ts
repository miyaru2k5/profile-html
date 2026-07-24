import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { getBearerToken } from "@/core/http/auth-header";
import { fail, ok } from "@/core/http/api-response";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const c = getContainer();
    const user = await c.auth.requireUser(getBearerToken(req));
    return ok(c.notifications.listForUser(user.id));
  } catch (e) {
    return fail(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const c = getContainer();
    const user = await c.auth.requireUser(getBearerToken(req));
    const body = z.object({ id: z.string() }).parse(await req.json());
    return ok(c.notifications.markRead(body.id, user.id));
  } catch (e) {
    return fail(e);
  }
}
