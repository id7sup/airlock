"use client";

import { useEffect } from "react";

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
        console.error("Erreur lors du tracking:", error);
      }
    };

    track();
  }, [linkId, eventType, fileId, folderId, fileName]);

  return null;
}

