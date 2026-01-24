import { NextResponse } from "next/server";

/**
 * Route API explicite pour le robots.txt (SEO)
 * 
 * Cette route garantit que le robots.txt est toujours accessible publiquement,
 * même si le middleware d'authentification tente de l'intercepter.
 * 
 * Next.js génère automatiquement /robots.txt à partir de robots.ts,
 * mais cette route explicite prend le dessus pour garantir l'accessibilité.
 */
export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

function generateRobotsTxt(): string {
  // Pas de doublons Bingbot. Pas de lignes vides superflues.
  const robotsTxt = 
`User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /share/
Disallow: /_next/
Disallow: /admin/
# Google
User-agent: Googlebot
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /share/
# Bing
User-agent: Bingbot
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /share/
# OpenAI (ChatGPT)
User-agent: GPTBot
Allow: /
# Anthropic (Claude)
User-agent: ClaudeBot
Allow: /
# Perplexity
User-agent: PerplexityBot
Allow: /
# Common Crawl (utilisé par beaucoup d’IA)
User-agent: CCBot
Allow: /
Sitemap: ${siteUrl}/sitemap.xml`;

  return robotsTxt;
}

export async function GET() {
  const robotsTxt = generateRobotsTxt();

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
