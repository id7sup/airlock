"use client";

import { useEffect } from "react";

/**
 * Composant Client pour tracker les événements d'analytics
 * 
 * Envoie automatiquement un événement à l'API analytics lors du montage.
 * Utilisé dans les pages de partage pour tracker les vues et interactions.
 * 
 * @param linkId - ID du lien de partage
 * @param eventType - Type d'événement à tracker
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
  useEffect(() => {
    const track = async () => {
      try {
        await fetch("/api/analytics/track-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            linkId,
            eventType,
            fileId,
            folderId,
            fileName,
          }),
        });
      } catch (error) {
        // Ignorer les erreurs de tracking (ne pas bloquer l'UI)
      }
    };

    track();
  }, [linkId, eventType, fileId, folderId, fileName]);

  return null;
}
