"use client";

import { useState, useRef } from "react";
import { 
  FileText, 
  FolderOpen, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ChevronLeft, 
  Download, 
  Trash2,
  Upload,
  Loader2,
  Folder,
  PlusCircle,
  RefreshCw,
  CheckSquare,
  Square,
  X,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { 
  getPresignedUploadUrlAction, 
  confirmFileUploadAction, 
  getFileDownloadUrlAction, 
  deleteFileAction 
} from "@/lib/actions/files";
import { createFolderAction, deleteFolderAction } from "@/lib/actions/folders";
import { ShareModal } from "@/components/dashboard/ShareModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ErrorModal } from "@/components/shared/ErrorModal";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

const MAX_FILES_PER_UPLOAD = 500; // Limite de fichiers par upload

export default function FolderView({ folder, fromFilter, parentId, userRole = "OWNER" }: { folder: any, fromFilter?: string, parentId?: string | null, userRole?: "OWNER" | "EDITOR" | "VIEWER" }) {
  const canEdit = userRole === "OWNER" || userRole === "EDITOR";
  const canShare = userRole === "OWNER" || userRole === "EDITOR";
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [limitModal, setLimitModal] = useState<{
    isOpen: boolean;
    selectedCount: number;
  }>({
    isOpen: false,
    selectedCount: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDestructive: true
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await createFolderAction(newFolderName, folder.id);
      setNewFolderName("");
      setShowCreateInput(false);
      router.refresh();
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la création du sous-dossier"
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: `Supprimer ${selectedIds.length} éléments ?`,
      message: "Les éléments sélectionnés seront définitivement supprimés.",
      isDestructive: true,
      onConfirm: async () => {
        setIsUploading(true);
        try {
          await Promise.all(selectedIds.map(async (id) => {
            const isFile = folder.files.some((f: any) => f.id === id);
            if (isFile) {
              await deleteFileAction(id);
            } else {
              await deleteFolderAction(id);
            }
          }));
          setSelectedIds([]);
          router.refresh();
        } finally {
          setIsUploading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDownloadFolder = async (folderIdToDownload?: string, folderNameToDownload?: string) => {
    try {
      setIsDownloading(true);

      const idToDownload = folderIdToDownload || folder.id;
      const nameToDownload = folderNameToDownload || folder.name;

      const response = await fetch(`/api/folders/${idToDownload}/download`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du téléchargement");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nameToDownload}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de téléchargement",
        message: error.message || "Erreur lors du téléchargement du ZIP"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (folder.isDeleted) {
    return (
      <div className="p-12 text-center text-black">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Trash2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-semibold mb-2 tracking-tight">{folder.name} est dans la corbeille</h1>
        <p className="text-black/40 mb-8 font-medium">Restaurez ce dossier pour y accéder à nouveau.</p>
        <Link href="/dashboard?filter=trash" className="bg-black text-white px-8 py-3 rounded-2xl font-semibold hover:bg-black/90 transition-all shadow-xl shadow-black/10 inline-flex items-center gap-2 text-sm">
          Aller à la corbeille <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const uploadFiles = async (files: File[], targetFolderId: string = folder.id, onProgress?: (current: number, total: number) => void) => {
    if (files.length === 0) return;

    // Vérifier la limite de fichiers
    if (files.length > MAX_FILES_PER_UPLOAD) {
      setLimitModal({ isOpen: true, selectedCount: files.length });
      return;
    }

    // Si onProgress est fourni, on ne gère pas l'état local (utilisé pour les dossiers)
    // Sinon, on gère l'état local (upload direct de fichiers)
    const isLocalUpload = !onProgress;
    
    if (isLocalUpload) {
    setIsUploading(true);
      setUploadProgress({ current: 0, total: files.length });
    }
    
    const uploadedCountRef = { current: 0 };
    
    try {
      // Concurrence maximale pour optimiser la vitesse
      const CONCURRENCY = 50;

      // Préparer tous les presigned URLs en parallèle avec gestion d'erreur
      const uploadTasks = files.map(async (file) => {
        try {
          const { uploadUrl, s3Key } = await getPresignedUploadUrlAction({
            name: file.name,
            size: file.size,
            mimeType: file.type,
            folderId: targetFolderId,
          });
          return { file, uploadUrl, s3Key, success: true };
        } catch (error) {
          console.error(`Erreur presigned URL pour ${file.name}:`, error);
          return { file, uploadUrl: null, s3Key: null, success: false, error };
        }
      });

      const preparedTasks = await Promise.all(uploadTasks);
      const validTasks = preparedTasks.filter(task => task.success);

      // Uploader les fichiers en parallèle avec concurrence maximale
      for (let i = 0; i < validTasks.length; i += CONCURRENCY) {
        const batch = validTasks.slice(i, i + CONCURRENCY);
        await Promise.allSettled(batch.map(async ({ file, uploadUrl, s3Key }) => {
          if (!uploadUrl || !s3Key) return;

          try {
            // Upload vers S3 (bloquant pour la progression)
            await fetch(uploadUrl, {
              method: "PUT",
              body: file,
              headers: { "Content-Type": file.type || "application/octet-stream" },
            });

            // Mettre à jour la progression immédiatement après l'upload S3
            uploadedCountRef.current++;
            const current = uploadedCountRef.current;

            if (isLocalUpload) {
              setUploadProgress({ current, total: files.length });
            }
            if (onProgress) {
              onProgress(current, files.length);
            }

            // Confirmer l'upload en arrière-plan (non-bloquant)
            confirmFileUploadAction({
              name: file.name,
              size: file.size,
              mimeType: file.type,
              s3Key: s3Key,
              folderId: targetFolderId,
            }).catch(err => console.error("Erreur confirmation:", err));
          } catch (error) {
            console.error(`Erreur upload pour ${file.name}:`, error);
            uploadedCountRef.current++;
            const current = uploadedCountRef.current;
            if (isLocalUpload) {
              setUploadProgress({ current, total: files.length });
            }
            if (onProgress) {
              onProgress(current, files.length);
            }
          }
        }));
      }

      router.refresh();
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur d'upload",
        message: "Erreur lors de l'upload des fichiers"
      });
    } finally {
      if (isLocalUpload) {
        setIsUploading(false);
        setUploadProgress({ current: 0, total: 0 });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  // Fonction récursive pour lire les fichiers d'un dossier
  const readDirectoryEntries = async (
    directoryEntry: FileSystemDirectoryEntry
  ): Promise<{ files: File[]; subFolders: { name: string; entry: FileSystemDirectoryEntry }[] }> => {
    const files: File[] = [];
    const subFolders: { name: string; entry: FileSystemDirectoryEntry }[] = [];

    return new Promise((resolve) => {
      const reader = directoryEntry.createReader();
      const readEntries = () => {
        reader.readEntries((entries) => {
          if (entries.length === 0) {
            resolve({ files, subFolders });
            return;
          }

          const promises = entries.map((entry) => {
            return new Promise<void>((resolveEntry) => {
              if (entry.isFile) {
                (entry as FileSystemFileEntry).file((file) => {
                  files.push(file);
                  resolveEntry();
                });
              } else if (entry.isDirectory) {
                subFolders.push({
                  name: entry.name,
                  entry: entry as FileSystemDirectoryEntry,
                });
                resolveEntry();
              } else {
                resolveEntry();
              }
            });
          });

          Promise.all(promises).then(() => {
            readEntries(); // Continuer à lire
          });
        });
      };

      readEntries();
    });
  };

  // Fonction récursive pour compter tous les fichiers dans un dossier
  const countAllFilesInDirectory = async (
    directoryEntry: FileSystemDirectoryEntry
  ): Promise<number> => {
    const { files, subFolders } = await readDirectoryEntries(directoryEntry);
    let totalCount = files.length;
    
    // Compter récursivement dans les sous-dossiers
    for (const subFolder of subFolders) {
      totalCount += await countAllFilesInDirectory(subFolder.entry);
    }
    
    return totalCount;
  };

  // Fonction récursive pour créer un dossier et uploader son contenu
  const createFolderAndUploadContent = async (
    folderName: string,
    parentFolderId: string,
    directoryEntry: FileSystemDirectoryEntry,
    onFileUploaded: () => void
  ): Promise<void> => {
    try {
      // Créer le dossier
      const newFolderId = await createFolderAction(folderName, parentFolderId);
      
      // Lire le contenu du dossier
      const { files, subFolders } = await readDirectoryEntries(directoryEntry);
      
      // Uploader les fichiers et créer les sous-dossiers en parallèle pour optimiser
      const uploadPromise = files.length > 0 ? (async () => {
        let lastProgress = 0;
        await uploadFiles(files, newFolderId, (current, total) => {
          // Pour chaque nouveau fichier uploadé depuis le dernier appel, appeler onFileUploaded
          const newFilesCount = current - lastProgress;
          for (let i = 0; i < newFilesCount; i++) {
            onFileUploaded();
          }
          lastProgress = current;
        });
      })() : Promise.resolve();
      
      // Créer récursivement les sous-dossiers en parallèle (optimisation maximale)
      const subFolderPromises = subFolders.map(subFolder =>
        createFolderAndUploadContent(subFolder.name, newFolderId, subFolder.entry, onFileUploaded)
      );
      
      // Attendre que les fichiers ET les sous-dossiers soient traités en parallèle
      await Promise.all([uploadPromise, ...subFolderPromises]);
    } catch (error: any) {
      console.error(`Erreur lors de la création du dossier "${folderName}":`, error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const droppedFiles = Array.from(e.target.files || []);
    await uploadFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canEdit) {
      setIsDraggingOver(true);
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Vérifier si on quitte vraiment le conteneur
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    if (!canEdit) {
      setErrorModal({
        isOpen: true,
        title: "Permission refusée",
        message: "Vous n'avez pas les permissions pour ajouter des fichiers ou dossiers"
      });
      return;
    }

    const items = Array.from(e.dataTransfer.items || []);
    if (items.length === 0) {
      // Fallback: essayer avec dataTransfer.files
      const droppedFiles = Array.from(e.dataTransfer.files || []);
      if (droppedFiles.length > 0) {
        await uploadFiles(droppedFiles);
      }
      return;
    }

    const files: File[] = [];
    const folderPromises: Promise<void>[] = [];
    let totalFilesToUpload = 0;

    try {
      // Compter d'abord tous les fichiers pour vérifier la limite
      for (const item of items) {
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isFile) {
              totalFilesToUpload++;
            } else if (entry.isDirectory) {
              try {
                const dirEntry = entry as FileSystemDirectoryEntry;
                const folderFileCount = await countAllFilesInDirectory(dirEntry);
                totalFilesToUpload += folderFileCount;
              } catch (error) {
                console.error("Erreur lors du comptage des fichiers du dossier:", error);
              }
            }
          }
        }
      }

      // Vérifier la limite globale
      if (totalFilesToUpload > MAX_FILES_PER_UPLOAD) {
        setLimitModal({ isOpen: true, selectedCount: totalFilesToUpload });
        return;
      }

      // Initialiser l'upload
      setIsUploading(true);
      setUploadProgress({ current: 0, total: totalFilesToUpload || 1 });

      let uploadedFilesCounter = 0;
      const onFileUploaded = () => {
        uploadedFilesCounter++;
        setUploadProgress({ current: uploadedFilesCounter, total: totalFilesToUpload || uploadedFilesCounter });
      };

      // Traiter tous les items pour lire les fichiers et créer les dossiers
      for (const item of items) {
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isFile) {
              try {
                const file = await new Promise<File>((resolve, reject) => {
                  (entry as FileSystemFileEntry).file(resolve, reject);
                });
                files.push(file);
              } catch (error) {
                console.error("Erreur lors de la lecture du fichier:", error);
              }
            } else if (entry.isDirectory) {
              // Créer le dossier et uploader son contenu récursivement
              const dirEntry = entry as FileSystemDirectoryEntry;
              folderPromises.push(
                createFolderAndUploadContent(entry.name, folder.id, dirEntry, onFileUploaded).catch((error) => {
                  console.error(`Erreur lors de la création du dossier "${entry.name}":`, error);
                  setErrorModal({
                    isOpen: true,
                    title: "Erreur",
                    message: error.message || `Erreur lors de la création du dossier "${entry.name}"`
                  });
                })
              );
            }
          } else {
            // Si webkitGetAsEntry() retourne null, essayer de récupérer le fichier directement via getAsFile()
            const file = item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
        }
      }

      // Uploader les fichiers directement dans le dossier actuel
      if (files.length > 0) {
        let lastCount = 0;
        await uploadFiles(files, folder.id, (current, total) => {
          // Pour chaque nouveau fichier uploadé, appeler onFileUploaded
          const newFiles = current - lastCount;
          for (let i = 0; i < newFiles; i++) {
            onFileUploaded();
          }
          lastCount = current;
        });
      }

      // Attendre que tous les dossiers soient créés
      if (folderPromises.length > 0) {
        await Promise.all(folderPromises);
      }

      router.refresh();
    } catch (error: any) {
      console.error("Erreur globale dans handleDrop:", error);
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: error.message || "Erreur lors du dépôt des fichiers"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const url = await getFileDownloadUrlAction(fileId);
      window.open(url, "_blank");
    } catch (error) {
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors du téléchargement"
      });
    }
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "Supprimer ce fichier ?",
      message: "Cette action est irréversible. Les données seront perdues.",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteFileAction(fileId);
          router.refresh();
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteSubFolder = (childId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "Supprimer ce sous-dossier ?",
      message: "Tous les fichiers et dossiers à l'intérieur seront également supprimés.",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteFolderAction(childId);
          router.refresh();
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div 
      className={`p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto text-black animate-in fade-in duration-700 select-none relative ${
        isDraggingOver && canEdit ? "bg-brand-primary/5 border-2 border-dashed border-brand-primary rounded-2xl" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && canEdit && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/10 backdrop-blur-sm rounded-2xl z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-brand-primary">
            <Upload className="w-12 h-12 text-brand-primary mx-auto mb-4" />
            <p className="text-lg font-semibold text-black text-center">Déposez vos fichiers ici</p>
            <p className="text-sm text-black/40 text-center mt-2">Les fichiers et dossiers seront ajoutés</p>
          </div>
        </div>
      )}
      {/* En-tête redesigné */}
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href={parentId ? `/dashboard/folder/${parentId}${fromFilter ? `?from=${fromFilter}` : ''}` : (fromFilter ? `/dashboard?filter=${fromFilter}` : "/dashboard")} 
            className="w-10 h-10 flex items-center justify-center bg-white border border-black/10 hover:bg-black/5 rounded-xl transition-all text-black active:scale-95 flex-shrink-0 shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight truncate mb-1">{folder.name}</h1>
            <div className="flex items-center gap-2 text-xs font-medium text-black/40">
              <span>{folder.files.length + folder.children.length} élément{folder.files.length + folder.children.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        {/* Barre d'actions redesignée */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl shadow-lg flex-1 sm:flex-initial"
              >
                <span className="text-xs font-semibold whitespace-nowrap">{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
                <div className="h-4 w-px bg-white/20" />
                <button onClick={handleBatchDelete} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedIds([])} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <button 
                onClick={() => setShowCreateInput(true)}
                className="h-10 px-4 bg-white border border-black/10 rounded-xl text-sm font-medium hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm text-black"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau dossier</span>
                <span className="sm:hidden">Dossier</span>
              </button>
            )}
            {canShare && (
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="h-10 px-4 bg-white border border-black/10 rounded-xl text-sm font-medium hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm text-black"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Partager</span>
              </button>
            )}

            <button
              onClick={() => handleDownloadFolder()}
              disabled={isDownloading}
              className="h-10 px-4 bg-white border border-black/10 rounded-xl text-sm font-medium hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm text-black disabled:opacity-50"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Télécharger ZIP</span>
            </button>

            {canEdit && (
              <>
                <input 
                  type="file" 
                  multiple
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-10 px-5 bg-black text-white rounded-xl font-medium text-sm disabled:opacity-50 shadow-md hover:bg-black/90 transition-all flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? "Envoi..." : "Ajouter"}
                </button>
                {isUploading && uploadProgress.total > 0 && (
                  <div className="w-full sm:w-auto min-w-[200px] bg-black/5 rounded-xl p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-black/60">
                        {uploadProgress.current} / {uploadProgress.total} fichiers
                      </span>
                      <span className="text-xs font-medium text-black/60">
                        {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary transition-all duration-300 ease-out rounded-full"
                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table View - Redesigné */}
      <div className="hidden lg:block bg-white rounded-2xl border border-black/[0.05] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.05] bg-black/[0.02]">
                <th className="w-16 px-6 py-4">
                  <button 
                    onClick={() => {
                      const allIds = [...folder.children.map((c: any) => c.id), ...folder.files.map((f: any) => f.id)];
                      setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
                    }}
                    className="text-black/30 hover:text-brand-primary transition-colors"
                  >
                    {selectedIds.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-4 py-4 text-xs font-semibold text-black/50">Nom</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/50">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-black/50">Modifié</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {showCreateInput && (
                <tr className="bg-brand-primary/5 animate-in slide-in-from-top-2 duration-300">
                  <td className="px-6 py-4" colSpan={5}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <input 
                        autoFocus
                        className="flex-1 bg-transparent border-b-2 border-brand-primary/20 outline-none text-base font-medium py-2 focus:border-brand-primary transition-colors"
                        placeholder="Nom du dossier..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                      />
                      <div className="flex gap-3">
                        <button 
                          onClick={handleCreateFolder}
                          disabled={isCreatingFolder}
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCreatingFolder && <RefreshCw className="w-4 h-4 animate-spin" />}
                          Créer
                        </button>
                        <button 
                          onClick={() => setShowCreateInput(false)}
                          className="px-4 py-2 bg-white border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-all"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              
              {folder.children.length === 0 && folder.files.length === 0 && !showCreateInput && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mb-2">
                        <Folder className="w-8 h-8 text-black/20" />
                      </div>
                      <p className="text-sm font-medium text-black/40">Ce dossier est vide</p>
                    </div>
                  </td>
                </tr>
              )}

              {folder.children.map((child: any) => (
                <tr 
                  key={child.id} 
                  className={`hover:bg-black/[0.02] transition-colors group ${selectedIds.includes(child.id) ? 'bg-brand-primary/5' : ''}`}
                >
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(child.id)} className="text-black/20 hover:text-brand-primary transition-colors">
                      {selectedIds.includes(child.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5 opacity-0 group-hover:opacity-100" />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/dashboard/folder/${child.id}?from=${fromFilter || ''}&parent=${folder.id}`} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/20 transition-all">
                        <FolderOpen className="w-5 h-5 fill-current" />
                      </div>
                      <span className="text-base font-medium text-black">{child.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-black/40">
                    Dossier
                  </td>
                  <td className="px-6 py-4 text-sm text-black/40 tabular-nums" suppressHydrationWarning>
                    {new Date(child.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => handleDownloadFolder(child.id, child.name)}
                        disabled={isDownloading}
                        className="p-2 text-black/30 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                        title="Télécharger le dossier en ZIP"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={(e) => handleDeleteSubFolder(child.id, e)}
                          className="p-2 text-black/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {folder.files.map((file: any) => (
                <tr 
                  key={file.id} 
                  className={`hover:bg-black/[0.02] transition-colors group ${selectedIds.includes(file.id) ? 'bg-brand-primary/5' : ''}`}
                >
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(file.id)} className="text-black/20 hover:text-brand-primary transition-colors">
                      {selectedIds.includes(file.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5 opacity-0 group-hover:opacity-100" />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black/40 group-hover:bg-black/10 transition-all">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-base font-medium text-black">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-black/40 tabular-nums">
                    {(file.size / 1024 / 1024).toFixed(2)} Mo
                  </td>
                  <td className="px-6 py-4 text-sm text-black/40 tabular-nums" suppressHydrationWarning>
                    {new Date(file.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleDownload(file.id)}
                        className="p-2 text-black/30 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {canEdit && (
                      <button 
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="p-2 text-black/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Mobile List View - Redesigné */}
      <div className="lg:hidden space-y-3">
        {/* Select All Button */}
        {folder.children.length > 0 || folder.files.length > 0 ? (
          <div className="flex items-center justify-between p-3 bg-white border border-black/10 rounded-xl">
            <button 
              onClick={() => {
                const allIds = [...folder.children.map((c: any) => c.id), ...folder.files.map((f: any) => f.id)];
                setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
              }}
              className="flex items-center gap-2 text-sm font-medium text-black/60"
            >
              {selectedIds.length > 0 ? <CheckSquare className="w-4 h-4 text-brand-primary" /> : <Square className="w-4 h-4" />}
              <span>Tout sélectionner</span>
            </button>
          </div>
        ) : null}

        {/* Create Input Mobile */}
        {canEdit && showCreateInput && (
          <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/20 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <input 
                autoFocus
                className="flex-1 bg-transparent border-b-2 border-brand-primary/20 outline-none text-base font-medium py-2 focus:border-brand-primary transition-colors"
                placeholder="Nom du dossier..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
              <div className="flex gap-2 flex-shrink-0">
                <button 
                  onClick={handleCreateFolder}
                  disabled={isCreatingFolder}
                  className="px-3 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCreatingFolder && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Créer
                </button>
                <button 
                  onClick={() => setShowCreateInput(false)}
                  className="px-3 py-2 bg-white border border-black/10 rounded-lg text-sm font-medium hover:bg-black/5 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State Mobile */}
        {folder.children.length === 0 && folder.files.length === 0 && !showCreateInput && (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">
                <Folder className="w-8 h-8 text-black/20" />
              </div>
              <p className="text-sm font-medium text-black/40">Ce dossier est vide</p>
            </div>
          </div>
        )}

        {/* Folders Mobile */}
        {folder.children.map((child: any) => (
          <div 
            key={child.id} 
            className={`p-4 bg-white rounded-xl border border-black/10 hover:border-black/20 transition-all ${
              selectedIds.includes(child.id) ? 'bg-brand-primary/5 border-brand-primary/30' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => toggleSelect(child.id)} className="text-black/20 hover:text-brand-primary transition-colors flex-shrink-0">
                {selectedIds.includes(child.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5" />}
              </button>
              <Link href={`/dashboard/folder/${child.id}?from=${fromFilter || ''}&parent=${folder.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0">
                  <FolderOpen className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-black truncate">{child.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-black/40">Dossier</span>
                    <span className="text-xs text-black/20">•</span>
                    <span className="text-xs text-black/40 tabular-nums" suppressHydrationWarning>
                      {new Date(child.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleDownloadFolder(child.id, child.name)}
                disabled={isDownloading}
                className="p-2 text-black/30 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all flex-shrink-0 disabled:opacity-50"
                title="Télécharger le dossier en ZIP"
              >
                <Download className="w-4 h-4" />
              </button>
              {canEdit && (
              <button
                onClick={(e) => handleDeleteSubFolder(child.id, e)}
                className="p-2 text-black/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              )}
            </div>
          </div>
        ))}

        {/* Files Mobile */}
        {folder.files.map((file: any) => (
          <div 
            key={file.id} 
            className={`p-4 bg-white rounded-xl border border-black/10 hover:border-black/20 transition-all ${
              selectedIds.includes(file.id) ? 'bg-brand-primary/5 border-brand-primary/30' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => toggleSelect(file.id)} className="text-black/20 hover:text-brand-primary transition-colors flex-shrink-0">
                {selectedIds.includes(file.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black/40 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-black truncate">{file.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-black/40 tabular-nums">
                      {(file.size / 1024 / 1024).toFixed(2)} Mo
                    </span>
                    <span className="text-xs text-black/20">•</span>
                    <span className="text-xs text-black/40 tabular-nums" suppressHydrationWarning>
                      {new Date(file.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button 
                  onClick={() => handleDownload(file.id)}
                  className="p-2 text-black/30 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                {canEdit && (
                <button 
                  onClick={(e) => handleDeleteFile(file.id, e)}
                  className="p-2 text-black/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        folderId={folder.id}
        folderName={folder.name} 
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: "", message: "" })}
        title={errorModal.title}
        message={errorModal.message}
      />

      {/* Modal pour la limite de fichiers */}
      {limitModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20" onClick={() => setLimitModal({ isOpen: false, selectedCount: 0 })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-black/[0.05]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-orange-50 text-orange-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-medium tracking-tight text-black">Limite de fichiers dépassée</h3>
                <p className="text-[15px] text-black/40 font-normal leading-relaxed">
                  Vous avez sélectionné <strong className="text-black">{limitModal.selectedCount} fichiers</strong>, mais la limite est de <strong className="text-black">{MAX_FILES_PER_UPLOAD} fichiers</strong> maximum par upload.
                </p>
                <p className="text-[14px] text-black/30 font-normal mt-3">
                  Veuillez réduire le nombre de fichiers ou diviser votre upload en plusieurs fois.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setLimitModal({ isOpen: false, selectedCount: 0 })}
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-black/90 rounded-xl text-[14px] font-medium transition-all"
                >
                  Compris
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
