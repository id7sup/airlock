/**
 * Utilitaire pour obtenir la géolocalisation depuis une adresse IP
 * Utilise ip-api.com (service gratuit, 45 requêtes/min)
 */

export interface GeolocationResult {
  country?: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  ip?: string;
}

export async function getGeolocationFromIP(ip: string): Promise<GeolocationResult> {
  try {
    // Utiliser ip-api.com (gratuit, 45 req/min, pas de clé API requise)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,regionName,lat,lon,query`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        ip: data.query || ip,
        country: data.country || undefined,
        city: data.city || undefined,
        region: data.regionName || undefined,
        latitude: data.lat || undefined,
        longitude: data.lon || undefined,
      };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la géolocalisation:', error);
  }

  return { ip };
}

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

