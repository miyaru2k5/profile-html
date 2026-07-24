import { AppError } from "@/core/errors/app-error";
import { createId } from "@/core/types/ids";
import { getMemoryStore, type InvoiceRecord, type SubscriptionRecord } from "@/infrastructure/memory/store";
import { z } from "zod";

export const changePlanSchema = z.object({
  tenantId: z.string().min(1),
  planCode: z.string().min(1),
});

export class BillingService {
  private store() {
    return getMemoryStore();
  }

  listPlans() {
    return this.store().plans.filter((p) => p.isActive);
  }

  getSubscription(tenantId: string) {
    const sub = this.store().subscriptions.find((s) => s.tenantId === tenantId);
    if (!sub) return null;
    const plan = this.store().plans.find((p) => p.id === sub.planId) ?? null;
    return { subscription: sub, plan };
  }

  changePlan(input: z.infer<typeof changePlanSchema>) {
    const plan = this.store().plans.find((p) => p.code === input.planCode && p.isActive);
    if (!plan) throw AppError.notFound("Plan", input.planCode);
    const tenant = this.store().tenants.find((t) => t.id === input.tenantId);
    if (!tenant) throw AppError.notFound("Tenant", input.tenantId);

    const ts = new Date().toISOString();
    const end = new Date();
    end.setMonth(end.getMonth() + (plan.interval === "YEARLY" ? 12 : 1));

    let sub = this.store().subscriptions.find((s) => s.tenantId === input.tenantId);
    if (!sub) {
      sub = {
        id: createId("sub"),
        tenantId: input.tenantId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: ts,
        currentPeriodEnd: end.toISOString(),
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: ts,
        updatedAt: ts,
      } satisfies SubscriptionRecord;
      this.store().subscriptions.push(sub);
    } else {
      sub.planId = plan.id;
      sub.status = "ACTIVE";
      sub.currentPeriodStart = ts;
      sub.currentPeriodEnd = end.toISOString();
      sub.updatedAt = ts;
    }

    tenant.planId = plan.id;
    tenant.updatedAt = ts;

    if (plan.priceCents > 0) {
      const invoice: InvoiceRecord = {
        id: createId("inv"),
        tenantId: tenant.id,
        amountCents: plan.priceCents,
        currency: plan.currency,
        status: "paid",
        issuedAt: ts,
        paidAt: ts,
        pdfUrl: null,
        metadata: { planCode: plan.code },
      };
      this.store().invoices.push(invoice);
    }

    return this.getSubscription(tenant.id);
  }

  listInvoices(tenantId: string) {
    return this.store().invoices.filter((i) => i.tenantId === tenantId);
  }
}
