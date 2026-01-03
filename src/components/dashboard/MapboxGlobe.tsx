"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, MapPin, Clock, Monitor, Smartphone, Tablet, Globe as GlobeIcon } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AnalyticsDetailCard } from "./AnalyticsDetailCard";

// Fonction pour parser le userAgent et extraire les infos du navigateur/device
function parseUserAgent(userAgent: string): { browser: string; device: string; os: string; icon: string } {
  if (!userAgent) return { browser: "Inconnu", device: "Inconnu", os: "Inconnu", icon: "monitor" };
  
  let browser = "Inconnu";
  let device = "Desktop";
  let os = "Inconnu";
  let icon = "monitor";
  
  // Détecter le navigateur
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browser = "Chrome";
  } else if (userAgent.includes("Firefox")) {
    browser = "Firefox";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browser = "Safari";
  } else if (userAgent.includes("Edg")) {
    browser = "Edge";
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
    browser = "Opera";
  }
  
  // Détecter l'OS
  if (userAgent.includes("Windows")) {
    os = "Windows";
  } else if (userAgent.includes("Mac OS X") || userAgent.includes("macOS")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  } else if (userAgent.includes("Android")) {
    os = "Android";
    device = "Mobile";
    icon = "smartphone";
  } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
    os = "iOS";
    if (userAgent.includes("iPad")) {
      device = "Tablette";
      icon = "tablet";
    } else {
      device = "Mobile";
      icon = "smartphone";
    }
  }
  
  // Détecter les tablettes
  if (userAgent.includes("iPad") || (userAgent.includes("Android") && !userAgent.includes("Mobile"))) {
    device = "Tablette";
    icon = "tablet";
  }
  
  return { browser, device, os, icon };
}

// Styles CSS personnalisés pour une carte minimaliste et fluide
const mapboxStyles = `
  .mapboxgl-map {
    background: transparent !important;
    pointer-events: auto !important;
    transition: opacity 0.3s ease-in-out;
  }
  .mapboxgl-canvas-container {
    pointer-events: auto !important;
    overflow: visible !important;
    will-change: transform;
  }
  .mapboxgl-canvas {
    pointer-events: auto !important;
    transition: transform 0.1s ease-out;
  }
  .mapboxgl-ctrl {
    display: none !important;
  }
  .mapboxgl-ctrl-attrib {
    display: none !important;
  }
  .mapboxgl-ctrl-logo {
    display: none !important;
  }
  .mapboxgl-ctrl-group {
    display: none !important;
  }
  .mapboxgl-popup {
    max-width: 300px;
    animation: popupFadeIn 0.2s ease-out;
  }
  @keyframes popupFadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .mapboxgl-popup-content {
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s ease;
  }
  .mapboxgl-popup-content:hover {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }
  .mapboxgl-popup-close-button {
    font-size: 18px;
    color: #666;
    padding: 4px 8px;
    transition: all 0.2s ease;
  }
  .mapboxgl-popup-close-button:hover {
    color: #000;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    transform: scale(1.1);
  }
  /* Améliorer la fluidité des interactions */
  .mapboxgl-canvas-container {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000;
    perspective: 1000;
  }
`;

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

// Fonction pour générer une couleur de background basée sur un hash
function getClusterBackgroundColor(clusterId: number): string {
  const backgrounds = [
    "#96A982", // brand-primary
    "#8B9A7A", // variation 1
    "#A8B896", // variation 2
    "#7A8A6A", // variation 3
  ];
  return backgrounds[clusterId % backgrounds.length];
}

