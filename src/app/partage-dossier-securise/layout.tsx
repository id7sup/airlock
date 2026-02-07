import { Metadata } from "next";
import { partageDossierMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = partageDossierMetadata;

export default function PartageDossierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbData = breadcrumbSchema([
    { name: "Accueil", url: siteUrl },
    { name: "Partage de Dossier Sécurisé", url: `${siteUrl}/partage-dossier-securise` },
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
