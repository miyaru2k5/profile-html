import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess, requireAuth } from "@/core/http/require-access";
import { fail, ok } from "@/core/http/api-response";
import { z } from "zod";
import { getMemoryStore } from "@/infrastructure/memory/store";

const trackSchema = z.object({
  profileId: z.string().min(1),
  eventType: z.enum(["page_view", "link_click"]),
  path: z.string().optional(),
  targetUrl: z.string().optional(),
  label: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const c = getContainer();
    const profileId = req.nextUrl.searchParams.get("profileId");
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (profileId) {
      const profile = getMemoryStore().profiles.find((p) => p.id === profileId);
      if (!profile) return ok({ totalViews: 0, totalClicks: 0, daily: [], recent: [] });
      await requireAccess(req, { tenantId: profile.tenantId, permission: "analytics:read" });
      return ok(c.analytics.summary(profileId));
    }
    if (tenantId) {
      await requireAccess(req, { tenantId, permission: "analytics:read" });
      return ok(c.analytics.tenantSummary(tenantId));
    }
    await requireAuth(req);
    return ok({ totalViews: 0, totalClicks: 0 });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    // tracking công khai (pixel) — không yêu cầu auth
    const c = getContainer();
    const body = trackSchema.parse(await req.json());
    if (body.eventType === "link_click") {
      return ok(
        await c.analytics.trackClick(body.profileId, body.targetUrl ?? body.path ?? "", body.label),
      );
    }
    return ok(
      await c.analytics.trackView(body.profileId, {
        path: body.path,
        userAgent: req.headers.get("user-agent") ?? undefined,
        referrer: req.headers.get("referer") ?? undefined,
      }),
    );
  } catch (e) {
    return fail(e);
  }
}
