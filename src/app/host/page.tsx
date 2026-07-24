import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getContainer } from "@/core/di/container";
import { ProfileView } from "@/components/profile/profile-view";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost";
  try {
    const aggregate = await getContainer().profiles.getPublicByHostname(host);
    const meta = getContainer().seo.buildMetadata(aggregate, host);
    return {
      title: meta.title,
      description: meta.description,
      alternates: meta.alternates,
      openGraph: meta.openGraph,
      twitter: meta.twitter,
      robots: meta.robots,
    };
  } catch {
    return { title: "Nền tảng Profile Miyaru" };
  }
}

export default async function HostProfilePage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost";
  const c = getContainer();
  let aggregate;
  try {
    aggregate = await c.profiles.getPublicByHostname(host, {
      track: true,
      path: "/",
      ua: h.get("user-agent") ?? undefined,
    });
  } catch {
    notFound();
  }
  const meta = c.seo.buildMetadata(aggregate, host);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.jsonLd) }}
      />
      <ProfileView aggregate={aggregate} />
    </>
  );
}
