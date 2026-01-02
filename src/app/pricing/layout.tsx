import { Metadata } from "next";
import { pricingMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

export const metadata: Metadata = pricingMetadata;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbData = breadcrumbSchema([
    { name: "Accueil", url: siteUrl },
    { name: "Tarifs", url: `${siteUrl}/pricing` },
  ]);

  return (
    <>
      <StructuredData />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      {children}
    </>
  );
}

