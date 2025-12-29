"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Logo } from "@/components/shared/Logo";
import { X, Loader2, FileIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Fonction pour détecter les fichiers Office
function isOfficeFile(mimeType: string): boolean {
  const officeTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/msword', // .doc
    'application/vnd.ms-excel', // .xls
    'application/vnd.ms-powerpoint', // .ppt
  ];
  return officeTypes.includes(mimeType);
}

// Fonction pour obtenir le nom du type de fichier
function getFileTypeName(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word (.docx)',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel (.xlsx)',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint (.pptx)',
    'application/msword': 'Word (.doc)',
    'application/vnd.ms-excel': 'Excel (.xls)',
    'application/vnd.ms-powerpoint': 'PowerPoint (.ppt)',
  };
  return typeMap[mimeType] || mimeType;
}

export default function FileViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params?.token as string;
  const fileId = searchParams?.get("fileId");
  
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");

  useEffect(() => {
    if (!fileId || !token) {
      setError("Paramètres manquants");
      setIsLoading(false);
      return;
    }

    // Récupérer les infos du fichier pour déterminer le type
    fetch(`/api/public/view/info?fileId=${fileId}&token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setFileName(data.name || "Fichier");
          setFileType(data.mimeType || "");
          
          // Construire l'URL du viewer
          const viewUrl = `/api/public/view?fileId=${fileId}&token=${token}`;
          setViewerUrl(viewUrl);
        } else {
          setError("Erreur lors du chargement des informations du fichier");
        }
      })
      .catch((err) => {
        setError("Erreur de connexion");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fileId, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
          <p className="text-white/60 text-sm font-medium">Chargement du fichier...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white">Erreur</h1>
          <p className="text-white/60 text-sm">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 brightness-0 invert" />
            <div>
              <h1 className="text-sm font-medium text-white truncate max-w-md">
                {fileName || "Fichier"}
              </h1>
              <p className="text-xs text-white/40 font-medium">Lecture seule • Filigrane</p>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="pt-20 min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {viewerUrl && (
            <motion.div
              key="viewer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-6xl h-[calc(100vh-8rem)] relative"
            >
              {/* Affichage selon le type de fichier */}
              {fileType.startsWith('image/') ? (
                // Pour les images, utiliser une balise img avec filigrane
                <div className="relative w-full h-full rounded-2xl border border-white/10 bg-white overflow-hidden">
                  {/* Filigrane overlay pour images */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    <div className="text-black/15 text-7xl font-bold select-none" style={{
                      transform: 'rotate(-45deg)',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }}>
                      AIRLOCK
                    </div>
                  </div>
                  <img
                    src={viewerUrl}
                    alt={fileName}
                    className="w-full h-full object-contain relative z-0"
                    style={{ filter: 'brightness(0.98)' }}
                  />
                </div>
              ) : fileType === 'application/pdf' ? (
                // Pour les PDFs, utiliser un iframe
                <iframe
                  src={viewerUrl}
                  className="w-full h-full rounded-2xl border border-white/10 bg-white"
                  title="PDF Viewer"
                  style={{ border: 'none' }}
                />
              ) : fileType.startsWith('text/') ? (
                // Pour les fichiers texte, utiliser un iframe avec filigrane
                <div className="relative w-full h-full rounded-2xl border border-white/10 bg-white overflow-hidden">
                  {/* Filigrane overlay pour texte */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                    <div className="text-black/10 text-7xl font-bold select-none" style={{
                      transform: 'rotate(-45deg)',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }}>
                      AIRLOCK
                    </div>
                  </div>
                  <iframe
                    src={viewerUrl}
                    className="w-full h-full relative z-0"
                    title="Text Viewer"
                    style={{ border: 'none' }}
                  />
                </div>
              ) : isOfficeFile(fileType) ? (
                // Pour les fichiers Office, afficher un message avec option de conversion
                <div className="w-full h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center relative overflow-hidden">
                  {/* Filigrane de fond */}
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-black text-8xl font-bold select-none" style={{
                        transform: 'rotate(-45deg)',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}>
                        AIRLOCK
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-8 max-w-md relative z-10">
                    <FileIcon className="w-20 h-20 mx-auto mb-6 text-black/30" />
                    <h3 className="text-2xl font-bold text-black mb-3">Fichier Office</h3>
                    <p className="text-base text-black/60 mb-2">
                      {getFileTypeName(fileType)}
                    </p>
                    <p className="text-sm text-black/50 mb-6">
                      Ce type de fichier ne peut pas être prévisualisé directement dans le navigateur.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
                      <p className="text-xs text-orange-900 leading-relaxed">
                        <strong className="text-orange-950">Note :</strong> Les fichiers Office ne peuvent pas être prévisualisés dans le navigateur et ne supportent pas le filigrane. 
                        Ce fichier reste téléchargeable.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Pour les autres types, essayer avec un object
                <object
                  data={viewerUrl}
                  type={fileType}
                  className="w-full h-full rounded-2xl border border-white/10 bg-white"
                  style={{ border: 'none' }}
                >
                  <div className="flex items-center justify-center h-full text-white/60">
                    <div className="text-center">
                      <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Ce type de fichier ne peut pas être prévisualisé</p>
                      <p className="text-xs mt-2 opacity-50">{fileType}</p>
                    </div>
                  </div>
                </object>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-white/40 font-medium">
            Ce fichier est en lecture seule avec filigrane. Le téléchargement est désactivé.
          </p>
        </div>
      </div>
    </div>
  );
}

