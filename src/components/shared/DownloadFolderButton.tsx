"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface DownloadFolderButtonProps {
  folderId: string;
  folderName: string;
  token?: string; // Si présent, utiliser l'API publique
}

export function DownloadFolderButton({
  folderId,
  folderName,
  token,
}: DownloadFolderButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const url = token
        ? `/api/public/download-folder?token=${encodeURIComponent(token)}&folderId=${encodeURIComponent(folderId)}`
        : `/api/folders/${folderId}/download`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du téléchargement");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Erreur lors du téléchargement");
      console.error("[DownloadFolderButton] Error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="h-10 px-4 bg-white border border-black/10 rounded-xl text-sm font-medium hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm text-black disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Téléchargement...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Télécharger ZIP</span>
          </>
        )}
      </button>
      {error && (
        <div className="text-red-600 text-xs p-2 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
