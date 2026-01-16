"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Composant Client pour tracker les événements d'analytics
 * 
 * Détecte les interactions utilisateur (clic, scroll, toucher) et tracke
 * seulement après une interaction minimale pour distinguer les vrais utilisateurs des bots.
 * 
 * @param linkId - ID du lien de partage
 * @param eventType - Type d'événement à tracker (OPEN_SHARE ou OPEN_FOLDER)
 * @param fileId - ID du fichier (optionnel)
 * @param folderId - ID du dossier (optionnel)
 * @param fileName - Nom du fichier (optionnel)
 */
interface TrackEventProps {
  linkId: string;
  eventType: "OPEN_SHARE" | "OPEN_FOLDER" | "VIEW_FILE" | "DOWNLOAD_FILE" | "ACCESS_DENIED";
  fileId?: string;
  folderId?: string;
  fileName?: string;
}

export function TrackEvent({ linkId, eventType, fileId, folderId, fileName }: TrackEventProps) {
  const hasTracked = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Pour les événements qui nécessitent une interaction (OPEN_SHARE, OPEN_FOLDER)
    const needsInteraction = eventType === "OPEN_SHARE" || eventType === "OPEN_FOLDER";
    
    if (!needsInteraction) {
      // Pour les autres événements (VIEW_FILE, DOWNLOAD_FILE, ACCESS_DENIED), tracker immédiatement
      const track = async () => {
        if (hasTracked.current) return;
        hasTracked.current = true;
        
        try {
          // Utiliser sendBeacon pour un tracking fiable même si la page se ferme
          const data = JSON.stringify({
            linkId,
            eventType,
            fileId,
            folderId,
            fileName,
          });

          // Essayer sendBeacon d'abord (plus fiable pour les navigations)
          if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: "application/json" });
            navigator.sendBeacon("/api/analytics/track-js", blob);
          } else {
            // Fallback sur fetch si sendBeacon n'est pas disponible
            await fetch("/api/analytics/track-js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: data,
              keepalive: true, // Important pour les navigations
            });
          }
        } catch (error) {
          // Ignorer les erreurs de tracking (ne pas bloquer l'UI)
        }
      };
      track();
      return;
    }

    // Pour OPEN_SHARE et OPEN_FOLDER, attendre une interaction
    const handleInteraction = () => {
      if (hasInteracted || hasTracked.current) return;
      setHasInteracted(true);
      hasTracked.current = true;

      const track = async () => {
        try {
          const data = JSON.stringify({
            linkId,
            eventType,
            fileId,
            folderId,
            fileName,
          });

          // Utiliser sendBeacon pour un tracking fiable
          if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: "application/json" });
            navigator.sendBeacon("/api/analytics/track-js", blob);
          } else {
            await fetch("/api/analytics/track-js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: data,
              keepalive: true,
            });
          }
        } catch (error) {
          // Ignorer les erreurs de tracking
        }
      };
      track();
    };

    // Écouter différents types d'interactions
    const events = ['click', 'scroll', 'touchstart', 'mousemove', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    // Timeout de sécurité : tracker après 3 secondes même sans interaction
    // (pour les cas où l'utilisateur reste sur la page sans bouger)
    const timeout = setTimeout(() => {
      if (!hasTracked.current) {
        handleInteraction();
      }
    }, 3000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
      clearTimeout(timeout);
    };
  }, [linkId, eventType, fileId, folderId, fileName, hasInteracted]);

  return null;
}
