import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { requireAccess, requireAuth } from "@/core/http/require-access";
import { created, fail, ok } from "@/core/http/api-response";
import { createProfileSchema, updateProfileSchema } from "@/modules/profile/application/dto";

export class ProfileController {
  static async list(req: NextRequest) {
    try {
      const c = getContainer();
      const tenantId = req.nextUrl.searchParams.get("tenantId");
      if (!tenantId) {
        const { user } = await requireAuth(req);
        const tenants = c.tenants.listForUser(user.id);
        const profiles = (
          await Promise.all(
            tenants.map(async (t) => {
              const ctx = c.access.resolve(user, t.id);
              if (!c.access.can(ctx, "profiles:read")) return [];
              return c.profiles.listByTenant(t.id);
            }),
          )
        ).flat();
        return ok(profiles);
      }
      await requireAccess(req, { tenantId, permission: "profiles:read" });
      return ok(await c.profiles.listByTenant(tenantId));
    } catch (e) {
      return fail(e);
    }
  }

  static async get(id: string, req: NextRequest) {
    try {
      const c = getContainer();
      const aggregate = await c.profiles.getById(id);
      await requireAccess(req, {
        tenantId: aggregate.profile.tenantId,
        permission: "profiles:read",
      });
      return ok(aggregate);
    } catch (e) {
      return fail(e);
    }
  }

  static async getPublicBySlug(slug: string, req: NextRequest) {
    try {
      const aggregate = await getContainer().profiles.getPublicBySlug(slug, {
        track: true,
        path: req.nextUrl.pathname,
        ua: req.headers.get("user-agent") ?? undefined,
        ref: req.headers.get("referer") ?? undefined,
      });
      return ok(aggregate);
    } catch (e) {
      return fail(e);
    }
  }

  static async create(req: NextRequest) {
    try {
      const c = getContainer();
      const body = createProfileSchema.parse(await req.json());
      const ctx = await requireAccess(req, {
        tenantId: body.tenantId,
        permission: "profiles:create",
      });
      const profile = await c.profiles.create(
        { ...body, ownerId: body.ownerId || ctx.user.id },
        ctx.user.id,
      );
      return created(profile);
    } catch (e) {
      return fail(e);
    }
  }

  static async update(id: string, req: NextRequest) {
    try {
      const c = getContainer();
      const existing = await c.profiles.getById(id);
      const body = updateProfileSchema.parse(await req.json());
      const needsPublish = body.status === "PUBLISHED";
      const ctx = await requireAccess(req, {
        tenantId: existing.profile.tenantId,
        permission: needsPublish
          ? ["profiles:update", "profiles:publish"]
          : "profiles:update",
        mode: needsPublish ? "all" : "any",
      });
      return ok(await c.profiles.update(id, body, ctx.user.id));
    } catch (e) {
      return fail(e);
    }
  }

  static async publish(id: string, req: NextRequest) {
    try {
      const c = getContainer();
      const existing = await c.profiles.getById(id);
      const ctx = await requireAccess(req, {
        tenantId: existing.profile.tenantId,
        permission: "profiles:publish",
      });
      return ok(await c.profiles.publish(id, ctx.user.id));
    } catch (e) {
      return fail(e);
    }
  }

  static async remove(id: string, req: NextRequest) {
    try {
      const c = getContainer();
      const existing = await c.profiles.getById(id);
      const ctx = await requireAccess(req, {
        tenantId: existing.profile.tenantId,
        permission: "profiles:delete",
      });
      await c.profiles.remove(id, ctx.user.id);
      return ok({ deleted: true });
    } catch (e) {
      return fail(e);
    }
  }
}
