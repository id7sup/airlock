import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoPage } from "@/components/shared/SeoPage";
import { casUsage } from "@/data/pseo/cas-usage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export function generateStaticParams() {
  return casUsage.map((c) => ({ usecase: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ usecase: string }>;
}): Promise<Metadata> {
  const { usecase } = await params;
  const data = casUsage.find((c) => c.slug === usecase);
  if (!data) return {};

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `${siteUrl}/cas-usage/${data.slug}`,
    },
    twitter: {
      title: data.metaTitle,
      description: data.metaDescription,
    },
    alternates: {
      canonical: `${siteUrl}/cas-usage/${data.slug}`,
    },
  };
}

export default async function CasUsagePage({
  params,
}: {
  params: Promise<{ usecase: string }>;
}) {
  const { usecase } = await params;
  const data = casUsage.find((c) => c.slug === usecase);
  if (!data) notFound();

  return <SeoPage {...data} />;
}
