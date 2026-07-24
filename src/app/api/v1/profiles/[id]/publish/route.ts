import type { NextRequest } from "next/server";
import { ProfileController } from "@/modules/profile/presentation/profile-controller";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return ProfileController.publish(id, req);
}
