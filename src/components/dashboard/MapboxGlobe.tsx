"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Globe } from "lucide-react";
import { AnalyticsDetailCard } from "./AnalyticsDetailCard";

interface AnalyticsPoint {
  visitorId?: string;
  userAgent?: string;
  id: string;
  linkId: string;
  type: "VIEW" | "DOWNLOAD" | "OPEN_SHARE" | "OPEN_FOLDER" | "VIEW_FILE" | "DOWNLOAD_FILE" | "ACCESS_DENIED";
  eventType?: string;
  timestamp: string;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ip?: string | null;
  isDatacenter?: boolean;
  isVPN?: boolean;
  location_quality?: "residential_or_mobile" | "hosting_or_datacenter" | "vpn_or_anonymous_proxy" | "unknown";
  accuracy_radius_km?: number | null;
  isp?: string | null;
  asn?: string | null;
  folderName?: string | null;
  visitorIdStable?: string | null;
}

interface MapboxGlobeProps {
  analytics: AnalyticsPoint[];
}

// Couleurs discrètes pour les points
const POINT_COLORS = [
  "#B8D4E8", "#C8E6D4", "#E0D4F0", "#F0D8C8", "#E8D4D8",
  "#D8E8D4", "#D4E0F0", "#F0E0D4", "#E8D8E0", "#D0E8E0",
  "#E0E8D4", "#D8D4E8",
];

function getColorFromId(id: string | number): string {
  const numId = typeof id === 'string' 
    ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) 
    : id;
  return POINT_COLORS[Math.abs(numId) % POINT_COLORS.length];
}

