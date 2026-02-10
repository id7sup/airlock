import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoPage } from "@/components/shared/SeoPage";
import { alternatives } from "@/data/pseo/alternatives";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export function generateStaticParams() {
  return alternatives.map((a) => ({ concurrent: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ concurrent: string }>;
}): Promise<Metadata> {
  const { concurrent } = await params;
  const data = alternatives.find((a) => a.slug === concurrent);
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `${siteUrl}/alternative/${data.slug}`,
    },
    twitter: {
      title: data.metaTitle,
      description: data.metaDescription,
    },
    alternates: {
      canonical: `${siteUrl}/alternative/${data.slug}`,
    },
  };
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ concurrent: string }>;
}) {
  const { concurrent } = await params;
  const data = alternatives.find((a) => a.slug === concurrent);
  if (!data) notFound();

  return <SeoPage {...data} />;
}
