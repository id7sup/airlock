/**
 * Service de géolocalisation par IP
 * 
 * Utilise ip-api.com (service gratuit, 45 requêtes/min) pour obtenir
 * la localisation géographique à partir d'une adresse IP.
 */

export type LocationQuality = "residential_or_mobile" | "hosting_or_datacenter" | "vpn_or_anonymous_proxy" | "unknown";

export interface GeolocationResult {
  country?: string;
  city?: string;
  region?: string;
  geonameId?: number; // GeoNames ID pour la ville (utilisé pour dériver les coordonnées)
  latitude?: number; // Coordonnées dérivées depuis geonameId (centre de la ville)
  longitude?: number; // Coordonnées dérivées depuis geonameId (centre de la ville)
  accuracy_radius_km?: number; // Rayon d'incertitude en km
  // IP n'est PAS stockée dans le résultat final (sauf cas exceptionnels de rate-limiting/sécurité)
  isp?: string;
  asn?: string;
  isDatacenter?: boolean;
  isVPN?: boolean;
  location_quality?: LocationQuality; // Qualité de la localisation
}

/**
 * Récupère la géolocalisation depuis une adresse IP
 * 
 * @param ip - Adresse IP à géolocaliser
 * @returns Données de géolocalisation ou objet avec seulement l'IP en cas d'erreur
 */
/**
 * Détecte la qualité de localisation basée sur ISP et ASN
 * Utilise des patterns connus pour classifier le type de réseau
 */
function detectLocationQuality(isp?: string, asn?: string): { 
  isDatacenter: boolean; 
  isVPN: boolean; 
  location_quality: LocationQuality;
} {
  if (!isp && !asn) {
    return { isDatacenter: false, isVPN: false, location_quality: "unknown" };
  }

  const ispLower = (isp || '').toLowerCase();
  const asnLower = (asn || '').toLowerCase();

  // Patterns pour datacenters/hosting
  const datacenterPatterns = [
    'datacenter', 'data center', 'hosting', 'server', 'cloud',
    'amazon', 'aws', 'google cloud', 'azure', 'digitalocean',
    'linode', 'vultr', 'ovh', 'hetzner', 'contabo', 'scaleway',
    'rackspace', 'softlayer', 'ibm cloud', 'oracle cloud'
  ];

  // Patterns pour VPN/proxy anonyme
  const vpnPatterns = [
    'vpn', 'proxy', 'tor', 'anonymizer', 'nordvpn', 'expressvpn',
    'surfshark', 'cyberghost', 'private internet access', 'mullvad',
    'windscribe', 'protonvpn', 'hide.me', 'tunnelbear', 'vyprvpn',
    'ipvanish', 'hotspot shield', 'purevpn', 'cloudflare warp',
    'warp', 'mozilla vpn', 'adguard', 'kaspersky', 'bitdefender',
    'f-secure', 'avast secureline', 'avg secure', 'zenmate'
  ];

  const isDatacenter = datacenterPatterns.some(pattern => 
    ispLower.includes(pattern) || asnLower.includes(pattern)
  );

  const isVPN = vpnPatterns.some(pattern => 
    ispLower.includes(pattern) || asnLower.includes(pattern)
  );

  let location_quality: LocationQuality = "residential_or_mobile";
  if (isDatacenter) {
    location_quality = "hosting_or_datacenter";
  } else if (isVPN) {
    location_quality = "vpn_or_anonymous_proxy";
  }

  return { isDatacenter, isVPN, location_quality };
}