export function MapboxGlobe({ analytics }: MapboxGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAnimatingRef = useRef<boolean>(false);
  const spiderRef = useRef<any>(null); // Pour stocker les points superposés (mêmes coordonnées)
  const isUserInteractingRef = useRef<boolean>(false);
  const rotationAnimationRef = useRef<number | null>(null);

  // Synchroniser isDrawerOpen avec selectedDetail
  useEffect(() => {
    if (selectedDetail) {
      setIsDrawerOpen(true);
    }
  }, [selectedDetail]);

  const handleClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedDetail(null);
    }, 150); // Durée de l'animation
  };

  // 1. Préparer les points GeoJSON - UN SEUL POINT PAR VISITEUR
  const geojsonData = useMemo(() => {
    // RÈGLE D'OR : Zéro data = zéro features
    if (analytics.length === 0) {
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }

    // Filtrer les événements avec géolocalisation valide
    const validEvents = analytics.filter(p => 
      p.latitude != null && 
      p.longitude != null && 
      p.visitorId // Un visiteur doit avoir un visitorId
    );

    // Grouper par visitorId - UN SEUL POINT PAR PERSONNE
    // Prioriser les événements avec la meilleure qualité de localisation
    const visitorMap = new Map<string, typeof validEvents[0]>();
    
    validEvents.forEach(ev => {
      const visitorId = ev.visitorId || '';
      if (!visitorId) return;
      
      const existing = visitorMap.get(visitorId);
      
      if (!existing) {
        visitorMap.set(visitorId, ev);
      } else {
        // Prioriser la meilleure qualité de localisation
        const existingQuality = existing.location_quality || "unknown";
        const currentQuality = ev.location_quality || "unknown";
        
        const qualityOrder: Record<string, number> = {
          "residential_or_mobile": 4,
          "unknown": 3,
          "vpn_or_anonymous_proxy": 2,
          "hosting_or_datacenter": 1,
        };
        
        const existingPriority = qualityOrder[existingQuality] || 0;
        const currentPriority = qualityOrder[currentQuality] || 0;
        
        if (currentPriority > existingPriority) {
          visitorMap.set(visitorId, ev);
        } else if (currentPriority === existingPriority) {
          const existingTime = new Date(existing.timestamp).getTime();
          const currentTime = new Date(ev.timestamp).getTime();
          
          if (currentTime > existingTime) {
            visitorMap.set(visitorId, ev);
          }
        }
      }
    });

    // Convertir en points GeoJSON
    const features = Array.from(visitorMap.values()).map(ev => ({
      type: "Feature" as const,
      properties: {
        eventId: ev.id,
        type: ev.eventType || ev.type || "VIEW",
        timestamp: ev.timestamp,
        linkId: ev.linkId,
        country: ev.country || "Inconnu",
        city: ev.city || "Inconnu",
        region: ev.region || "",
        visitorId: ev.visitorId || "",
        userAgent: ev.userAgent || "",
        ip: ev.ip || null,
        isDatacenter: ev.isDatacenter || false,
        isVPN: ev.isVPN || false,
        location_quality: ev.location_quality || "unknown",
        accuracy_radius_km: ev.accuracy_radius_km || null,
        isp: ev.isp || null,
        asn: ev.asn || null,
        folderName: (ev as any).folderName || null,
        visitorIdStable: (ev as any).visitorIdStable || null,
        pointColor: getColorFromId(ev.visitorId || ev.id),
      },
      geometry: {
        type: "Point" as const,
        coordinates: [ev.longitude!, ev.latitude!] as [number, number],
      },
    }));

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [analytics]);

  // 2. Détecter les points superposés (mêmes coordonnées exactes)
  const exactLocationGroups = useMemo(() => {
    const groups = new Map<string, typeof geojsonData.features>();
    const EPSILON = 0.000001; // ~10cm de précision

    geojsonData.features.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      // Clé basée sur les coordonnées arrondies
      const locationKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
      
      if (!groups.has(locationKey)) {
        groups.set(locationKey, []);
      }
      groups.get(locationKey)!.push(feature);
    });

    // Filtrer pour ne garder que les groupes avec plusieurs points
    const result = new Map<string, typeof geojsonData.features>();
    groups.forEach((features, key) => {
      if (features.length > 1) {
        result.set(key, features);
      }
    });

    return result;
  }, [geojsonData]);

  // 3. Resize le map quand le conteneur change de taille (ex: sidebar toggle)
  useEffect(() => {
    if (!mapContainer.current) return;
    const observer = new ResizeObserver(() => {
      map.current?.resize();
    });
    observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, []);

  // 4. Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Mapbox token manquant");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      center: [0, 20],
      zoom: 1.5,
      minZoom: 1.8,
      maxZoom: 18,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Créer la source GeoJSON avec clustering natif Mapbox
      map.current.addSource("analytics-points", {
        type: "geojson",
        data: geojsonData,
        cluster: true, // Activer le clustering natif
        clusterRadius: 50, // Rayon en pixels pour créer des clusters
        clusterMaxZoom: 14, // Zoom maximum où le clustering est actif
        clusterMinPoints: 2, // Minimum 2 points pour créer un cluster
      });

      // Layer pour les CLUSTERS (filtre strict : uniquement les clusters)
      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "analytics-points",
        filter: ["has", "point_count"], // FILTRE STRICT : uniquement les clusters
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#B8D4E8",
            10,
            "#C8E6D4",
            50,
            "#E0D4F0",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            10,
            25,
            50,
            30,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Layer pour les POINTS (filtre strict : uniquement les points non-clusterisés)
      map.current.addLayer({
        id: "points",
        type: "circle",
        source: "analytics-points",
        filter: ["!", ["has", "point_count"]], // FILTRE STRICT : exclut les clusters
        paint: {
          "circle-color": ["get", "pointColor", ["get", "properties"]],
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Layer de hit pour les clics sur les points
      map.current.addLayer({
        id: "points-hit",
        type: "circle",
        source: "analytics-points",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 20, // Zone de clic plus large
          "circle-opacity": 0, // Invisible mais cliquable
        },
      });

      // Handler pour clic sur CLUSTER
      map.current.on("click", "clusters", (e) => {
        if (!map.current || isAnimatingRef.current) return;

        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;

        const clusterId = feature.properties.cluster_id;
        const pointCount = feature.properties.point_count || 0;

        // Vérifier si c'est un groupe de localisation exacte
        const [lng, lat] = (feature.geometry as any).coordinates;
        const locationKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
        const exactLocationGroup = exactLocationGroups.get(locationKey);

        if (exactLocationGroup && exactLocationGroup.length > 1) {
          // Localisation exacte : ouvrir directement le tiroir avec tous les visiteurs
          const visitors = exactLocationGroup.map(f => ({
            id: f.properties.eventId,
            type: f.properties.type || "VIEW",
            eventType: f.properties.type || "OPEN_SHARE",
            country: f.properties.country || "Inconnu",
            city: f.properties.city || "Inconnu",
            region: f.properties.region || "",
            timestamp: f.properties.timestamp || new Date().toISOString(),
            visitorId: f.properties.visitorId || "",
            userAgent: f.properties.userAgent || "",
            ip: f.properties.ip || null,
            isDatacenter: f.properties.isDatacenter || false,
            isVPN: f.properties.isVPN || false,
            location_quality: f.properties.location_quality || "unknown",
            accuracy_radius_km: f.properties.accuracy_radius_km || null,
            folderName: f.properties.folderName || null,
            visitorIdStable: f.properties.visitorIdStable || null,
          }));

          setSelectedDetail({
            pointCount: visitors.length,
            center: [lng, lat],
            points: visitors,
          });
          setIsDrawerOpen(true);
          return;
        }

        // Cluster normal : zoom avec getClusterExpansionZoom (asynchrone)
        const source = map.current.getSource("analytics-points") as mapboxgl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterId, (error, expansionZoom) => {
          if (error || !map.current || typeof expansionZoom !== 'number') return;

          const currentZoom = map.current.getZoom();

          // Si le cluster ne peut plus s'expanser (même position ou zoom max atteint),
          // ouvrir la card avec tous les visiteurs du cluster
          if (expansionZoom >= 14 || currentZoom >= 12) {
            source.getClusterLeaves(clusterId, pointCount, 0, (err, leaves) => {
              if (err || !leaves || leaves.length === 0) return;

              const visitors = leaves.map((f: any) => ({
                id: f.properties.eventId,
                type: f.properties.type || "VIEW",
                eventType: f.properties.type || "OPEN_SHARE",
                country: f.properties.country || "Inconnu",
                city: f.properties.city || "Inconnu",
                region: f.properties.region || "",
                timestamp: f.properties.timestamp || new Date().toISOString(),
                visitorId: f.properties.visitorId || "",
                userAgent: f.properties.userAgent || "",
                ip: f.properties.ip || null,
                isDatacenter: f.properties.isDatacenter || false,
                isVPN: f.properties.isVPN || false,
                location_quality: f.properties.location_quality || "unknown",
                accuracy_radius_km: f.properties.accuracy_radius_km || null,
                folderName: f.properties.folderName || null,
                visitorIdStable: f.properties.visitorIdStable || null,
              }));

              setSelectedDetail({
                pointCount: visitors.length,
                center: [lng, lat],
                points: visitors,
              });
              setIsDrawerOpen(true);
            });
            return;
          }

          // Zoom vers le niveau d'expansion du cluster, avec un minimum de +3 niveaux
          let targetZoom = Math.max(currentZoom + 3, expansionZoom);

          // Pour les très gros clusters, zoomer un peu moins
          if (pointCount > 20) {
            targetZoom = Math.max(currentZoom + 2.5, expansionZoom);
          }

          // Limiter le zoom maximum
          targetZoom = Math.min(targetZoom, 14);

          setIsDrawerOpen(false);
          setTimeout(() => {
            setSelectedDetail(null);
          }, 150);

          isAnimatingRef.current = true;

          map.current.flyTo({
            center: [lng, lat],
            zoom: targetZoom,
            duration: 600,
            easing: (t: number) => t * (2 - t),
          });

          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 650);
        });
      });

      // Handler pour clic sur POINT
      const handlePointClick = (e: any) => {
        if (isAnimatingRef.current || !map.current) return;

        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;

        const props = feature.properties;
        const eventId = props.eventId;

        if (!eventId) {
          console.warn("[MAPBOX] Point cliqué sans eventId:", props);
          return;
        }

        // Vérifier si ce point fait partie d'un groupe de localisation exacte
        const [lng, lat] = (feature.geometry as any).coordinates;
        const locationKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
        const exactLocationGroup = exactLocationGroups.get(locationKey);

        if (exactLocationGroup && exactLocationGroup.length > 1) {
          // Localisation exacte : ouvrir le tiroir avec tous les visiteurs
          const visitors = exactLocationGroup.map(f => ({
            id: f.properties.eventId,
            type: f.properties.type || "VIEW",
            eventType: f.properties.type || "OPEN_SHARE",
            country: f.properties.country || "Inconnu",
            city: f.properties.city || "Inconnu",
            region: f.properties.region || "",
            timestamp: f.properties.timestamp || new Date().toISOString(),
            visitorId: f.properties.visitorId || "",
            userAgent: f.properties.userAgent || "",
            ip: f.properties.ip || null,
            isDatacenter: f.properties.isDatacenter || false,
            isVPN: f.properties.isVPN || false,
            location_quality: f.properties.location_quality || "unknown",
            accuracy_radius_km: f.properties.accuracy_radius_km || null,
            folderName: f.properties.folderName || null,
            visitorIdStable: f.properties.visitorIdStable || null,
          }));

          setSelectedDetail({
            pointCount: visitors.length,
            center: [lng, lat],
            points: visitors,
          });
          setIsDrawerOpen(true);
          return;
        }

        // Point individuel : afficher le détail normal
        setSelectedDetail({
          id: eventId,
          type: props.type || "VIEW",
          eventType: props.type || "OPEN_SHARE",
          country: props.country || "Inconnu",
          city: props.city || "Inconnu",
          region: props.region || "",
          timestamp: props.timestamp || new Date().toISOString(),
          visitorId: props.visitorId || "",
          userAgent: props.userAgent || "",
          ip: props.ip || null,
          isDatacenter: props.isDatacenter || false,
          isVPN: props.isVPN || false,
          location_quality: props.location_quality || "unknown",
          accuracy_radius_km: props.accuracy_radius_km || null,
          isp: props.isp || null,
          asn: props.asn || null,
          folderName: props.folderName || null,
          visitorIdStable: props.visitorIdStable || null,
        });
        setIsDrawerOpen(true);
      };

      map.current.on("click", "points-hit", handlePointClick);
      map.current.on("click", "points", handlePointClick);
      
      // Fallback : clic général sur la carte pour détecter les points
      map.current.on("click", (e) => {
        if (isAnimatingRef.current || !map.current) return;
        
        // Vérifier d'abord si on a cliqué sur un cluster
        const clusterFeatures = map.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        if (clusterFeatures.length > 0) return; // Déjà géré par le handler clusters
        
        // Chercher les points
        const pointFeatures = map.current.queryRenderedFeatures(e.point, {
          layers: ["points-hit", "points"],
        });
        if (pointFeatures.length > 0) {
          handlePointClick({ features: pointFeatures });
        }
      });

      // Curseur pointer au survol
      map.current.on("mouseenter", "clusters", () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "clusters", () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });
      map.current.on("mouseenter", "points", () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "points", () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });

      // Style minimaliste - garder les labels de villes/pays
      const layers = map.current.getStyle().layers;
      if (layers) {
        layers.forEach((layer: any) => {
          // Garder les labels de villes et pays, cacher le reste
          if (layer.type === "symbol") {
            const isPlaceLabel = layer.id?.includes("place") ||
                                 layer.id?.includes("country") ||
                                 layer.id?.includes("settlement") ||
                                 layer.id?.includes("city");
            if (!isPlaceLabel) {
              try {
                map.current!.setLayoutProperty(layer.id, "visibility", "none");
              } catch (e) {}
            } else {
              try {
                map.current!.setPaintProperty(layer.id, "text-color", "#999999");
                map.current!.setPaintProperty(layer.id, "text-halo-color", "#ffffff");
                map.current!.setPaintProperty(layer.id, "text-halo-width", 1.5);
              } catch (e) {}
            }
          }
          if (layer.type === "fill") {
            try {
              if (layer.id?.includes("water") || layer.id?.includes("ocean")) {
                map.current!.setPaintProperty(layer.id, "fill-color", "#e5e5e5");
              } else if (layer.id?.includes("land")) {
                map.current!.setPaintProperty(layer.id, "fill-color", "#ffffff");
              }
            } catch (e) {}
          }
        });
      }

      // Auto-rotation douce
      const spinGlobe = () => {
        if (!map.current || isUserInteractingRef.current) return;
        const center = map.current.getCenter();
        center.lng += 0.015;
        map.current.setCenter(center);
        rotationAnimationRef.current = requestAnimationFrame(spinGlobe);
      };

      // Stopper la rotation quand l'utilisateur interagit
      map.current.on("mousedown", () => { isUserInteractingRef.current = true; });
      map.current.on("touchstart", () => { isUserInteractingRef.current = true; });
      map.current.on("wheel", () => { isUserInteractingRef.current = true; });

      // Démarrer la rotation
      rotationAnimationRef.current = requestAnimationFrame(spinGlobe);
    });

    return () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }
      if (map.current) {
        if (map.current.getLayer("clusters")) map.current.removeLayer("clusters");
        if (map.current.getLayer("points")) map.current.removeLayer("points");
        if (map.current.getLayer("points-hit")) map.current.removeLayer("points-hit");
        if (map.current.getSource("analytics-points")) map.current.removeSource("analytics-points");
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Initialisation une seule fois

  // 4. Mettre à jour la source quand les données changent
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    const source = map.current.getSource("analytics-points") as mapboxgl.GeoJSONSource;
    if (!source) return;

    // RÈGLE D'OR : Zéro data = zéro features (reset complet)
    if (analytics.length === 0 || geojsonData.features.length === 0) {
      // Reset complet : vider la source immédiatement
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
      // Fermer le tiroir si ouvert
      setIsDrawerOpen(false);
      setTimeout(() => {
        setSelectedDetail(null);
      }, 150);
      return;
    }

    // Mettre à jour les données
    source.setData(geojsonData);
  }, [analytics, geojsonData]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-[#f5f5f7] rounded-2xl border border-black/[0.05]">
        <div className="text-center p-8">
          <Globe className="w-16 h-16 text-black/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">Token Mapbox manquant</h3>
          <p className="text-sm text-black/50 mb-4">
            Le globe nécessite un token Mapbox pour fonctionner.
          </p>
          <p className="text-xs text-black/40 font-mono bg-white/50 px-3 py-2 rounded border border-black/10">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </p>
        </div>
      </div>
    );
  }

  // Cacher l'attribution Mapbox
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mapboxgl-ctrl-attrib,
      .mapboxgl-ctrl-logo {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {selectedDetail && (
        <AnalyticsDetailCard
          detail={selectedDetail}
          onClose={handleClose}
          isOpen={isDrawerOpen}
        />
      )}
    </div>
  );
}
