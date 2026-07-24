import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess } from "@/core/http/require-access";
import { fail, ok } from "@/core/http/api-response";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const c = getContainer();
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (tenantId) {
      await requireAccess(req, { tenantId, permission: "plugins:read" });
      return ok(c.plugins.installed(tenantId));
    }
    return ok(c.plugins.catalog());
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = z
      .object({ tenantId: z.string(), pluginCode: z.string() })
      .parse(await req.json());
    await requireAccess(req, { tenantId: body.tenantId, permission: "plugins:install" });
    return ok(getContainer().plugins.install(body.tenantId, body.pluginCode));
  } catch (e) {
    return fail(e);
  }
}
