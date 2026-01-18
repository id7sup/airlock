import crypto from "crypto";

/**
 * Extrait le préfixe IP pour regrouper les IPs similaires (même plage réseau)
 * 
 * Pour IPv4 : prend les 3 premiers octets (ex: 192.168.1.x)
 * Pour IPv6 : prend les 64 premiers bits (première moitié)
 * 
 * Cela permet de lier les visiteurs qui changent d'IP dans la même plage réseau
 * (par exemple, changement d'IP dynamique, NAT, etc.)
 * 
 * @param ip - Adresse IP (IPv4 ou IPv6)
 * @returns Préfixe IP anonymisé
 */
export function getIPPrefix(ip: string): string {
  if (ip === "unknown" || !ip) {
    return "unknown";
  }

  // IPv4 : prendre les 3 premiers octets
  const ipv4Match = ip.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/);
  if (ipv4Match) {
    return ipv4Match[1] + ".0"; // Ex: 192.168.1.0
  }

  // IPv6 : prendre les 64 premiers bits (première moitié)
  // Format IPv6 peut être compressé, on normalise d'abord
  if (ip.includes(":")) {
    // Simplification : prendre les 4 premiers groupes (64 bits)
    const parts = ip.split(":");
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(":") + "::";
    }
    return ip.split("::")[0] + "::"; // Prendre la partie avant :: si compression
  }

  // Si on ne peut pas parser, retourner l'IP complète (sera hashée)
  return ip;
}

/**
 * Génère un hash de l'IP pour identifier les visiteurs de manière anonyme
 */
export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

/**
 * Génère un hash du préfixe IP pour regrouper les IPs similaires
 */
export function hashIPPrefix(ip: string): string {
  const prefix = getIPPrefix(ip);
  return crypto.createHash("sha256").update(prefix).digest("hex").substring(0, 16);
}

/**
 * Génère un sel qui tourne (change périodiquement) pour l'anonymous signature
 * Le sel change chaque jour pour améliorer la privacy tout en gardant une cohérence relative
 */
function getRotatingSalt(): string {
  // Sel basé sur la date (change chaque jour)
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  // Utiliser un secret fixe + la date pour générer un sel
  const secret = process.env.VISITOR_SALT_SECRET || "airlock-default-salt-2024";
  return crypto.createHash("sha256").update(`${secret}-${dateStr}`).digest("hex").substring(0, 16);
}

/**
 * Génère un sel fixe pour l'identification stable des visiteurs
 * Ce sel ne change jamais, permettant de regrouper les logs d'un même visiteur sur plusieurs jours
 */
function getStableSalt(): string {
  const secret = process.env.VISITOR_SALT_SECRET || "airlock-default-salt-2024";
  return crypto.createHash("sha256").update(`${secret}-stable`).digest("hex").substring(0, 16);
}

/**
 * Génère un visitorId unique basé sur l'IP et le user-agent avec un sel qui tourne
 * 
 * Utilise l'IP complète + User-Agent + sel (qui change chaque jour) pour produire une
 * "anonymous signature" (hash SHA-256) afin de compter les visiteurs sans cookies par défaut.
 * 
 * IMPORTANT: On utilise l'IP complète (pas le préfixe) pour éviter de regrouper des personnes
 * différentes qui auraient des IPs similaires. Si un utilisateur change d'IP, il sera
 * considéré comme un nouveau visiteur (plus sûr que de regrouper par erreur).
 * 
 * @param ip - Adresse IP du visiteur (sera hashée, pas stockée)
 * @param userAgent - User-Agent du navigateur
 * @returns Hash SHA-256 anonyme pour identifier le visiteur
 */
export function generateVisitorId(ip: string, userAgent?: string): string {
  const salt = getRotatingSalt();
  // Utiliser l'IP complète pour une différenciation précise
  // Cela évite de regrouper des personnes différentes avec des IPs similaires
  const combined = `${ip}-${userAgent || ""}-${salt}`;
  return crypto.createHash("sha256").update(combined).digest("hex");
}

/**
 * Génère un visitorId stable basé sur l'IP et le user-agent avec un sel fixe
 * 
 * Ce visitorId ne change pas selon les jours, permettant de regrouper tous les logs
 * d'un même visiteur même s'il visite sur plusieurs jours.
 * 
 * IMPORTANT: On utilise l'IP complète (pas le préfixe) pour éviter de regrouper des personnes
 * différentes qui auraient des IPs similaires. Si un utilisateur change d'IP, il sera
 * considéré comme un nouveau visiteur (plus sûr que de regrouper par erreur).
 * 
 * @param ip - Adresse IP du visiteur (sera hashée, pas stockée)
 * @param userAgent - User-Agent du navigateur
 * @returns Hash SHA-256 anonyme stable pour identifier le visiteur
 */
