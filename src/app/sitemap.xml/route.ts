import { NextResponse } from "next/server";
import { MetadataRoute } from "next";

/**
 * Route API explicite pour le sitemap.xml (SEO)
 * 
 * Cette route garantit que le sitemap est toujours accessible publiquement,
 * même si le middleware d'authentification tente de l'intercepter.
 * 
 * Next.js génère automatiquement /sitemap.xml à partir de sitemap.ts,
 * mais cette route explicite prend le dessus pour garantir l'accessibilité.
 */
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

function generateSitemap(): string {
  const baseUrl = siteUrl;
  const currentDate = new Date().toISOString();

  const urls = [
    {
      url: baseUrl,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      url: `${baseUrl}/pricing`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.9",
    },
    {
      url: `${baseUrl}/security`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.9",
    },
    {
      url: `${baseUrl}/faq`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      url: `${baseUrl}/mentions`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.7",
    },
    {
      url: `${baseUrl}/data-room-virtuelle`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      url: `${baseUrl}/partage-dossier-securise`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      url: `${baseUrl}/partage-documents-confidentiels`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      url: `${baseUrl}/alternative-google-drive-pro`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      url: `${baseUrl}/pour-avocats`,
      lastmod: currentDate,
      changefreq: "monthly",
      priority: "0.8",
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return sitemap;
}

export async function GET() {
  const sitemap = generateSitemap();

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
