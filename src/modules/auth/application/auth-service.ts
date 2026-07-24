import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type SessionRecord, type UserRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(128),
  tenantName: z.string().min(2).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("seed:")) {
    return password === "demo1234" || password === stored.slice(5);
  }
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const next = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(next));
  } catch {
    return false;
  }
}

export class AuthService {
  private store() {
    return getMemoryStore();
  }

  async register(input: z.infer<typeof registerSchema>) {
    const email = input.email.toLowerCase();
    if (this.store().users.some((u) => u.email === email)) {
      throw AppError.conflict("Email đã được đăng ký");
    }

    const ts = new Date().toISOString();
    const user: UserRecord = {
      id: createId("user"),
      email,
      name: input.name,
      avatarUrl: null,
      supabaseId: null,
      locale: "vi",
      isSuperAdmin: false,
      passwordHash: hashPassword(input.password),
      createdAt: ts,
      updatedAt: ts,
    };
    this.store().users.push(user);

    const tenantSlugBase = (input.tenantName ?? input.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    let slug = tenantSlugBase || `tenant-${user.id.slice(-6)}`;
    let i = 1;
    while (this.store().tenants.some((t) => t.slug === slug)) {
      slug = `${tenantSlugBase}-${i++}`;
    }

    const freePlan = this.store().plans.find((p) => p.code === "free");
    const tenant = {
      id: createId("tenant"),
      name: input.tenantName ?? `Workspace của ${input.name}`,
      slug,
      ownerId: user.id,
      logoUrl: null,
      planId: freePlan?.id ?? null,
      status: "active",
      settings: {},
      createdAt: ts,
      updatedAt: ts,
    };
    this.store().tenants.push(tenant);
    this.store().members.push({
      id: createId("member"),
      tenantId: tenant.id,
      userId: user.id,
      role: "TENANT_OWNER",
      status: "ACTIVE",
      invitedAt: ts,
      joinedAt: ts,
    });

    if (freePlan) {
      const end = new Date();
      end.setDate(end.getDate() + 14);
      this.store().subscriptions.push({
        id: createId("sub"),
        tenantId: tenant.id,
        planId: freePlan.id,
        status: "TRIALING",
        currentPeriodStart: ts,
        currentPeriodEnd: end.toISOString(),
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: ts,
        updatedAt: ts,
      });
    }

    const session = this.createSession(user.id);
    return { user: this.publicUser(user), tenant, token: session.token, expiresAt: session.expiresAt };
  }

  async login(input: z.infer<typeof loginSchema>) {
    const user = this.store().users.find((u) => u.email === input.email.toLowerCase());
    if (!user || !user.passwordHash || !verifyPassword(input.password, user.passwordHash)) {
      throw AppError.unauthorized("Email hoặc mật khẩu không đúng");
    }
    const session = this.createSession(user.id);
    const memberships = this.store().members.filter((m) => m.userId === user.id && m.status === "ACTIVE");
    const tenants = this.store().tenants.filter((t) => memberships.some((m) => m.tenantId === t.id));
    return {
      user: this.publicUser(user),
      tenants,
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async logout(token: string) {
    const s = this.store();
    s.sessions = s.sessions.filter((x) => x.token !== token);
  }

  async getUserByToken(token: string | null | undefined): Promise<UserRecord | null> {
    if (!token) return null;
    const session = this.store().sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await this.logout(token);
      return null;
    }
    return this.store().users.find((u) => u.id === session.userId) ?? null;
  }

  requireUser(token: string | null | undefined) {
    return this.getUserByToken(token).then((user) => {
      if (!user) throw AppError.unauthorized();
      return user;
    });
  }

  private createSession(userId: string): SessionRecord {
    const session: SessionRecord = {
      id: createId("sess"),
      userId,
      token: randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.store().sessions.push(session);
    return session;
  }

  private publicUser(user: UserRecord) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      locale: user.locale,
      isSuperAdmin: user.isSuperAdmin,
      createdAt: user.createdAt,
    };
  }
}