export function generateStableVisitorId(ip: string, userAgent?: string): string {
  const salt = getStableSalt();
  // Utiliser l'IP complète pour une différenciation précise
  // Cela évite de regrouper des personnes différentes avec des IPs similaires
  const combined = `${ip}-${userAgent || ""}-${salt}`;
  return crypto.createHash("sha256").update(combined).digest("hex");
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

/**
 * Détecte si une requête provient d'un bot de prévisualisation
 * 
 * Les bots de prévisualisation (WhatsApp, iMessage, Slack, etc.) ont des caractéristiques :
 * - User-Agent spécifique (bot, crawler, preview)
 * - Pas d'exécution JavaScript
 * - Pas d'interaction utilisateur
 * - IP souvent datacenter
 * 
 * @param userAgent - User-Agent de la requête
 * @param referer - Referer de la requête
 * @param isDatacenter - Si l'IP provient d'un datacenter
 * @returns true si c'est probablement un bot de prévisualisation
 */
export function isPreviewBot(userAgent?: string, referer?: string, isDatacenter?: boolean): boolean {
  if (!userAgent) {
    // Pas de User-Agent = probablement un bot
    return true;
  }

  const ua = userAgent.toLowerCase();

  // Patterns de bots de prévisualisation connus
  const botPatterns = [
    // WhatsApp, iMessage, Slack preview bots
    'whatsapp',
    'slack',
    'telegram',
    'discord',
    'facebookexternalhit',
    'facebookcatalog',
    'twitterbot',
    'linkedinbot',
    'slackbot',
    'applebot',
    'applewebkit',
    // Bots génériques
    'bot',
    'crawler',
    'spider',
    'scraper',
    'preview',
    'linkpreview',
    'link preview',
    'unfurler',
    // Antivirus scanners
    'avast',
    'avg',
    'kaspersky',
    'norton',
    'mcafee',
    'sophos',
    'eset',
    'bitdefender',
    'malwarebytes',
    // Autres scanners
    'scan',
    'security',
    'check',
  ];

  // Vérifier si le User-Agent contient un pattern de bot
  const hasBotPattern = botPatterns.some(pattern => ua.includes(pattern));

  // Si c'est un datacenter ET qu'il y a un pattern de bot, c'est très probablement un bot
  if (isDatacenter && hasBotPattern) {
    return true;
  }

  // Si le User-Agent est très court ou manquant de détails, probablement un bot
  if (ua.length < 20) {
    return true;
  }

  // Vérifier les referers connus pour les previews
  if (referer) {
    const ref = referer.toLowerCase();
    const previewReferers = [
      'whatsapp',
      'slack',
      'telegram',
      'discord',
      'imessage',
      'facebook',
      'twitter',
      'linkedin',
    ];
    
    if (previewReferers.some(pr => ref.includes(pr)) && hasBotPattern) {
      return true;
    }
  }

  return hasBotPattern;
}

/**
 * Calcule un score de confiance que le visiteur est un humain réel
 * 
 * Score de 0 à 100 basé sur plusieurs signaux :
 * - js_seen (fort) : +40 points
 * - hasBrowserHeaders (moyen) : +20 points
 * - known_bot_ua (fort négatif) : -50 points
 * 
 * @param signals - Signaux de détection
 * @returns Score de confiance (0-100)
 */
export function calculateVisitorConfidence(signals: {
  js_seen?: boolean;
  hasBrowserHeaders?: boolean;
  userAgent?: string;
  referer?: string;
  isDatacenter?: boolean;
}): number {
  let score = 50; // Score de base (neutre)

  // JS exécuté = très bon signal d'humain
  if (signals.js_seen) {
    score += 40;
  }

  // Headers de navigateur modernes = bon signal
  if (signals.hasBrowserHeaders) {
    score += 20;
  }

  // Bot connu = très mauvais signal
  if (signals.userAgent && isPreviewBot(signals.userAgent, signals.referer, signals.isDatacenter)) {
    score -= 50;
  }

  // Datacenter = signal négatif (mais pas décisif)
  if (signals.isDatacenter) {
    score -= 10;
  }

  // Clamper entre 0 et 100
  return Math.max(0, Math.min(100, score));
}