export function MapboxGlobe({ analytics }: MapboxGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Injecter les styles CSS personnalisés
    const styleSheet = document.createElement("style");
    styleSheet.textContent = mapboxStyles;
    document.head.appendChild(styleSheet);

    // Vérifier si le token Mapbox est configuré
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      setError("Token Mapbox non configuré. Veuillez définir NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN");
      setIsLoading(false);
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    // Initialiser la carte avec le style Light (minimaliste)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      zoom: 1.2, // Zoom pour voir le globe en entier
      center: [0, 0], // Centrer le globe
      pitch: 0, // Pas d'inclinaison pour voir le globe en entier
      bearing: 0,
      attributionControl: false, // Désactiver l'attribution
      scrollZoom: false, // Désactiver le zoom au scroll par défaut
      // Améliorer les performances pour une meilleure fluidité
      antialias: true,
      preserveDrawingBuffer: false,
      fadeDuration: 0,
    });

    // Configurer les interactions pour une UX fluide
    map.current.doubleClickZoom.disable();
    map.current.touchZoomRotate.disable();
    map.current.boxZoom.disable();
    
    // Activer la rotation par drag pour une interaction fluide
    map.current.dragRotate.enable();
    
    // Configurer les paramètres de performance pour une meilleure fluidité
    map.current.setRenderWorldCopies(false);
    
    // Activer le pan avec des mouvements naturels
    map.current.dragPan.enable();
    
    // Activer le zoom avec Cmd + molette et améliorer l'UX globale
    map.current.on("load", () => {
      if (!map.current) return;
      
      // Configurer les interactions pour des mouvements fluides
      map.current.dragRotate.enable();
      map.current.dragPan.enable();
      
      // Améliorer la sensibilité de la rotation
      const handleWheel = (e: WheelEvent) => {
        // Vérifier si Cmd (Meta) ou Ctrl est pressé pour le zoom
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          
          if (!map.current) return;
          
          // Obtenir le zoom actuel
          const currentZoom = map.current.getZoom();
          
          // Calculer le delta de zoom (inversé car scroll up = zoom in)
          const delta = -e.deltaY;
          
          // Facteur de zoom sensible (ajusté pour une meilleure réactivité)
          // deltaY est généralement entre -100 et 100
          const zoomSpeed = 0.15; // Facteur de sensibilité augmenté
          const normalizedDelta = delta / 100;
          const zoomChange = normalizedDelta * zoomSpeed;
          
          // Calculer le nouveau zoom avec échelle logarithmique
          // Utiliser une base plus élevée pour un zoom plus sensible
          const zoomMultiplier = Math.pow(2, zoomChange);
          const newZoom = currentZoom * zoomMultiplier;
          
          // Limiter le zoom entre 0.5 et 10
          const clampedZoom = Math.max(0.5, Math.min(10, newZoom));
          
          // Appliquer le zoom directement sans animation pour une réactivité immédiate
          map.current.setZoom(clampedZoom);
        }
      };
      
      // Ajouter l'écouteur sur le container de la carte
      const container = map.current.getContainer();
      container.addEventListener('wheel', handleWheel, { 
        passive: false,
        capture: false
      });
      
      // Améliorer le curseur pour indiquer les interactions possibles
      map.current.on('mouseenter', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'grab';
        }
      });
      
      map.current.on('mousedown', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'grabbing';
        }
      });
      
      map.current.on('mouseup', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'grab';
        }
      });
      
      // Nettoyer les événements au démontage
      return () => {
        if (map.current) {
          const container = map.current.getContainer();
          container.removeEventListener('wheel', handleWheel);
        }
      };
    });

    map.current.on("style.load", () => {
      if (!map.current) return;

      // Masquer tous les labels et textes
      const layers = map.current.getStyle().layers;
      if (layers) {
        layers.forEach((layer: any) => {
          // Masquer tous les labels, textes et symboles
          if (layer.type === "symbol" || 
              layer.id?.includes("label") || 
              layer.id?.includes("text") ||
              layer.id?.includes("place") ||
              layer.id?.includes("poi")) {
            try {
              map.current!.setLayoutProperty(layer.id, "visibility", "none");
            } catch (e) {
              // Ignorer les erreurs si la propriété n'existe pas
            }
          }
          
          // Modifier les couleurs des routes et frontières pour du gris clair
          if (layer.type === "line") {
            try {
              if (map.current!.getPaintProperty(layer.id, "line-color")) {
                map.current!.setPaintProperty(layer.id, "line-color", "#d1d1d1");
              }
            } catch (e) {
              // Ignorer les erreurs
            }
          }
          
          // Modifier les couleurs de remplissage
          if (layer.type === "fill") {
            try {
              // Océans et eaux en gris clair
              if (layer.id?.includes("water") || 
                  layer.id?.includes("ocean") || 
                  layer.id?.includes("sea")) {
                map.current!.setPaintProperty(layer.id, "fill-color", "#e5e5e5");
              } 
              // Terres en blanc
              else if (layer.id?.includes("land") || 
                       layer.id?.includes("landcover") ||
                       layer.id?.includes("landuse")) {
                map.current!.setPaintProperty(layer.id, "fill-color", "#ffffff");
              }
            } catch (e) {
              // Ignorer les erreurs
            }
          }
        });
      }

      // Configurer le fog pour un aspect minimaliste blanc
      try {
        map.current.setFog({
          color: "rgba(255, 255, 255, 0.1)",
          "high-color": "rgba(255, 255, 255, 0.1)",
          "space-color": "rgba(255, 255, 255, 0.1)",
          "star-intensity": 0
        });
      } catch (e) {
        // Ignorer si fog n'est pas supporté
      }
    });

    // Fonction pour créer les layers (réutilisable) - définie avant le on("load")
    const createLayers = () => {
      if (!map.current) return;
      
      // Attendre que la source soit disponible
      if (!map.current.getSource("analytics-points")) {
        setTimeout(createLayers, 100);
        return;
      }

      // Ajouter les halos en premier (en dessous) - Style minimaliste et moderne
      if (!map.current.getLayer("views-halo")) {
        map.current.addLayer({
          id: "views-halo",
          type: "circle",
          source: "analytics-points",
          filter: ["all", ["==", ["get", "type"], "VIEW"], ["!", ["has", "point_count"]]],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 20,
              2, 28,
              3, 36,
              5, 48,
            ],
            "circle-color": "#96A982",
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 0.15,
              2, 0.2,
              3, 0.25,
              5, 0.3,
            ],
            "circle-blur": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 3,
              2, 4,
              3, 5,
              5, 6,
            ],
          },
        });
      }

      if (!map.current.getLayer("downloads-halo")) {
        map.current.addLayer({
          id: "downloads-halo",
          type: "circle",
          source: "analytics-points",
          filter: ["all", ["==", ["get", "type"], "DOWNLOAD"], ["!", ["has", "point_count"]]],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 20,
              2, 28,
              3, 36,
              5, 48,
            ],
            "circle-color": "#96A982",
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 0.15,
              2, 0.2,
              3, 0.25,
              5, 0.3,
            ],
            "circle-blur": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 3,
              2, 4,
              3, 5,
              5, 6,
            ],
          },
        });
      }

      // Ajouter les clusters - Plus petits avec backgrounds variés
      if (!map.current.getLayer("clusters")) {
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "analytics-points",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "case",
              ["%", ["get", "cluster_id"], 4],
              0, "#96A982",
              1, "#8B9A7A",
              2, "#A8B896",
              3, "#7A8A6A",
              "#96A982"
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              16,
              10,
              20,
              50,
              24,
              100,
              28,
            ],
            "circle-opacity": 0.9,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 2,
              2, 2.5,
              3, 3,
              5, 3.5,
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-opacity": 1,
          },
        });

        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "analytics-points",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 11,
              2, 12,
              3, 13,
              5, 14,
            ],
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#000000",
            "text-halo-width": 1,
            "text-halo-blur": 0.5,
          },
        });
      }

      // Ajouter les points de vue - Style minimaliste et moderne
      if (!map.current.getLayer("views-layer")) {
        map.current.addLayer({
          id: "views-layer",
          type: "circle",
          source: "analytics-points",
          filter: ["all", ["==", ["get", "type"], "VIEW"], ["!", ["has", "point_count"]]],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 6,
              2, 8,
              3, 10,
              5, 14,
            ],
            "circle-color": "#96A982",
            "circle-opacity": 0.9,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 2.5,
              2, 3,
              3, 3.5,
              5, 4,
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-opacity": 1,
          },
        });
      }

      // Ajouter les points de téléchargement - Style minimaliste et moderne
      if (!map.current.getLayer("downloads-layer")) {
        map.current.addLayer({
          id: "downloads-layer",
          type: "circle",
          source: "analytics-points",
          filter: ["all", ["==", ["get", "type"], "DOWNLOAD"], ["!", ["has", "point_count"]]],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 6,
              2, 8,
              3, 10,
              5, 14,
            ],
            "circle-color": "#96A982",
            "circle-opacity": 0.9,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 2.5,
              2, 3,
              3, 3.5,
              5, 4,
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-opacity": 1,
          },
        });
      }
    };

    map.current.on("load", () => {
      if (!map.current) return;
      
      // Fonction pour mettre à jour les données sur la carte
      const updateMapData = () => {
        if (!map.current) return;

        // Filtrer les analytics avec des coordonnées valides
        const pointsWithCoords = analytics.filter(
          (point) => point.latitude != null && point.longitude != null && 
                     !isNaN(point.latitude) && !isNaN(point.longitude) &&
                     point.latitude >= -90 && point.latitude <= 90 &&
                     point.longitude >= -180 && point.longitude <= 180
        );

        console.log(`[MapboxGlobe] Analytics: ${analytics.length}, With coords: ${pointsWithCoords.length}`);

        if (pointsWithCoords.length === 0) {
          setIsLoading(false);
          return;
        }

        // Créer les features GeoJSON avec mapping des types
        const features = pointsWithCoords.map((point) => {
          // Mapper les types d'événements
          const eventType = point.eventType || point.type;
          let displayType = "VIEW";
          if (eventType === "OPEN_SHARE" || eventType === "VIEW") {
            displayType = "VIEW";
          } else if (eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD") {
            displayType = "DOWNLOAD";
          } else if (eventType === "OPEN_FOLDER") {
            displayType = "FOLDER";
          } else if (eventType === "VIEW_FILE") {
            displayType = "FILE";
          } else if (eventType === "ACCESS_DENIED") {
            displayType = "DENIED";
          }
          
          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [point.longitude!, point.latitude!],
            },
            properties: {
              id: point.id,
              type: displayType,
              eventType: eventType,
              country: point.country || "Inconnu",
              city: point.city || "Inconnu",
              region: point.region || "",
              timestamp: point.timestamp,
              visitorId: point.visitorId || "",
              userAgent: point.userAgent || "",
            },
          };
        });

        // Ajouter ou mettre à jour la source de données avec clustering
        if (map.current.getSource("analytics-points")) {
          (map.current.getSource("analytics-points") as mapboxgl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features,
          });
        } else {
          map.current.addSource("analytics-points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features,
            },
            cluster: true,
            clusterMaxZoom: 5,
            clusterRadius: 50,
          });
          // Créer les layers après avoir ajouté la source
          setTimeout(() => {
            createLayers();
          }, 150);
        }
      };
      
      // Mettre à jour les données initiales
      updateMapData();
      
      // S'assurer que les layers sont créés même si les données arrivent plus tard
      map.current.once("idle", () => {
        if (map.current && map.current.getSource("analytics-points") && !map.current.getLayer("views-layer")) {
          createLayers();
        }
      });

      // Gérer les clics sur les clusters - Zoomer et afficher les détails
      map.current.on("click", "clusters", async (e) => {
        if (!map.current || !e.features?.[0]) return;
        
        const features = e.features;
        const clusterId = features[0].properties?.cluster_id;
        const pointCount = features[0].properties?.point_count;
        const source = map.current.getSource("analytics-points") as mapboxgl.GeoJSONSource;
        
        // Récupérer tous les points du cluster
        source.getClusterLeaves(clusterId, pointCount, 0, (err, leaves) => {
          if (err || !map.current || !leaves) return;
          
          // Convertir les leaves en format AnalyticsDetail
          const clusterPoints = leaves.map((leaf: any) => {
            const props = leaf.properties;
            const point = analytics.find(p => p.id === props.id);
            return {
              id: props.id || leaf.id,
              type: props.type || "VIEW",
              eventType: props.eventType || props.type || "OPEN_SHARE",
              country: props.country || point?.country || "Inconnu",
              city: props.city || point?.city || "Inconnu",
              region: props.region || point?.region || "",
              timestamp: props.timestamp || point?.timestamp || new Date().toISOString(),
              visitorId: props.visitorId || point?.visitorId || "",
              userAgent: props.userAgent || point?.userAgent || "",
            };
          });
          
          // Afficher la card de détail
          setSelectedDetail({
            pointCount: pointCount,
            center: [e.lngLat.lng, e.lngLat.lat],
            points: clusterPoints,
          });
        });
        
        // Zoomer sur le cluster
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === null || zoom === undefined) return;
          
          // Zoomer un peu plus pour mieux voir les points séparés
          const targetZoom = Math.min(zoom + 1, 10);
          
          map.current.easeTo({
            center: (e.lngLat as any),
            zoom: targetZoom,
            duration: 600,
            easing: (t) => t * (2 - t),
          });
        });
      });

      // Gérer les clics sur les points individuels - Afficher la card de détail
      const showPointDetail = (e: any, type: string) => {
        if (!map.current || !e.features?.[0]) return;

        const props = e.features[0].properties;
        const isCluster = props.cluster;
        
        if (isCluster) return; // Les clusters sont gérés séparément

        // Trouver le point dans analytics
        const point = analytics.find(p => p.id === props.id);
        
        // Créer l'objet de détail
        const detail = {
          id: props.id || point?.id || "",
          type: type || props.type || "VIEW",
          eventType: props.eventType || point?.eventType || "OPEN_SHARE",
          country: props.country || point?.country || "Inconnu",
          city: props.city || point?.city || "Inconnu",
          region: props.region || point?.region || "",
          timestamp: props.timestamp || point?.timestamp || new Date().toISOString(),
          visitorId: props.visitorId || point?.visitorId || "",
          userAgent: props.userAgent || point?.userAgent || "",
        };
        
        // Afficher la card de détail
        setSelectedDetail(detail);
      };

      map.current.on("click", "views-layer", (e) => showPointDetail(e, "VIEW"));
      map.current.on("click", "downloads-layer", (e) => showPointDetail(e, "DOWNLOAD"));
      map.current.on("click", "views-halo", (e) => showPointDetail(e, "VIEW"));
      map.current.on("click", "downloads-halo", (e) => showPointDetail(e, "DOWNLOAD"));

      // Changer le curseur au survol pour toutes les couches
      const layers = ["views-layer", "downloads-layer", "views-halo", "downloads-halo", "clusters"];
      layers.forEach(layerId => {
        map.current!.on("mouseenter", layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });
        map.current!.on("mouseleave", layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });
      });

      setIsLoading(false);
    });

    // Ne pas ajouter de contrôles - carte minimaliste uniquement

    // Mettre à jour les données quand analytics change (après le chargement initial)
    if (map.current && map.current.loaded()) {
      const pointsWithCoords = analytics.filter(
        (point) => point.latitude != null && point.longitude != null && 
                   !isNaN(point.latitude) && !isNaN(point.longitude) &&
                   point.latitude >= -90 && point.latitude <= 90 &&
                   point.longitude >= -180 && point.longitude <= 180
      );

      console.log(`[MapboxGlobe] Update - Analytics: ${analytics.length}, With coords: ${pointsWithCoords.length}`);

      if (pointsWithCoords.length > 0) {
        const features = pointsWithCoords.map((point) => {
          const eventType = point.eventType || point.type;
          let displayType = "VIEW";
          if (eventType === "OPEN_SHARE" || eventType === "VIEW") {
            displayType = "VIEW";
          } else if (eventType === "DOWNLOAD_FILE" || eventType === "DOWNLOAD") {
            displayType = "DOWNLOAD";
          } else if (eventType === "OPEN_FOLDER") {
            displayType = "FOLDER";
          } else if (eventType === "VIEW_FILE") {
            displayType = "FILE";
          } else if (eventType === "ACCESS_DENIED") {
            displayType = "DENIED";
          }
          
          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [point.longitude!, point.latitude!],
            },
            properties: {
              id: point.id,
              type: displayType,
              eventType: eventType,
              country: point.country || "Inconnu",
              city: point.city || "Inconnu",
              region: point.region || "",
              timestamp: point.timestamp,
              visitorId: point.visitorId || "",
              userAgent: point.userAgent || "",
            },
          };
        });

        if (map.current.getSource("analytics-points")) {
          (map.current.getSource("analytics-points") as mapboxgl.GeoJSONSource).setData({
            type: "FeatureCollection",
            features,
          });
          // S'assurer que les layers existent
          if (!map.current.getLayer("views-layer")) {
            setTimeout(() => {
              createLayers();
            }, 50);
          }
        } else {
          map.current.addSource("analytics-points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features,
            },
            cluster: true,
            clusterMaxZoom: 5,
            clusterRadius: 50,
          });
          // Créer les layers après avoir ajouté la source
          setTimeout(() => {
            createLayers();
          }, 100);
        }
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Nettoyer les styles injectés
      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent === mapboxStyles) {
          style.remove();
        }
      });
    };
  }, [analytics]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-2xl">
        <div className="text-center p-8">
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          <p className="text-xs text-gray-400">
            Configurez NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN dans vos variables d'environnement
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-transparent">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent backdrop-blur-sm">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Chargement du globe...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="h-full w-full bg-transparent" />
      
      {/* Indicateur de données avec compteur */}
      {analytics.length > 0 && (
        <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-black/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-brand-primary shadow-lg border-2 border-white/80 animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-brand-primary/30 animate-ping" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-black/70">Activité</span>
              <span className="text-xs font-bold text-black/40 tabular-nums">({analytics.length})</span>
            </div>
            <div className="ml-2 px-2 py-0.5 bg-black/5 rounded-full">
              <span className="text-[9px] text-black/40 font-medium">⌘</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Message si pas de données avec coordonnées */}
      {analytics.length > 0 && analytics.filter(p => p.latitude && p.longitude).length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-black/5 text-center">
            <Globe className="w-8 h-8 text-black/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-black/50">En attente de données géolocalisées</p>
            <p className="text-xs text-black/30 mt-1">Les points apparaîtront après les premières vues</p>
          </div>
        </div>
      )}
      
      {/* Card de détail centrée en bas */}
      <AnalyticsDetailCard 
        detail={selectedDetail} 
        onClose={() => setSelectedDetail(null)} 
      />
    </div>
  );
}

