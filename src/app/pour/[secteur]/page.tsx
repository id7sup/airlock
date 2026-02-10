import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoPage } from "@/components/shared/SeoPage";
import { secteurs } from "@/data/pseo/secteurs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export function generateStaticParams() {
  return secteurs.map((s) => ({ secteur: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ secteur: string }>;
}): Promise<Metadata> {
  const { secteur } = await params;
  const data = secteurs.find((s) => s.slug === secteur);
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `${siteUrl}/pour/${data.slug}`,
    },
    twitter: {
      title: data.metaTitle,
      description: data.metaDescription,
    },
    alternates: {
      canonical: `${siteUrl}/pour/${data.slug}`,
    },
  };
}

export default async function SecteurPage({
  params,
}: {
  params: Promise<{ secteur: string }>;
}) {
  const { secteur } = await params;
  const data = secteurs.find((s) => s.slug === secteur);
  if (!data) notFound();

  return <SeoPage {...data} />;
}
