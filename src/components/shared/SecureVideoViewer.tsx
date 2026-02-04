"use client";

import { useState } from "react";
import { Loader2, Video } from "lucide-react";
import WatermarkOverlay from "./WatermarkOverlay";

interface SecureVideoViewerProps {
  fileId: string;
  fileName: string;
  token: string;
  password?: string;
}

export default function SecureVideoViewer({
  fileId,
  fileName,
  token,
  password,
}: SecureVideoViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  const videoUrl = `/api/public/view?${new URLSearchParams({
    fileId,
    token,
    ...(password && { pwd: password }),
  }).toString()}`;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Video className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 font-medium text-sm truncate">{fileName}</p>
          <p className="text-white/40 text-xs">Vidéo protégée</p>
        </div>
      </div>

      {/* Video container */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-white/10">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-20">
            <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
            <p className="text-white/60 text-sm">Chargement de la vidéo...</p>
          </div>
        )}

        {/* Video player */}
        <video
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          className="w-full rounded-xl"
          onLoadedData={() => setIsLoading(false)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            maxHeight: "70vh",
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/quicktime" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>

        {/* Watermark overlay */}
        <WatermarkOverlay
          text="CONFIDENTIEL"
          opacity={0.12}
          size="md"
          className="rounded-xl"
        />
      </div>

      {/* Footer notice */}
      <div className="mt-4 flex items-center justify-center gap-3 text-white/30 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Document protégé</span>
        </div>
        <span className="opacity-50">•</span>
        <span>Téléchargement désactivé</span>
        <span className="opacity-50">•</span>
        <span>PiP bloqué</span>
      </div>
    </div>
  );
}