// Cache simple en mémoire pour les résultats GeoIP (TTL 24h)
const geoCache = new Map<string, { result: GeolocationResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

/**
 * Dérive les coordonnées du centre de ville depuis un geoname ID
 * 
 * Utilise l'API GeoNames pour obtenir les coordonnées du centre de la ville.
 * Tous les visiteurs d'une même ville "tombent" au même point (centre de la ville).
 * 
 * @param geonameId - GeoNames ID de la ville
 * @returns Coordonnées (latitude, longitude) ou undefined si erreur
 */
async function getCoordinatesFromGeonameId(geonameId: number): Promise<{ latitude: number; longitude: number } | undefined> {
  try {
    // Utiliser l'API GeoNames (gratuite, nécessite un username)
    // Pour l'instant, on utilise une approche simplifiée : on peut aussi utiliser
    // un cache local ou une base de données de geoname IDs
    const username = process.env.GEONAMES_USERNAME || "demo"; // Utiliser "demo" par défaut (limité)
    const response = await fetch(
      `http://api.geonames.org/getJSON?geonameId=${geonameId}&username=${username}`,
      { headers: { 'User-Agent': 'Airlock/1.0' } }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.lat && data.lng) {
        return {
          latitude: parseFloat(data.lat),
          longitude: parseFloat(data.lng),
        };
      }
    }
  } catch (error) {
    console.error(`[GEOLOCATION] Erreur lors de la récupération des coordonnées pour geonameId ${geonameId}:`, error);
  }
  return undefined;
}

/**
 * Récupère la géolocalisation depuis une adresse IP
 * 
 * IMPORTANT: L'IP n'est PAS stockée dans le résultat final (sauf cas exceptionnels).
 * On fait un lookup de localisation approximative à partir de l'IP, puis on jette l'IP.
 * 
 * On stocke: ville/région/pays + geoname ID
 * Les coordonnées sont dérivées depuis le geoname ID (centre de la ville).
 * 
 * @param ip - Adresse IP à géolocaliser (utilisée uniquement pour le lookup, pas stockée)
 * @param cloudflareHeaders - Headers Cloudflare optionnels (cf-*)
 * @returns Données de géolocalisation SANS l'IP (sauf cas exceptionnels)
 */
