import { Metadata } from "next";
import { documentationMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";
import DocumentationClient from "./DocumentationClient";

export const metadata: Metadata = documentationMetadata;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

const breadcrumbData = breadcrumbSchema([
  { name: "Accueil", url: siteUrl },
  { name: "Documentation Technique", url: `${siteUrl}/documentation` },
]);

export default function DocumentationPage() {
  return (
    <>
      <StructuredData />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      <DocumentationClient />
    </>
  );
}
