import { Metadata } from "next";
import { alternativeGoogleDriveMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = alternativeGoogleDriveMetadata;

export default function AlternativeGoogleDriveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbData = breadcrumbSchema([
    { name: "Accueil", url: siteUrl },
    { name: "Alternative Google Drive Pro", url: `${siteUrl}/alternative-google-drive-pro` },
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
