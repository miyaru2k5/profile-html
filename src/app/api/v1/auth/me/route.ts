import type { NextRequest } from "next/server";
import { AuthController } from "@/modules/auth/presentation/auth-controller";

export async function GET(req: NextRequest) {
  return AuthController.me(req);
}
