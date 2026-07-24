import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContainer } from "@/core/di/container";
import { ProfileView } from "@/components/profile/profile-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const aggregate = await getContainer().profiles.getPublicBySlug(slug);
    const meta = getContainer().seo.buildMetadata(aggregate);
    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      alternates: meta.alternates,
      openGraph: meta.openGraph,
      twitter: meta.twitter,
      robots: meta.robots,
    };
  } catch {
    return { title: "Không tìm thấy profile" };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;
  const c = getContainer();
  let aggregate;
  try {
    aggregate = await c.profiles.getPublicBySlug(slug, { track: true, path: `/profile/${slug}` });
  } catch {
    notFound();
  }
  const meta = c.seo.buildMetadata(aggregate);
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
