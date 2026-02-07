import { Metadata } from "next";
import { pourAvocatsMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = pourAvocatsMetadata;

export default function PourAvocatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbData = breadcrumbSchema([
    { name: "Accueil", url: siteUrl },
    { name: "Pour Avocats", url: `${siteUrl}/pour-avocats` },
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
