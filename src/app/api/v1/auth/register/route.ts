import type { NextRequest } from "next/server";
import { AuthController } from "@/modules/auth/presentation/auth-controller";

export async function POST(req: NextRequest) {
  return AuthController.register(req);
}