export async function getGeolocationFromIP(
  ip: string, 
  cloudflareHeaders?: { 
    country?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    region?: string;
  }
): Promise<GeolocationResult> {
  // Vérifier le cache
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  // Si Cloudflare headers sont disponibles, les utiliser en priorité
  if (cloudflareHeaders) {
    const { country, city, latitude, longitude, region } = cloudflareHeaders;
    
    if (country) {
      // Cloudflare ne fournit pas de geoname ID, on utilise les coordonnées directement
      // mais on les considère comme centre de ville (approximation)
      const result: GeolocationResult = {
        // IP n'est PAS stockée dans le résultat final
        country,
        city: city || undefined,
        region: region || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        accuracy_radius_km: 5, // Cloudflare donne généralement une bonne précision
        location_quality: "residential_or_mobile", // Par défaut, on assume que c'est un utilisateur réel
        isDatacenter: false,
        isVPN: false,
      };
      
      // Mettre en cache (utiliser l'IP comme clé pour le cache uniquement)
      geoCache.set(ip, { result, timestamp: Date.now() });
      return result;
    }
  }
  try {
    // Essayer d'abord ipapi.co (plus précis, gratuit jusqu'à 1000 req/jour)
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: {
          'User-Agent': 'Airlock/1.0'
        }
      });
      const data = await response.json();

      if (!data.error) {
        const isp = data.org || undefined;
        const asn = data.asn ? `AS${data.asn} - ${data.org || ''}`.trim() : undefined;
        const { isDatacenter, isVPN, location_quality } = detectLocationQuality(isp, asn);
        
        // ipapi.co fournit aussi org_type qui peut indiquer "hosting" ou "business"
        const orgType = data.org_type?.toLowerCase() || '';
        const isDatacenterFromOrgType = orgType === 'hosting' || orgType === 'datacenter';
        const finalIsDatacenter = isDatacenter || isDatacenterFromOrgType;
        const finalLocationQuality = finalIsDatacenter ? "hosting_or_datacenter" : location_quality;

        // Récupérer le geoname ID depuis ipapi.co (dans location.geoname_id)
        const geonameId = data.location?.geoname_id || data.geoname_id || undefined;
        
        // Si on a un geoname ID et que ce n'est pas un datacenter/VPN, dériver les coordonnées
        let latitude: number | undefined;
        let longitude: number | undefined;
        if (geonameId && !finalIsDatacenter && !isVPN) {
          const coords = await getCoordinatesFromGeonameId(geonameId);
          if (coords) {
            latitude = coords.latitude;
            longitude = coords.longitude;
          }
        } else if (!finalIsDatacenter && !isVPN && data.latitude && data.longitude) {
          // Fallback: utiliser les coordonnées de l'API si pas de geoname ID
          latitude = data.latitude;
          longitude = data.longitude;
        }

        // Estimation de l'accuracy radius
        let accuracy_radius_km: number | undefined;
        if (latitude && longitude) {
          if (finalLocationQuality === "residential_or_mobile") {
            accuracy_radius_km = 5; // ~5km pour résidentiel/mobile
          } else if (finalLocationQuality === "vpn_or_anonymous_proxy") {
            accuracy_radius_km = 50; // ~50km pour VPN/proxy
          } else if (finalLocationQuality === "hosting_or_datacenter") {
            accuracy_radius_km = 100; // ~100km pour datacenter
          } else {
            accuracy_radius_km = 25; // ~25km par défaut
          }
        }

        // Construire le résultat SANS l'IP (sauf cas exceptionnels)
        const result: GeolocationResult = {
          // IP n'est PAS stockée dans le résultat final
          country: data.country_name || data.country || undefined,
          city: (finalIsDatacenter || isVPN) ? undefined : (data.city || undefined),
          region: (finalIsDatacenter || isVPN) ? undefined : (data.region || data.region_code || undefined),
          geonameId: geonameId ? parseInt(String(geonameId)) : undefined,
          latitude: (finalIsDatacenter || isVPN) ? undefined : latitude,
          longitude: (finalIsDatacenter || isVPN) ? undefined : longitude,
          accuracy_radius_km: (finalIsDatacenter || isVPN) ? undefined : accuracy_radius_km,
          isp: isp,
          asn: asn,
          isDatacenter: finalIsDatacenter,
          isVPN,
          location_quality: finalLocationQuality,
        };
        
        // Mettre en cache (utiliser l'IP comme clé pour le cache uniquement)
        geoCache.set(ip, { result, timestamp: Date.now() });
        return result;
      }
    } catch (ipapiError) {
      // Fallback sur ip-api.com si ipapi.co échoue
    }

    // Fallback : ip-api.com (gratuit, 45 req/min)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,regionName,lat,lon,query,isp,as,asname`);
    const data = await response.json();

    if (data.status === 'success') {
      const isp = data.isp || undefined;
      const asn = data.as ? `${data.as} - ${data.asname || ''}`.trim() : undefined;
      const { isDatacenter, isVPN, location_quality } = detectLocationQuality(isp, asn);

      // Estimation de l'accuracy radius basée sur la qualité
      let accuracy_radius_km: number | undefined;
      if (data.lat && data.lon) {
        if (location_quality === "residential_or_mobile") {
          accuracy_radius_km = 5;
        } else if (location_quality === "vpn_or_anonymous_proxy") {
          accuracy_radius_km = 50;
        } else if (location_quality === "hosting_or_datacenter") {
          accuracy_radius_km = 100;
        } else {
          accuracy_radius_km = 25;
        }
      }
      
      // ip-api.com ne fournit pas de geoname ID, on utilise les coordonnées directement
      // mais on les considère comme centre de ville (approximation)
      const result: GeolocationResult = {
        // IP n'est PAS stockée dans le résultat final
        country: data.country || undefined,
        city: data.city || undefined,
        region: data.regionName || undefined,
        // Pas de geoname ID depuis ip-api.com
        latitude: (isDatacenter || isVPN) ? undefined : (data.lat || undefined),
        longitude: (isDatacenter || isVPN) ? undefined : (data.lon || undefined),
        accuracy_radius_km: (isDatacenter || isVPN) ? undefined : accuracy_radius_km,
        isp: isp,
        asn: asn,
        isDatacenter,
        isVPN,
        location_quality,
      };
      
      // Mettre en cache (utiliser l'IP comme clé pour le cache uniquement)
      geoCache.set(ip, { result, timestamp: Date.now() });
      return result;

    }
  } catch (error: any) {
    // Ignorer les erreurs de géolocalisation (non critique)
    console.error("Geolocation error:", error);
  }

  // En cas d'erreur, retourner un résultat vide (sans IP)
  const fallbackResult: GeolocationResult = {};
  geoCache.set(ip, { result: fallbackResult, timestamp: Date.now() });
  return fallbackResult;
}

