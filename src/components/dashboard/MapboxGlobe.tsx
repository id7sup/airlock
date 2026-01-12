"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";
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
  const isAnimatingRef = useRef<boolean>(false);

  // 1. Préparer les points GeoJSON
  const points = useMemo(() => {
    return analytics
      .filter(p => p.latitude != null && p.longitude != null)
      .map(ev => ({
        type: "Feature" as const,
        properties: {
          cluster: false,
          eventId: ev.id,
          type: ev.eventType || ev.type || "VIEW",
          timestamp: ev.timestamp,
          linkId: ev.linkId,
          country: ev.country || "Inconnu",
          city: ev.city || "Inconnu",
          region: ev.region || "",
          visitorId: ev.visitorId || "",
          userAgent: ev.userAgent || "",
          pointColor: getColorFromId(ev.id),
        },
        geometry: {
          type: "Point" as const,
          coordinates: [ev.longitude!, ev.latitude!] as [number, number],
        },
      }));
  }, [analytics]);

  // 2. Indexer avec Supercluster
  // IMPORTANT : radius très réduit pour ne clusteriser que les points vraiment proches géographiquement
  // radius = 50 pixels signifie que seuls les points très proches (même zone) seront clusterisés
  // Cela évite de créer des clusters pour des points éloignés géographiquement
  const index = useMemo(() => {
    if (points.length === 0) return null;
    const sc = new Supercluster({
      radius: 50, // Augmenté pour ne clusteriser que les points dans la même zone géographique
      maxZoom: 14, // Zoom maximum pour le clustering
      minZoom: 0,
      extent: 512, // Taille de tuile standard
    });
    sc.load(points);
    return sc;
  }, [points]);

  // 3. Obtenir les nodes (clusters ou points) selon le zoom
  // Logique améliorée : 
  // - Zoom très faible (< 2) : clusters uniquement si plusieurs points dans la même zone
  // - Zoom faible (2-4) : décomposer les clusters avec 1-2 points
  // - Zoom moyen (4-6) : décomposer tous les clusters sauf ceux avec beaucoup de points
  // - Zoom élevé (> 6) : toujours afficher les points individuels
  const getNodes = (zoom: number, bbox: [number, number, number, number]) => {
    if (!index) return [];
    
    // Convertir le zoom Mapbox en zoom Supercluster
    // Plus le zoom est élevé, plus on se rapproche du zoom max (14) = décomposition complète
    let superclusterZoom: number;
    
    if (zoom < 1.5) {
      // Zoom très faible : permettre les clusters
      superclusterZoom = Math.floor(zoom * 3);
    } else if (zoom < 3) {
      // Zoom faible : commencer à décomposer
      superclusterZoom = Math.floor(zoom * 2.5);
    } else if (zoom < 5) {
      // Zoom moyen : décomposer davantage
      superclusterZoom = Math.floor(zoom * 2);
    } else {
      // Zoom élevé : décomposition complète (zoom max = 14)
      superclusterZoom = 14;
    }
    
    // Limiter le zoom Supercluster entre 0 et 14
    superclusterZoom = Math.min(Math.max(superclusterZoom, 0), 14);
    
    // Obtenir les clusters/points depuis Supercluster
    const raw = index.getClusters(bbox, superclusterZoom);
    
    // Traiter les résultats selon le zoom actuel
    const result: any[] = [];
    
    for (const node of raw) {
      if (node.properties?.cluster) {
        // C'est un cluster
        const pointCount = node.properties.point_count || 0;
        
        // RÈGLE ABSOLUE : Un seul point ne doit JAMAIS être un cluster
        // Décomposer immédiatement, peu importe le zoom
        if (pointCount <= 1) {
          const clusterId = node.properties.cluster_id;
          const leaves = index.getLeaves(clusterId, Infinity);
          // S'assurer qu'on récupère bien les points individuels
          if (leaves.length > 0) {
            result.push(...leaves);
          } else {
            // Fallback : si getLeaves ne retourne rien, essayer de récupérer depuis les points originaux
            const [lng, lat] = (node.geometry as any).coordinates;
            const matchingPoint = points.find(p => {
              const [pLng, pLat] = p.geometry.coordinates;
              return Math.abs(pLng - lng) < 0.001 && Math.abs(pLat - lat) < 0.001;
            });
            if (matchingPoint) {
              result.push(matchingPoint);
            }
          }
          continue;
        }
        
        // RÈGLE 2 : À zoom élevé (>= 4), toujours décomposer tous les clusters
        if (zoom >= 4) {
          const clusterId = node.properties.cluster_id;
          const leaves = index.getLeaves(clusterId, Infinity);
          result.push(...leaves);
        } 
        // RÈGLE 3 : À zoom moyen (2.5-4), décomposer les petits clusters (2-4 points)
        else if (zoom >= 2.5 && pointCount <= 4) {
          const clusterId = node.properties.cluster_id;
          const leaves = index.getLeaves(clusterId, Infinity);
          result.push(...leaves);
        }
        // RÈGLE 4 : À zoom faible (< 2.5), garder les clusters avec au moins 2 points
        // (mais on a déjà vérifié qu'il y a au moins 2 points avec la règle 1)
        else {
          result.push(node);
        }
      } else {
        // C'est déjà un point individuel - toujours l'afficher tel quel
        result.push(node);
      }
    }
    
    // SÉCURITÉ FINALE : Vérifier qu'on n'a pas de clusters avec 1 seul point
    // (ne devrait jamais arriver, mais on s'assure)
    const finalResult: any[] = [];
    for (const node of result) {
      if (node.properties?.cluster && (node.properties.point_count || 0) <= 1) {
        // Forcer la décomposition
        const clusterId = node.properties.cluster_id;
        const leaves = index.getLeaves(clusterId, Infinity);
        if (leaves.length > 0) {
          finalResult.push(...leaves);
        } else {
          // Si on ne peut pas décomposer, ignorer ce cluster invalide
          continue;
        }
      } else {
        finalResult.push(node);
      }
    }
    
    return finalResult;
  };

  // 4. Mettre à jour la carte avec les nodes
  const updateMap = () => {
    if (!map.current || !index || !map.current.loaded()) return;

    const zoom = map.current.getZoom();
    const bounds = map.current.getBounds();
    
    // Gérer le cas où bounds est null
    if (!bounds) {
      return;
    }
    
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    const nodes = getNodes(zoom, bbox);

    // Créer le GeoJSON
    const geojsonData = {
      type: "FeatureCollection" as const,
      features: nodes.map(node => {
        // Pour les leafs, récupérer les propriétés originales
        if (!node.properties.cluster) {
          const [lng, lat] = node.geometry.coordinates;
          const originalPoint = points.find(p => {
            const [pLng, pLat] = p.geometry.coordinates;
            return Math.abs(pLng - lng) < 0.0001 && Math.abs(pLat - lat) < 0.0001;
          });
          if (originalPoint) {
            return {
              ...node,
              properties: {
                ...originalPoint.properties,
                cluster: false,
              },
            };
          }
        }
        return node;
      }),
    };

    // Mettre à jour la source
    const source = map.current.getSource("analytics-points") as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojsonData);
    } else {
      map.current.addSource("analytics-points", {
        type: "geojson",
        data: geojsonData,
        cluster: false, // On gère le clustering avec Supercluster
      });
    }

    // Créer les layers s'ils n'existent pas
    if (!map.current.getLayer("clusters")) {
      // Layer pour les clusters
      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "analytics-points",
        filter: ["==", ["get", "cluster"], true],
        paint: {
          "circle-color": [
            "interpolate",
            ["linear"],
            ["%", ["get", "cluster_id"], 12],
            0, POINT_COLORS[0],
            1, POINT_COLORS[1],
            2, POINT_COLORS[2],
            3, POINT_COLORS[3],
            4, POINT_COLORS[4],
            5, POINT_COLORS[5],
            6, POINT_COLORS[6],
            7, POINT_COLORS[7],
            8, POINT_COLORS[8],
            9, POINT_COLORS[9],
            10, POINT_COLORS[10],
            11, POINT_COLORS[11],
            12, POINT_COLORS[0],
          ],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["sqrt", ["get", "point_count"]],
            0, 16,
            3, 20,
            5, 24,
            7, 28,
            10, 32,
            15, 36,
          ],
          "circle-opacity": 0.8,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.95,
        },
      });
    }

    if (!map.current.getLayer("points")) {
      // Layer pour les points individuels (visuels)
      map.current.addLayer({
        id: "points",
        type: "circle",
        source: "analytics-points",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "case",
            ["has", "pointColor"],
            ["get", "pointColor"],
            POINT_COLORS[0],
          ],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 6,
            3, 7,
            6, 8,
            10, 9,
            12, 9,
          ],
          "circle-opacity": 0.9,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 1,
        },
      });

      // COUCHE HIT INVISIBLE MAIS CLIQUABLE (solution au problème de clic)
      map.current.addLayer({
        id: "points-hit",
        type: "circle",
        source: "analytics-points",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 12,  // Plus grand que le point visible pour faciliter les clics
            3, 14,
            6, 16,
            10, 18,
            12, 18,
          ],
          "circle-color": "#000000",
          "circle-opacity": 0.01, // Quasi invisible mais cliquable
          "circle-stroke-width": 0,
        },
      });
    }

    // Gérer les clics - retirer les handlers précédents
    try {
      map.current.off("click", "clusters" as any);
      map.current.off("click", "points" as any);
      map.current.off("click", "points-hit" as any);
    } catch (e) {
      // Ignorer si les layers n'existent pas encore
    }

    // Handler pour ouvrir le détail d'un point
    const handlePointClick = (feature: any) => {
      if (isAnimatingRef.current) {
        return;
      }

      // Vérifier que c'est bien un point (pas un cluster)
      if (feature.properties?.cluster || feature.properties?.point_count) {
        return;
      }

      const eventId = feature.properties?.eventId;
      if (!eventId) {
        // Dernière tentative : récupérer depuis les coordonnées
        const [lng, lat] = (feature.geometry as any).coordinates;
        const originalPoint = points.find(p => {
          const [pLng, pLat] = p.geometry.coordinates;
          return Math.abs(pLng - lng) < 0.0001 && Math.abs(pLat - lat) < 0.0001;
        });
        
        if (originalPoint?.properties?.eventId) {
          const recoveredEventId = originalPoint.properties.eventId;
          const finalProps = originalPoint.properties;
          setSelectedDetail({
            id: recoveredEventId,
            type: finalProps.type || "VIEW",
            eventType: finalProps.type || "OPEN_SHARE",
            country: finalProps.country || "Inconnu",
            city: finalProps.city || "Inconnu",
            region: finalProps.region || "",
            timestamp: finalProps.timestamp || new Date().toISOString(),
            visitorId: finalProps.visitorId || "",
            userAgent: finalProps.userAgent || "",
          });
          return;
        }
        
        return;
      }

      // Récupérer les propriétés complètes
      const [lng, lat] = (feature.geometry as any).coordinates;
      const originalPoint = points.find(p => {
        const [pLng, pLat] = p.geometry.coordinates;
        return Math.abs(pLng - lng) < 0.0001 && Math.abs(pLat - lat) < 0.0001;
      });

      const finalProps = originalPoint ? originalPoint.properties : feature.properties;

      setSelectedDetail({
        id: eventId,
        type: finalProps.type || "VIEW",
        eventType: finalProps.type || "OPEN_SHARE",
        country: finalProps.country || "Inconnu",
        city: finalProps.city || "Inconnu",
        region: finalProps.region || "",
        timestamp: finalProps.timestamp || new Date().toISOString(),
        visitorId: finalProps.visitorId || "",
        userAgent: finalProps.userAgent || "",
      });
    };

    // Clic sur cluster = zoom
    map.current.on("click", "clusters", (e) => {
      const feature = e.features?.[0];
      if (!feature || !feature.properties || !index || isAnimatingRef.current) return;

      const clusterId = feature.properties.cluster_id;
      const expansionZoom = index.getClusterExpansionZoom(clusterId);
      const targetZoom = Math.min(expansionZoom * 1.8, 12);
      const [lng, lat] = (feature.geometry as any).coordinates;

      setSelectedDetail(null); // Fermer le détail
      isAnimatingRef.current = true;

      map.current!.flyTo({
        center: [lng, lat],
        zoom: targetZoom,
        duration: 800,
      });

      setTimeout(() => {
        updateMap();
        isAnimatingRef.current = false;
      }, 850);
    });

    // Clic sur point via la couche hit (PRIORITAIRE)
    map.current.on("click", "points-hit", (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      handlePointClick(feature);
    });

    // Clic sur point via la couche visuelle (fallback)
    map.current.on("click", "points", (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      handlePointClick(feature);
    });

    // SOLUTION ALTERNATIVE : queryRenderedFeatures sur clic général (si les layers ne fonctionnent pas)
    map.current.on("click", (e) => {
      // Ne traiter que si on n'a pas cliqué sur un cluster
      const clusterFeatures = map.current!.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      
      if (clusterFeatures.length > 0) {
        // C'est un cluster, déjà géré par le handler "clusters"
        return;
      }

      // Chercher les points à cette position
      const pointFeatures = map.current!.queryRenderedFeatures(e.point, {
        layers: ["points-hit", "points"],
      });

      if (pointFeatures.length > 0) {
        const feature = pointFeatures[0];
        handlePointClick(feature);
      }
    });

    // Curseur pointer au survol - retirer les handlers précédents
    try {
      map.current.off("mouseenter", "clusters" as any);
      map.current.off("mouseleave", "clusters" as any);
      map.current.off("mouseenter", "points" as any);
      map.current.off("mouseleave", "points" as any);
      map.current.off("mouseenter", "points-hit" as any);
      map.current.off("mouseleave", "points-hit" as any);
    } catch (e) {
      // Ignorer si les layers n'existent pas encore
    }

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
    map.current.on("mouseenter", "points-hit", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "points-hit", () => {
      if (map.current) map.current.getCanvas().style.cursor = "";
    });
  };

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error("Mapbox token manquant - Veuillez définir NEXT_PUBLIC_MAPBOX_TOKEN dans vos variables d'environnement");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      zoom: 1.5,
      center: [0, 0],
      pitch: 0,
      bearing: 0,
      attributionControl: false, // Désactiver l'attribution
      scrollZoom: false,
      antialias: true,
    });
    
    // S'assurer que l'attribution est bien désactivée et cachée
    if (map.current.getContainer) {
      const container = map.current.getContainer();
      // Cacher tous les éléments d'attribution Mapbox
      const attributionElements = container.querySelectorAll('.mapboxgl-ctrl-attrib');
      attributionElements.forEach((el: any) => {
        el.style.display = 'none';
      });
    }

    map.current.doubleClickZoom.disable();
    map.current.touchZoomRotate.disable();
    map.current.boxZoom.disable();
    map.current.dragRotate.enable();
    map.current.dragPan.enable();
    map.current.setRenderWorldCopies(false);
    
    // Fonction pour cacher l'attribution Mapbox
    const hideAttribution = () => {
      if (!map.current) return;
      const container = map.current.getContainer();
      const attributionElements = container.querySelectorAll('.mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo');
      attributionElements.forEach((el: any) => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
      });
    };
    
    // Cacher l'attribution immédiatement et après le chargement
    hideAttribution();
    
    // Zoom avec Cmd + molette
    map.current.on("load", () => {
      if (!map.current) return;
      
      // Cacher l'attribution après le chargement
      hideAttribution();

      const handleWheel = (e: WheelEvent) => {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          if (!map.current) return;

          const currentZoom = map.current.getZoom();
          const delta = -e.deltaY;
          const zoomSpeed = 0.15;
          const normalizedDelta = delta / 100;
          const zoomChange = normalizedDelta * zoomSpeed;
          const zoomMultiplier = Math.pow(2, zoomChange);
          const newZoom = currentZoom * zoomMultiplier;
          const clampedZoom = Math.max(0.5, Math.min(10, newZoom));

          map.current.setZoom(clampedZoom);
          setTimeout(() => updateMap(), 100);
        }
      };

      const container = map.current.getContainer();
      container.addEventListener('wheel', handleWheel, { passive: false });

      // Style minimaliste
      map.current.on("style.load", () => {
        if (!map.current) return;
      const layers = map.current.getStyle().layers;
      if (layers) {
        layers.forEach((layer: any) => {
            if (layer.type === "symbol" || layer.id?.includes("label") || layer.id?.includes("text")) {
            try {
              map.current!.setLayoutProperty(layer.id, "visibility", "none");
              } catch (e) {}
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
      try {
        map.current.setFog({
          color: "rgba(255, 255, 255, 0.1)",
          "high-color": "rgba(255, 255, 255, 0.1)",
          "space-color": "rgba(255, 255, 255, 0.1)",
            "star-intensity": 0,
          });
        } catch (e) {}
      });

      // Mettre à jour lors des mouvements
      map.current.on("moveend", updateMap);
      map.current.on("zoomend", updateMap);

      // Mise à jour initiale
      map.current.once("load", () => {
        setTimeout(updateMap, 500);
      });

      return () => {
        if (map.current) {
          const container = map.current.getContainer();
          container.removeEventListener('wheel', handleWheel);
        }
      };
    });

    return () => {
      if (map.current) {
        if (map.current.getLayer("clusters")) map.current.removeLayer("clusters");
        if (map.current.getLayer("points")) map.current.removeLayer("points");
        if (map.current.getLayer("points-hit")) map.current.removeLayer("points-hit");
        if (map.current.getSource("analytics-points")) map.current.removeSource("analytics-points");
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Mettre à jour quand les analytics changent
  useEffect(() => {
    if (map.current && map.current.loaded() && index) {
      setTimeout(updateMap, 100);
    }
  }, [analytics, index]);

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

  // Cacher l'attribution Mapbox avec un useEffect
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
          onClose={() => setSelectedDetail(null)}
          isOpen={!!selectedDetail}
        />
      )}
    </div>
  );
}
