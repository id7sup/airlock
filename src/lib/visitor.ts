import crypto from "crypto";

/**
 * Génère un hash de l'IP pour identifier les visiteurs de manière anonyme
 */
export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

/**
 * Génère un visitorId unique basé sur l'IP et le user-agent
 */
export function generateVisitorId(ip: string, userAgent?: string): string {
  const combined = `${ip}-${userAgent || ""}`;
  return crypto.createHash("sha256").update(combined).digest("hex").substring(0, 16);
}

/**
 * Catégorise le referer
 */
export function categorizeReferer(referer?: string | null): string {
  if (!referer) return "Direct";
  
  const ref = referer.toLowerCase();
  
  if (ref.includes("whatsapp")) return "WhatsApp";
  if (ref.includes("linkedin")) return "LinkedIn";
  if (ref.includes("facebook")) return "Facebook";
  if (ref.includes("twitter") || ref.includes("x.com")) return "Twitter/X";
  if (ref.includes("email") || ref.includes("mail")) return "Email";
  if (ref.includes("telegram")) return "Telegram";
  if (ref.includes("slack")) return "Slack";
  if (ref.includes("discord")) return "Discord";
  
  // Extraire le domaine
  try {
    const url = new URL(referer);
    return url.hostname.replace("www.", "");
  } catch {
    return "Autre";
  }
}