// Cache dédié pour les vérifications VPN (TTL court de 5 min)
const vpnCheckCache = new Map<string, { result: boolean; geolocation: GeolocationResult; timestamp: number }>();
const VPN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Vérifie si une IP provient d'un VPN ou datacenter
 *
 * Utilise ip-api.com avec les champs `proxy` et `hosting` qui fournissent
 * une détection fiable des VPN/proxy/Tor et des datacenters/hébergeurs.
 * Ne se base PAS sur les headers Cloudflare (qui ne fournissent pas cette info).
 *
 * @param ip - Adresse IP à vérifier
 * @returns { isBlocked, geolocation } - true si VPN/datacenter détecté
 */
export async function isVPNOrDatacenter(ip: string): Promise<{ isBlocked: boolean; geolocation: GeolocationResult }> {
  // Vérifier le cache VPN
  const cached = vpnCheckCache.get(ip);
  if (cached && Date.now() - cached.timestamp < VPN_CACHE_TTL) {
    return { isBlocked: cached.result, geolocation: cached.geolocation };
  }

  try {
    // Utiliser ip-api.com avec les champs proxy et hosting pour une détection fiable
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,regionName,lat,lon,isp,as,asname,proxy,hosting`,
      { headers: { 'User-Agent': 'Airlock/1.0' } }
    );
    const data = await response.json();

    if (data.status === 'success') {
      const isp = data.isp || undefined;
      const asn = data.as ? `${data.as} - ${data.asname || ''}`.trim() : undefined;
      const { isDatacenter: isDatacenterPattern, isVPN: isVPNPattern, location_quality } = detectLocationQuality(isp, asn);

      // Combiner la détection ip-api.com (proxy/hosting) avec le pattern matching
      const isProxy = data.proxy === true;
      const isHosting = data.hosting === true;
      const isBlocked = isProxy || isHosting || isDatacenterPattern || isVPNPattern;

      const geolocation: GeolocationResult = {
        country: data.country || undefined,
        city: data.city || undefined,
        region: data.regionName || undefined,
        isp,
        asn,
        isDatacenter: isHosting || isDatacenterPattern,
        isVPN: isProxy || isVPNPattern,
        location_quality: (isProxy || isVPNPattern) ? "vpn_or_anonymous_proxy"
          : (isHosting || isDatacenterPattern) ? "hosting_or_datacenter"
          : location_quality,
      };

      vpnCheckCache.set(ip, { result: isBlocked, geolocation, timestamp: Date.now() });
      return { isBlocked, geolocation };
    }
  } catch (error) {
    console.error("[VPN_CHECK] Erreur lors de la vérification VPN:", error);
  }

  // Fallback : essayer ipapi.co
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'Airlock/1.0' }
    });
    const data = await response.json();

    if (!data.error) {
      const isp = data.org || undefined;
      const asn = data.asn ? `AS${data.asn} - ${data.org || ''}`.trim() : undefined;
      const { isDatacenter, isVPN, location_quality } = detectLocationQuality(isp, asn);

      const orgType = data.org_type?.toLowerCase() || '';
      const isHostingOrg = orgType === 'hosting' || orgType === 'datacenter';
      const isBlocked = isDatacenter || isVPN || isHostingOrg;

      const geolocation: GeolocationResult = {
        country: data.country_name || data.country || undefined,
        city: data.city || undefined,
        region: data.region || undefined,
        isp,
        asn,
        isDatacenter: isDatacenter || isHostingOrg,
        isVPN,
        location_quality: isVPN ? "vpn_or_anonymous_proxy"
          : (isDatacenter || isHostingOrg) ? "hosting_or_datacenter"
          : location_quality,
      };

      vpnCheckCache.set(ip, { result: isBlocked, geolocation, timestamp: Date.now() });
      return { isBlocked, geolocation };
    }
  } catch (error) {
    console.error("[VPN_CHECK] Fallback ipapi.co error:", error);
  }

  // En cas d'erreur totale, ne pas bloquer
  const emptyGeo: GeolocationResult = {};
  vpnCheckCache.set(ip, { result: false, geolocation: emptyGeo, timestamp: Date.now() });
  return { isBlocked: false, geolocation: emptyGeo };
}

/**
 * Extrait les headers de localisation Cloudflare si disponibles
 * 
 * Cloudflare peut injecter des headers de localisation via "Add visitor location headers"
 * Ces headers sont plus fiables que les appels API externes
 * 
 * @param headers - Headers HTTP (Request ou Headers)
 * @returns Headers Cloudflare de localisation ou undefined
 */
export function getCloudflareLocationHeaders(headers: Request | Headers): {
  country?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  region?: string;
} | undefined {
  const getHeader = (name: string): string | null => {
    if (headers instanceof Headers) {
      return headers.get(name);
    }
    return headers.headers.get(name);
  };

  const country = getHeader('cf-ipcountry');
  const city = getHeader('cf-ipcity');
  const latitude = getHeader('cf-iplatitude');
  const longitude = getHeader('cf-iplongitude');
  const region = getHeader('cf-ipregion');

  if (country) {
    return {
      country,
      city: city || undefined,
      latitude: latitude || undefined,
      longitude: longitude || undefined,
      region: region || undefined,
    };
  }

  return undefined;
}

/**
 * Extrait l'adresse IP réelle du client depuis les headers HTTP
 * 
 * Priorise cf-connecting-ip (Cloudflare/Vercel) puis x-forwarded-for
 * si on est derrière un proxy maîtrisé.
 * 
 * @param request - Objet Request HTTP ou Headers
 * @returns Adresse IP ou 'unknown' si non trouvée
 */
export function getClientIP(request: Request | Headers): string {
  const getHeader = (name: string): string | null => {
    if (request instanceof Headers) {
      return request.get(name);
    }
    return request.headers.get(name);
  };

  // 1. Prioriser cf-connecting-ip (Cloudflare/Vercel) - source la plus fiable
  const cfConnectingIP = getHeader('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // 2. x-forwarded-for peut contenir une chaîne d'IPs (client, proxy1, proxy2...)
  // On prend la première seulement si on est derrière un proxy maîtrisé (Vercel/Cloudflare)
  // Vérifier qu'on est bien sur Vercel via la présence de x-vercel-id ou cf-*
  const vercelId = getHeader('x-vercel-id');
  const hasCloudflareHeaders = getHeader('cf-ray') !== null;
  
  if (vercelId || hasCloudflareHeaders) {
    const forwarded = getHeader('x-forwarded-for');
    if (forwarded) {
      // Prendre la première IP de la chaîne (celle du client réel)
      return forwarded.split(',')[0].trim();
    }
  }

  // 3. x-real-ip (nginx/autres proxies)
  const realIP = getHeader('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // 4. Fallback sur x-forwarded-for même sans proxy maîtrisé (moins fiable)
  const forwarded = getHeader('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return 'unknown';
}
