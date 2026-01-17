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

  // Créer une clé unique pour cet événement
  const eventKey = `${linkId}-${eventType}-${fileId || ''}-${folderId || ''}-${fileName || ''}`;

  // Vérifier et marquer l'événement comme tracké de manière atomique
  // Retourne true si l'événement a déjà été tracké, false sinon (et le marque comme tracké)
  const checkAndMarkAsTracked = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const key = `tracked:${eventKey}`;
      const alreadyTracked = sessionStorage.getItem(key) === 'true';
      if (!alreadyTracked) {
        // Marquer immédiatement pour éviter les doublons même si le composant est monté deux fois
        sessionStorage.setItem(key, 'true');
      }
      return alreadyTracked;
    } catch {
      // En cas d'erreur (mode privé, etc.), on ne peut pas utiliser sessionStorage
      // On se fie uniquement au ref local
      return false;
    }
  };

  useEffect(() => {
    // Pour les événements qui nécessitent une interaction (OPEN_SHARE, OPEN_FOLDER)
    const needsInteraction = eventType === "OPEN_SHARE" || eventType === "OPEN_FOLDER";
    
    if (!needsInteraction) {
      // Pour les autres événements (VIEW_FILE, DOWNLOAD_FILE, ACCESS_DENIED), tracker immédiatement
      const track = async () => {
        // Vérifier de manière atomique si déjà tracké
        if (hasTracked.current || checkAndMarkAsTracked()) return;
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
      // Vérifier de manière atomique si déjà tracké
      if (hasInteracted || hasTracked.current || checkAndMarkAsTracked()) return;
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
  }, [linkId, eventType, fileId, folderId, fileName, hasInteracted, eventKey]);

  return null;
}
