import type { NextRequest } from "next/server";
import { ProfileController } from "@/modules/profile/presentation/profile-controller";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  return ProfileController.getPublicBySlug(slug, req);
}
