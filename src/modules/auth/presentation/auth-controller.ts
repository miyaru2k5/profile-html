import type { NextRequest } from "next/server";
import { getContainer } from "@/core/di/container";
import { getBearerToken } from "@/core/http/auth-header";
import { fail, ok } from "@/core/http/api-response";
import { loginSchema, registerSchema } from "@/modules/auth/application/auth-service";
import { ROLE_LABELS_VI } from "@/modules/auth/domain/permissions";

export class AuthController {
  static async register(req: NextRequest) {
    try {
      const body = registerSchema.parse(await req.json());
      const result = await getContainer().auth.register(body);
      return ok(result);
    } catch (e) {
      return fail(e);
    }
  }

  static async login(req: NextRequest) {
    try {
      const body = loginSchema.parse(await req.json());
      const result = await getContainer().auth.login(body);
      return ok(result);
    } catch (e) {
      return fail(e);
    }
  }

  static async me(req: NextRequest) {
    try {
      const c = getContainer();
      const user = await c.auth.requireUser(getBearerToken(req));
      const tenants = c.tenants.listForUser(user.id);
      const tenantId = req.nextUrl.searchParams.get("tenantId") ?? tenants[0]?.id ?? null;
      const ctx = c.access.resolve(user, tenantId);

      const memberships = tenants.map((t) => {
        const member = c.tenants.assertMember(t.id, user.id);
        const perms = c.access.listPermissions(member.role, user.isSuperAdmin);
        return {
          tenantId: t.id,
          tenantSlug: t.slug,
          tenantName: t.name,
          role: member.role,
          roleLabel: ROLE_LABELS_VI[member.role],
          permissions: perms,
        };
      });

      return ok({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          locale: user.locale,
          isSuperAdmin: user.isSuperAdmin,
        },
        tenants,
        activeTenantId: ctx.tenantId,
        role: ctx.role,
        roleLabel: ctx.role ? ROLE_LABELS_VI[ctx.role] : null,
        permissions: ctx.permissions,
        memberships,
      });
    } catch (e) {
      return fail(e);
    }
  }

  static async logout(req: NextRequest) {
    try {
      const token = getBearerToken(req);
      if (token) await getContainer().auth.logout(token);
      return ok({ loggedOut: true });
    } catch (e) {
      return fail(e);
    }
  }
}
