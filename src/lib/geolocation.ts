/**
 * Service de géolocalisation par IP
 * 
 * Utilise ip-api.com (service gratuit, 45 requêtes/min) pour obtenir
 * la localisation géographique à partir d'une adresse IP.
 */

export interface GeolocationResult {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  ip?: string;
  isp?: string;
  asn?: string;
  isDatacenter?: boolean;
  isVPN?: boolean;
}

/**
 * Récupère la géolocalisation depuis une adresse IP
 * 
 * @param ip - Adresse IP à géolocaliser
 * @returns Données de géolocalisation ou objet avec seulement l'IP en cas d'erreur
 */
/**
 * Détecte si une IP provient d'un datacenter ou VPN
 * Basé sur des patterns connus d'ISP et ASN
 */
function detectDatacenterOrVPN(isp?: string, asn?: string): { isDatacenter: boolean; isVPN: boolean } {
  if (!isp && !asn) {
    return { isDatacenter: false, isVPN: false };
  }

  const ispLower = (isp || '').toLowerCase();
  const asnLower = (asn || '').toLowerCase();

  // Patterns pour datacenters
  const datacenterPatterns = [
    'datacenter', 'data center', 'hosting', 'server', 'cloud',
    'amazon', 'aws', 'google cloud', 'azure', 'digitalocean',
    'linode', 'vultr', 'ovh', 'hetzner', 'contabo', 'scaleway'
  ];

  // Patterns pour VPN
  const vpnPatterns = [
    'vpn', 'proxy', 'tor', 'anonymizer', 'nordvpn', 'expressvpn',
    'surfshark', 'cyberghost', 'private internet access', 'mullvad',
    'windscribe', 'protonvpn', 'hide.me', 'tunnelbear'
  ];

  const isDatacenter = datacenterPatterns.some(pattern => 
    ispLower.includes(pattern) || asnLower.includes(pattern)
  );

  const isVPN = vpnPatterns.some(pattern => 
    ispLower.includes(pattern) || asnLower.includes(pattern)
  );

  return { isDatacenter, isVPN };
}

export async function getGeolocationFromIP(ip: string): Promise<GeolocationResult> {
  try {
    // Utiliser ip-api.com (gratuit, 45 req/min, pas de clé API requise)
    // Ajouter les champs ISP et ASN
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,regionName,lat,lon,query,isp,as,asname`);
    const data = await response.json();

    if (data.status === 'success') {
      const isp = data.isp || undefined;
      const asn = data.as ? `${data.as} - ${data.asname || ''}`.trim() : undefined;
      const { isDatacenter, isVPN } = detectDatacenterOrVPN(isp, asn);

      return {
        ip: data.query || ip,
        country: data.country || undefined,
        city: data.city || undefined,
        region: data.regionName || undefined,
        latitude: data.lat || undefined,
        longitude: data.lon || undefined,
        isp: isp,
        asn: asn,
        isDatacenter,
        isVPN,
      };
    }
  } catch (error: any) {
    // Ignorer les erreurs de géolocalisation (non critique)
  }

  return { ip };
}

/**
 * Extrait l'adresse IP réelle du client depuis les headers HTTP
 * 
 * Vérifie plusieurs headers pour obtenir l'IP réelle derrière un proxy/load balancer.
 * 
 * @param request - Objet Request HTTP
 * @returns Adresse IP ou 'unknown' si non trouvée
 */
export function getClientIP(request: Request): string {
  // Essayer différents headers pour obtenir l'IP réelle
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}
