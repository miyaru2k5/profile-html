import type { NextRequest } from "next/server";
import { ProfileController } from "@/modules/profile/presentation/profile-controller";

export async function GET(req: NextRequest) {
  return ProfileController.list(req);
}

export async function POST(req: NextRequest) {
  return ProfileController.create(req);
}
