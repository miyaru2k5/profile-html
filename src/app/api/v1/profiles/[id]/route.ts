import type { NextRequest } from "next/server";
import { ProfileController } from "@/modules/profile/presentation/profile-controller";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return ProfileController.get(id, req);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return ProfileController.update(id, req);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return ProfileController.remove(id, req);
}
