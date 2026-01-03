"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Styles CSS personnalisés pour une carte minimaliste
const mapboxStyles = `
  .mapboxgl-map {
    background: transparent !important;
    pointer-events: auto !important;
  }
  .mapboxgl-canvas-container {
    pointer-events: auto !important;
    overflow: visible !important;
  }
  .mapboxgl-canvas {
    pointer-events: auto !important;
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
  }
  .mapboxgl-popup-content {
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  .mapboxgl-popup-close-button {
    font-size: 18px;
    color: #666;
    padding: 4px 8px;
  }
  .mapboxgl-popup-close-button:hover {
    color: #000;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
`;

interface AnalyticsPoint {
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

export function MapboxGlobe({ analytics }: MapboxGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    });

    // Désactiver certaines interactions par défaut
    map.current.doubleClickZoom.disable();
    map.current.touchZoomRotate.disable();
    map.current.boxZoom.disable();
    map.current.dragRotate.disable();
    
    // Activer le zoom avec Cmd + molette (fluide)
    map.current.on("load", () => {
      const canvasContainer = map.current?.getCanvasContainer();
      if (canvasContainer) {
        let zoomTimeout: ReturnType<typeof setTimeout> | null = null;
        let isZooming = false;
        
        canvasContainer.addEventListener('wheel', (e) => {
          // Vérifier si Cmd (Meta) ou Ctrl est pressé
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            
            isZooming = true;
            
            // Calculer le zoom avec accélération fluide
            const currentZoom = map.current!.getZoom();
            const delta = -e.deltaY;
            const zoomFactor = 0.0008; // Facteur de zoom plus fluide
            const zoomChange = delta * zoomFactor;
            const newZoom = Math.max(0.5, Math.min(10, currentZoom + zoomChange));
            
            // Appliquer le zoom avec animation très fluide
            map.current!.easeTo({
              zoom: newZoom,
              duration: 100,
              easing: (t) => {
                // Easing cubic-bezier pour un mouvement très fluide
                return t * (2 - t);
              }
            });
            
            // Réinitialiser après un court délai
            if (zoomTimeout) clearTimeout(zoomTimeout);
            zoomTimeout = setTimeout(() => {
              isZooming = false;
            }, 100);
          } else if (!isZooming) {
            // Laisser le scroll se propager pour scroller la page seulement si on ne zoome pas
          }
        }, { passive: false, capture: false });
      }
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

      // Ajouter les halos en premier (en dessous) - Effets visuels améliorés
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
              0.5, 30,
              2, 40,
              3, 50,
              5, 70,
            ],
            "circle-color": "#96A982",
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 0.3,
              2, 0.4,
              3, 0.5,
              5, 0.6,
            ],
            "circle-blur": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 4,
              2, 5,
              3, 6,
              5, 8,
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
              0.5, 30,
              2, 40,
              3, 50,
              5, 70,
            ],
            "circle-color": "#96A982",
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 0.3,
              2, 0.4,
              3, 0.5,
              5, 0.6,
            ],
            "circle-blur": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 4,
              2, 5,
              3, 6,
              5, 8,
            ],
          },
        });
      }

      // Ajouter les clusters
      if (!map.current.getLayer("clusters")) {
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "analytics-points",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#96A982",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              30,
              10,
              40,
              50,
              50,
              100,
              60,
            ],
            "circle-opacity": 0.9,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 3,
              2, 4,
              3, 5,
              5, 6,
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
              0.5, 14,
              2, 16,
              3, 18,
              5, 20,
            ],
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#96A982",
            "text-halo-width": 2,
            "text-halo-blur": 1,
          },
        });
      }

      // Ajouter les points de vue - Effets visuels améliorés
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
              0.5, 12,
              2, 16,
              3, 20,
              5, 28,
            ],
            "circle-color": "#96A982",
            "circle-opacity": 1,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 4,
              2, 4.5,
              3, 5,
              5, 6,
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-opacity": 1,
          },
        });
      }

      // Ajouter les points de téléchargement - Effets visuels améliorés
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
              0.5, 12,
              2, 16,
              3, 20,
              5, 28,
            ],
            "circle-color": "#96A982",
            "circle-opacity": 1,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0.5, 4,
              2, 4.5,
              3, 5,
              5, 6,
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
              timestamp: point.timestamp,
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

      // Gérer les clics sur les clusters
      map.current.on("click", "clusters", (e) => {
        if (!map.current || !e.features?.[0]) return;
        
        const features = e.features;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current.getSource("analytics-points") as mapboxgl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === null || zoom === undefined) return;
          
          map.current.easeTo({
            center: (e.lngLat as any),
            zoom: zoom,
            duration: 500,
          });
        });
      });

      // Ajouter des popups au clic avec un design amélioré
      const showPopup = (e: any, type: string) => {
        if (!map.current || !e.features?.[0]) return;

        const props = e.features[0].properties;
        const isCluster = props.cluster;
        
        if (isCluster) return; // Les clusters sont gérés séparément

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: true,
          className: "custom-popup",
        })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-3 min-w-[200px]">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 rounded-full ${type === "VIEW" ? "bg-blue-500" : "bg-green-500"}"></div>
                <p class="font-bold text-sm text-gray-900">${type === "VIEW" ? "Vue" : "Téléchargement"}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-gray-700">${props.city || "Ville inconnue"}, ${props.country || "Pays inconnu"}</p>
                <p class="text-xs text-gray-500">${new Date(props.timestamp).toLocaleString("fr-FR", { 
                  day: "numeric", 
                  month: "short", 
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}</p>
              </div>
            </div>
          `)
          .addTo(map.current);
      };

      map.current.on("click", "views-layer", (e) => showPopup(e, "VIEW"));
      map.current.on("click", "downloads-layer", (e) => showPopup(e, "DOWNLOAD"));
      map.current.on("click", "views-halo", (e) => showPopup(e, "VIEW"));
      map.current.on("click", "downloads-halo", (e) => showPopup(e, "DOWNLOAD"));

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
              timestamp: point.timestamp,
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
    </div>
  );
}

