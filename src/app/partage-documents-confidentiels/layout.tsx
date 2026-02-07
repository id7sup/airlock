import { Metadata } from "next";
import { partageConfidentielsMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = partageConfidentielsMetadata;

export default function PartageConfidentielsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbData = breadcrumbSchema([
    { name: "Accueil", url: siteUrl },
    { name: "Partage de Documents Confidentiels", url: `${siteUrl}/partage-documents-confidentiels` },
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
