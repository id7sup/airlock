import { Metadata } from "next";
import { dataRoomMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = dataRoomMetadata;

export default function DataRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbData = breadcrumbSchema([
    { name: "Accueil", url: siteUrl },
    { name: "Data Room Virtuelle", url: `${siteUrl}/data-room-virtuelle` },
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
