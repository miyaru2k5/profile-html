import { getContainer } from "@/core/di/container";
import { fail, ok } from "@/core/http/api-response";

export async function GET() {
  try {
    return ok(getContainer().billing.listPlans());
  } catch (e) {
    return fail(e);
  }
}
