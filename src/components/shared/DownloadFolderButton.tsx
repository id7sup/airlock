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
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="apple-button h-12 shadow-lg shadow-apple-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Téléchargement...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Télécharger en ZIP
          </>
        )}
      </button>
      {error && (
        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
