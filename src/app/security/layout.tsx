import { Metadata } from "next";
import { securityMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

export const metadata: Metadata = securityMetadata;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbData = breadcrumbSchema([
    { name: "Accueil", url: siteUrl },
    { name: "Sécurité", url: `${siteUrl}/security` },
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

