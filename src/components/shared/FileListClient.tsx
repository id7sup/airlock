"use client";

import {
  FileText,
  Download,
  Eye,
  FolderOpen,
  ChevronRight,
  Folder,
  Image,
  Film,
  Music,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  FileCode,
  File,
  Files,
  FolderClosed,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FileViewerModal } from "./FileViewerModal";

// Get file icon and color based on mime type
function getFileInfo(mimeType: string) {
  if (mimeType?.startsWith("image/")) return { icon: Image, color: "bg-[#96A982]", label: "Image" };
  if (mimeType?.startsWith("video/")) return { icon: Film, color: "bg-indigo-600", label: "Vidéo" };
  if (mimeType?.startsWith("audio/")) return { icon: Music, color: "bg-rose-600", label: "Audio" };
  if (mimeType?.includes("pdf")) return { icon: FileText, color: "bg-red-600", label: "PDF" };
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) return { icon: FileSpreadsheet, color: "bg-emerald-600", label: "Tableur" };
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint")) return { icon: Presentation, color: "bg-orange-600", label: "Présentation" };
  if (mimeType?.includes("zip") || mimeType?.includes("rar") || mimeType?.includes("tar") || mimeType?.includes("7z")) return { icon: FileArchive, color: "bg-slate-600", label: "Archive" };
  if (mimeType?.includes("javascript") || mimeType?.includes("typescript") || mimeType?.includes("json") || mimeType?.includes("html") || mimeType?.includes("css") || mimeType?.includes("xml")) return { icon: FileCode, color: "bg-sky-600", label: "Code" };
  if (mimeType?.includes("document") || mimeType?.includes("word") || mimeType?.includes("text")) return { icon: FileText, color: "bg-blue-600", label: "Document" };
  return { icon: File, color: "bg-zinc-600", label: "Fichier" };
}

// Format file size
function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 o";
  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function FileListClient({
  files,
  children,
  shareLinkId,
  token,
  password,
}: {
  files: any[];
  children?: any[];
  shareLinkId: string;
  token: string;
  password?: string;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>();

  const handleViewFile = (fileId: string) => {
    setSelectedFileId(fileId);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedFileId(undefined);
  };

  const filesWithRules = files.map((file: any) => ({
    ...file,
    rule: { downloadAllowed: file.rule?.downloadAllowed ?? true },
    type: "file" as const,
  }));

  const folders = (children || []).map((child: any) => ({
    ...child,
    type: "folder",
  }));

  // Empty state
  if (folders.length === 0 && filesWithRules.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-20 h-20 bg-black/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Folder className="w-10 h-10 text-black/20" />
        </div>
        <p className="text-lg font-medium text-black/60 mb-1">Ce dossier est vide</p>
        <p className="text-sm text-black/40">Aucun fichier à afficher</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-black/[0.06]">
        {folders.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-black/50">
            <FolderClosed className="w-4 h-4" />
            <span>{folders.length} dossier{folders.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {filesWithRules.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-black/50">
            <Files className="w-4 h-4" />
            <span>{filesWithRules.length} fichier{filesWithRules.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {folders.map((folder: any) => (
              <Link
                key={folder.id}
                href={`/share/${token}/folder/${folder.id}${password ? `?pwd=${encodeURIComponent(password)}` : ""}`}
                className="group p-4 bg-white rounded-xl border border-black/[0.06] hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                    <FolderOpen className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black truncate group-hover:text-brand-primary transition-colors">{folder.name}</p>
                    <p className="text-xs text-black/40 mt-0.5">Dossier</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black/20 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {filesWithRules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filesWithRules.map((file: any) => {
            const canDownload = file.rule.downloadAllowed;
            const { icon: IconComponent, color, label } = getFileInfo(file.mimeType);

            // Les fichiers téléchargeables n'ont pas de preview (sécurité)
            const canPreview = !canDownload;

            return (
              <div
                key={file.id}
                className="group relative bg-white rounded-xl border border-black/[0.06] hover:border-black/10 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Zone cliquable - preview uniquement si non téléchargeable */}
                {canPreview ? (
                  <button
                    onClick={() => handleViewFile(file.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-medium text-black truncate pr-8 group-hover:text-brand-primary transition-colors">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-black/40">{label}</span>
                          <span className="text-xs text-black/20">•</span>
                          <span className="text-xs text-black/40 tabular-nums">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="w-full p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-medium text-black truncate pr-8">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-black/40">{label}</span>
                          <span className="text-xs text-black/20">•</span>
                          <span className="text-xs text-black/40 tabular-nums">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Bouton preview uniquement pour les fichiers non téléchargeables */}
                  {canPreview && (
                    <button
                      onClick={() => handleViewFile(file.id)}
                      className="p-2 bg-white/90 backdrop-blur border border-black/10 text-black/60 hover:text-brand-primary hover:border-brand-primary/30 rounded-lg transition-all shadow-sm"
                      title="Prévisualiser"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {canDownload && (
                    <a
                      href={`/api/public/download?fileId=${file.id}&token=${token}${password ? `&pwd=${encodeURIComponent(password)}` : ""}`}
                      className="p-2 bg-white/90 backdrop-blur border border-black/10 text-black/60 hover:text-brand-primary hover:border-brand-primary/30 rounded-lg transition-all shadow-sm"
                      title="Télécharger"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Download indicator for mobile */}
                {canDownload && (
                  <div className="lg:hidden absolute bottom-3 right-3">
                    <a
                      href={`/api/public/download?fileId=${file.id}&token=${token}${password ? `&pwd=${encodeURIComponent(password)}` : ""}`}
                      className="p-2.5 bg-black text-white rounded-xl shadow-md active:scale-95 transition-transform"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <FileViewerModal
        isOpen={viewerOpen}
        onClose={handleCloseViewer}
        fileId={selectedFileId}
        token={token}
        password={password}
        files={filesWithRules
          .filter((f: any) => !f.rule.downloadAllowed) // Seuls les fichiers non téléchargeables peuvent être prévisualisés
          .map((f: any) => ({
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
            downloadAllowed: f.rule.downloadAllowed,
          }))}
        onFileChange={(fileId) => setSelectedFileId(fileId)}
      />
    </>
  );
}
