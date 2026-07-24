import { createHash, randomBytes } from "crypto";
import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type DomainRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const createDomainSchema = z.object({
  tenantId: z.string().min(1),
  profileId: z.string().optional().nullable(),
  hostname: z
    .string()
    .min(3)
    .max(253)
    .regex(/^[a-z0-9.-]+$/i, "Tên miền không hợp lệ"),
  type: z.enum(["SUBDOMAIN", "CUSTOM"]).default("CUSTOM"),
  isPrimary: z.boolean().optional(),
});

export class DomainService {
  private store() {
    return getMemoryStore();
  }

  listByTenant(tenantId: string) {
    return this.store().domains.filter((d) => d.tenantId === tenantId);
  }

  listByProfile(profileId: string) {
    return this.store().domains.filter((d) => d.profileId === profileId);
  }

  findByHostname(hostname: string) {
    const host = hostname.toLowerCase().split(":")[0];
    return this.store().domains.find((d) => d.hostname.toLowerCase() === host) ?? null;
  }

  create(input: z.infer<typeof createDomainSchema>) {
    const hostname = input.hostname.toLowerCase();
    if (this.findByHostname(hostname)) {
      throw AppError.conflict(`Tên miền '${hostname}' đã được đăng ký`);
    }
    const ts = new Date().toISOString();
    const token = createHash("sha256").update(randomBytes(32)).digest("hex").slice(0, 32);
    const domain: DomainRecord = {
      id: createId("dom"),
      tenantId: input.tenantId,
      profileId: input.profileId ?? null,
      hostname,
      type: input.type,
      status: input.type === "SUBDOMAIN" ? "ACTIVE" : "PENDING",
      isPrimary: Boolean(input.isPrimary),
      verificationToken: input.type === "CUSTOM" ? token : null,
      verifiedAt: input.type === "SUBDOMAIN" ? ts : null,
      sslStatus: input.type === "SUBDOMAIN" ? "active" : "pending",
      createdAt: ts,
      updatedAt: ts,
    };
    if (domain.isPrimary) {
      this.store().domains.forEach((d) => {
        if (d.tenantId === input.tenantId) d.isPrimary = false;
      });
    }
    this.store().domains.push(domain);
    return domain;
  }

  getDnsInstructions(domainId: string) {
    const domain = this.store().domains.find((d) => d.id === domainId);
    if (!domain) throw AppError.notFound("Domain", domainId);
    return {
      domain,
      records: [
        {
          type: "TXT",
          host: `_miyaru-verify.${domain.hostname}`,
          value: `miyaru-domain-verification=${domain.verificationToken}`,
        },
        {
          type: "CNAME",
          host: domain.hostname,
          value: "cname.vercel-dns.com",
        },
      ],
    };
  }

  verify(domainId: string, presentedToken?: string) {
    const domain = this.store().domains.find((d) => d.id === domainId);
    if (!domain) throw AppError.notFound("Domain", domainId);
    if (domain.type === "SUBDOMAIN") {
      domain.status = "ACTIVE";
      domain.sslStatus = "active";
      domain.verifiedAt = new Date().toISOString();
      return domain;
    }
    domain.status = "VERIFYING";
    const ok =
      !domain.verificationToken ||
      presentedToken === domain.verificationToken ||
      process.env.DOMAIN_VERIFY_BYPASS === "true";
    if (!ok) {
      domain.status = "FAILED";
      domain.updatedAt = new Date().toISOString();
      throw AppError.validation("Xác minh DNS thất bại", { code: "DOMAIN_VERIFICATION_FAILED" });
    }
    domain.status = "ACTIVE";
    domain.sslStatus = "active";
    domain.verifiedAt = new Date().toISOString();
    domain.updatedAt = domain.verifiedAt;
    return domain;
  }

  assignProfile(domainId: string, profileId: string | null) {
    const domain = this.store().domains.find((d) => d.id === domainId);
    if (!domain) throw AppError.notFound("Domain", domainId);
    domain.profileId = profileId;
    domain.updatedAt = new Date().toISOString();
    return domain;
  }
}
