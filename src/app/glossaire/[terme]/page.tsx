import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoPage } from "@/components/shared/SeoPage";
import { glossaire } from "@/data/pseo/glossaire";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export function generateStaticParams() {
  return glossaire.map((g) => ({ terme: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ terme: string }>;
}): Promise<Metadata> {
  const { terme } = await params;
  const data = glossaire.find((g) => g.slug === terme);
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `${siteUrl}/glossaire/${data.slug}`,
    },
    twitter: {
      title: data.metaTitle,
      description: data.metaDescription,
    },
    alternates: {
      canonical: `${siteUrl}/glossaire/${data.slug}`,
    },
  };
}

export default async function GlossairePage({
  params,
}: {
  params: Promise<{ terme: string }>;
}) {
  const { terme } = await params;
  const data = glossaire.find((g) => g.slug === terme);
  if (!data) notFound();

  return <SeoPage {...data} />;
}
