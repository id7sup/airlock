"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  FolderOpen, 
  MoreVertical, 
  Plus, 
  Search, 
  ArrowUpRight, 
  Trash2, 
  Edit2, 
  Loader2, 
  Star,
  RefreshCw,
  Folder,
  Upload,
  FolderPlus,
  Move,
  X,
  LayoutGrid,
  CheckSquare,
  Square,
  ExternalLink,
  Users,
  AlertTriangle
} from "lucide-react";
import { ShareModal } from "@/components/dashboard/ShareModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ErrorModal } from "@/components/shared/ErrorModal";
import { UploadModal } from "@/components/dashboard/UploadModal";
import { 
  createFolderAction, 
  deleteFolderAction, 
  moveToTrashAction, 
  toggleFavoriteAction,
  groupFoldersAction
} from "@/lib/actions/folders";
import { getPresignedUploadUrlAction, confirmFileUploadAction } from "@/lib/actions/files";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";


interface FolderType {
  id: string;
  name: string;
  isFavorite: boolean;
  isDeleted: boolean;
  order: number;
  _count: { files: number; children: number };
  updatedAt: string;
  shareRole?: "VIEWER" | "EDITOR";
  shareCanDownload?: boolean;
  isShared?: boolean;
  sharedBy?: string;
  isPermissionHidden?: boolean;
}

// --- Folder Item ---
function FolderItem({ 
  folder, 
  isSelected, 
  onToggleSelect, 
  onShare, 
  onTrash,
  onRestore,
  onDeletePermanent,
  onToggleFavorite,
  currentFilter,
}: any) {
  const router = useRouter();

  const itemClass = `p-4 sm:p-5 lg:p-6 transition-all duration-500 group relative bg-white h-full block rounded-xl sm:rounded-2xl border border-black/[0.05] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-black/10 ${
    isSelected ? "ring-2 ring-black shadow-xl" : "shadow-sm shadow-black/[0.01]"
  }`;

  return (
    <div 
      className="relative h-full select-none"
      data-folder-id={folder.id}
      onClick={(e) => {
        // Si Meta/Ctrl est pressé, on sélectionne au lieu d'ouvrir
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          onToggleSelect(folder.id);
          return;
        }

        // Empêcher l'ouverture des dossiers supprimés ou avec permission masquée
        if (!folder.isDeleted && !(folder as any).isPermissionHidden) {
          router.push(`/dashboard/folder/${folder.id}?from=${currentFilter}`);
        }
      }}
    >
      <div className={itemClass} data-folder-id={folder.id}>
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform duration-500">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(folder.id, folder.isFavorite, e); }}
              className={`p-1 sm:p-1.5 transition-all duration-300 group/star opacity-0 group-hover:opacity-100 ${
                folder.isFavorite ? "text-orange-400 scale-110 !opacity-100" : "text-black/10 hover:text-orange-400 hover:scale-110"
              }`}
            >
              <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${folder.isFavorite ? "fill-current" : "group-hover/star:fill-current text-orange-400"}`} />
            </button>
          </div>
          
          <div className="flex flex-col items-end gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <div className="flex items-center gap-1">
                  {!folder.isDeleted && !(folder as any).isPermissionHidden ? (
                <>
                  {!folder.isShared && (
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(folder.id, folder.name, e); }} 
                      className="p-1.5 sm:p-2 text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTrash(folder.id, e); }} 
                    className="p-1.5 sm:p-2 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </>
              ) : (
                <>
                  {(folder.isDeleted || (folder as any).isPermissionHidden) && (
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRestore(folder.id, e); }} 
                      className="text-[9px] sm:text-[10px] font-bold text-black px-2 sm:px-3 py-0.5 sm:py-1 bg-black/5 rounded-full hover:bg-black/10 transition-all text-nowrap"
                    >
                      Restaurer
                    </button>
                  )}
                  {folder.isDeleted && (
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeletePermanent(folder.id, e); }} 
                      className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
            {/* Badge partagé en dessous du bouton supprimer */}
            {folder.isShared && !folder.isDeleted && !(folder as any).isPermissionHidden && (
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-brand-primary/10 text-brand-primary rounded-full">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-[9px] sm:text-[10px] font-medium">Partagé</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="pointer-events-none space-y-1.5 sm:space-y-2">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-black truncate tracking-tight">{folder.name}</h3>
            {folder.isShared && folder.sharedBy && (
              <p className="text-[10px] sm:text-xs text-black/40 font-medium mt-0.5 truncate">Partagé par {folder.sharedBy}</p>
            )}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] text-black/30 font-medium uppercase tracking-widest">{folder._count.files} fichiers</span>
              {folder.isShared && (
                <>
                  <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-black text-white rounded-full font-medium">
                    {folder.shareRole === "VIEWER" ? "Viewer" : "Editor"}
                  </span>
                  {folder.shareRole === "VIEWER" && !folder.shareCanDownload && (
                    <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                      Download off
                    </span>
                  )}
                </>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-black/30 font-medium uppercase tracking-widest" suppressHydrationWarning>
              {new Date(folder.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const MAX_FILES_PER_UPLOAD = 500; // Limite de fichiers par upload

export default function DashboardClient({ initialFolders, currentFilter }: { initialFolders: FolderType[], currentFilter: string }) {
  const router = useRouter();
  const [folders, setFolders] = useState(initialFolders);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<{id: string, name: string} | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGroupingMode, setIsGroupingMode] = useState(false);
  const [hiddenFolderIds, setHiddenFolderIds] = useState<string[]>([]); // Dossiers temporairement cachés pendant le regroupement
  const [isSelecting, setIsSelecting] = useState(false);
  const [justFinishedLasso, setJustFinishedLasso] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ 
    startX: number; 
    startY: number; 
    currentX: number; 
    currentY: number;
    isAdditive: boolean;
  } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<Array<{
    name: string;
    size: number;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    error?: string;
  }>>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, isUploading: false });
  const [limitModal, setLimitModal] = useState<{
    isOpen: boolean;
    selectedCount: number;
  }>({
    isOpen: false,
    selectedCount: 0
  });
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: ""
  });
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

  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !hiddenFolderIds.includes(folder.id) // Exclure les dossiers temporairement cachés
  );

  // Système de sélection lasso complètement réécrit
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Ignorer si :
    // - Pas le bouton gauche
    // - Clic sur un bouton, lien, ou élément interactif
    // - Clic sur un dossier (pour éviter conflit avec drag & drop)
    // - Déjà en train de drag & drop
    // Permettre Cmd/Ctrl pour mode additif du lasso
    const target = e.target as HTMLElement;
    if (
      e.button !== 0 ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[data-folder-id]')
    ) {
      return;
    }

    // Vérifier qu'on clique bien dans la zone de la grille
    if (!gridRef.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;

    // Vérifier que le clic est dans la zone de la grille
    if (
      clickX < containerRect.left ||
      clickX > containerRect.right ||
      clickY < containerRect.top ||
      clickY > containerRect.bottom
    ) {
      return;
    }

    // Coordonnées relatives au conteneur
    const startX = clickX - containerRect.left;
    const startY = clickY - containerRect.top;
    const isAdditive = e.metaKey || e.ctrlKey; // Mode additif avec Cmd/Ctrl
    
    let hasMoved = false;
    let finalSelected: string[] = []; // Stocker la sélection finale
    const MIN_DISTANCE = 5; // Distance minimale pour activer le lasso

    const updateSelection = (moveEvent: MouseEvent) => {
      if (!containerRef.current || !gridRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const currentX = moveEvent.clientX - containerRect.left;
      const currentY = moveEvent.clientY - containerRect.top;

      // Calculer la distance parcourue
      const distance = Math.sqrt(
        Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
      );

      // Activer le lasso seulement si on a bougé suffisamment
      if (distance > MIN_DISTANCE && !hasMoved) {
        hasMoved = true;
        setIsSelecting(true);
      }

      if (!hasMoved) return;

      // Mettre à jour le rectangle de sélection visuel
      setSelectionBox({
        startX,
        startY,
        currentX,
        currentY,
        isAdditive
      });

      // Calculer le rectangle de sélection
      const selLeft = Math.min(startX, currentX);
      const selTop = Math.min(startY, currentY);
      const selRight = Math.max(startX, currentX);
      const selBottom = Math.max(startY, currentY);

      // Détecter les dossiers intersectés (pour l'affichage visuel uniquement)
      const newlySelected: string[] = [];
      const children = Array.from(gridRef.current.children);

      children.forEach((child) => {
        const folderElement = child.querySelector('[data-folder-id]');
        if (!folderElement) return;

        const folderId = folderElement.getAttribute('data-folder-id');
        if (!folderId) return;

        // Position du dossier dans le conteneur
        const childRect = child.getBoundingClientRect();
        const childLeft = childRect.left - containerRect.left;
        const childTop = childRect.top - containerRect.top;
        const childRight = childLeft + childRect.width;
        const childBottom = childTop + childRect.height;

        // Vérifier l'intersection
        const intersects = !(
          childRight < selLeft ||
          childLeft > selRight ||
          childBottom < selTop ||
          childTop > selBottom
        );

        if (intersects) {
          newlySelected.push(folderId);
        }
      });

      // Stocker la sélection finale et mettre à jour visuellement
      finalSelected = newlySelected;
      
      // Mettre à jour la sélection visuellement pendant le mouvement
      if (isAdditive) {
        // Mode additif : ajouter/retirer de la sélection existante
        setSelectedIds(prev => {
          const combined = [...new Set([...prev, ...newlySelected])];
          // Retirer ceux qui ne sont plus dans le lasso
          return combined.filter(id => {
            if (newlySelected.includes(id)) return true;
            // Garder ceux qui étaient déjà sélectionnés mais ne sont pas dans le nouveau lasso
            return prev.includes(id);
          });
        });
      } else {
        // Mode normal : remplacer la sélection
        setSelectedIds(newlySelected);
      }
    };

    const stopSelection = () => {
      // Si on n'a pas bougé assez, c'était juste un clic, on annule
      if (!hasMoved) {
        setSelectionBox(null);
        setIsSelecting(false);
      } else {
        // La sélection a déjà été appliquée pendant le mouvement, on nettoie juste
        setIsSelecting(false);
        setSelectionBox(null);
        // Marquer qu'on vient de terminer un lasso pour éviter que le onClick désélectionne
        setJustFinishedLasso(true);
        // Réinitialiser le flag après un court délai
        setTimeout(() => setJustFinishedLasso(false), 100);
      }
      window.removeEventListener('mousemove', updateSelection);
      window.removeEventListener('mouseup', stopSelection);
    };

    window.addEventListener('mousemove', updateSelection);
    window.addEventListener('mouseup', stopSelection);
  }, [filteredFolders]);

  useEffect(() => {
    setFolders(initialFolders);
  }, [initialFolders]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreating(true);
    try {
      if (isGroupingMode) {
        await groupFoldersAction(selectedIds, newFolderName);
        // Les dossiers restent cachés, ils seront supprimés par le refresh
        setSelectedIds([]);
        setIsGroupingMode(false);
        setHiddenFolderIds([]); // Nettoyer après succès
      } else {
        await createFolderAction(newFolderName);
      }
      setNewFolderName("");
      setShowCreateInput(false);
      router.refresh();
    } catch (error) {
      // En cas d'erreur, restaurer les dossiers cachés
      if (isGroupingMode) {
        setHiddenFolderIds([]);
      }
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: "Erreur lors de la création du dossier"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartGrouping = () => {
    // Cacher immédiatement les dossiers sélectionnés
    setHiddenFolderIds([...selectedIds]);
    setShowCreateInput(true);
    setIsGroupingMode(true);
  };

  const handleCancelGrouping = () => {
    // Restaurer les dossiers cachés
    setHiddenFolderIds([]);
    setShowCreateInput(false);
    setIsGroupingMode(false);
    setNewFolderName("");
  };

  const handleBatchDelete = () => {
    // Vérifier si on est dans la corbeille et si les dossiers sont déjà supprimés
    const isInTrash = currentFilter === "trash";
    const selectedFolders = folders.filter(f => selectedIds.includes(f.id));
    const areAllDeleted = selectedFolders.every(f => f.isDeleted === true);
    
    // Si on est dans la corbeille et que tous les dossiers sont déjà supprimés, supprimer définitivement
    if (isInTrash && areAllDeleted) {
      setConfirmModal({
        isOpen: true,
        title: `Supprimer définitivement ${selectedIds.length} dossiers ?`,
        message: "Cette action est irréversible. Les dossiers et leur contenu seront supprimés définitivement.",
        isDestructive: true,
        onConfirm: async () => {
          try {
            // Utiliser allSettled pour continuer même si certains dossiers échouent
            const results = await Promise.allSettled(
              selectedIds.map(id => deleteFolderAction(id))
            );
            
            // Compter les succès et échecs
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            if (failed > 0) {
              console.warn(`${failed} dossier(s) n'ont pas pu être supprimés (peut-être déjà supprimés)`);
            }
            
            setSelectedIds([]);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            router.refresh();
          } catch (error) {
            console.error("Erreur lors de la suppression définitive:", error);
            setErrorModal({
              isOpen: true,
              title: "Erreur",
              message: "Erreur lors de la suppression définitive."
            });
          }
        }
      });
    } else {
      // Sinon, mettre à la corbeille normalement
      setConfirmModal({
        isOpen: true,
        title: `Supprimer ${selectedIds.length} dossiers ?`,
        message: "Les dossiers sélectionnés seront déplacés vers la corbeille.",
        isDestructive: true,
        onConfirm: async () => {
          try {
            await Promise.all(selectedIds.map(id => moveToTrashAction(id, true)));
            setSelectedIds([]);
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            router.refresh();
          } catch (error) {
            setErrorModal({
              isOpen: true,
              title: "Erreur",
              message: "Erreur lors de la suppression groupée."
            });
          }
        }
      });
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

  // Fonction pour uploader des fichiers dans un dossier
  const uploadFilesToFolder = async (files: File[], targetFolderId: string, onProgress?: (current: number, total: number) => void) => {
    if (files.length === 0) return;

    try {
      // Concurrence maximale pour optimiser la vitesse
      const CONCURRENCY = 50;
      const uploadedCountRef = { current: 0 };
      
      // Préparer tous les presigned URLs en parallèle
      const uploadTasks = files.map(async (file) => {
        const { uploadUrl, s3Key } = await getPresignedUploadUrlAction({
          name: file.name,
          size: file.size,
          mimeType: file.type,
          folderId: targetFolderId,
        });
        return { file, uploadUrl, s3Key };
      });

      const preparedTasks = await Promise.all(uploadTasks);
      
      // Uploader les fichiers en parallèle avec concurrence maximale
      for (let i = 0; i < preparedTasks.length; i += CONCURRENCY) {
        const batch = preparedTasks.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(async ({ file, uploadUrl, s3Key }) => {
          // Upload vers S3 (bloquant pour la progression)
          await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || "application/octet-stream" },
          });

          // Mettre à jour la progression immédiatement après l'upload S3
          uploadedCountRef.current++;
          const current = uploadedCountRef.current;
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
        }));
      }
    } catch (error) {
      console.error("Erreur lors de l'upload des fichiers:", error);
      throw error;
    }
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

  // Fonction récursive pour créer un dossier et uploader son contenu (fichiers et sous-dossiers)
  const createFolderAndUploadContent = async (
    folderName: string,
    parentFolderId: string | null,
    directoryEntry: FileSystemDirectoryEntry,
    onFileUploaded: () => void
  ): Promise<void> => {
    // Créer le dossier
    const newFolderId = await createFolderAction(folderName, parentFolderId);
    
    // Lire le contenu du dossier
    const { files, subFolders } = await readDirectoryEntries(directoryEntry);
    
    // Uploader les fichiers et créer les sous-dossiers en parallèle pour optimiser
    const uploadPromise = files.length > 0 ? (async () => {
      let lastProgress = 0;
      await uploadFilesToFolder(files, newFolderId, (current, total) => {
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
    e.dataTransfer.dropEffect = "copy";
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

    const items = Array.from(e.dataTransfer.items || []);
    const folderEntries: { name: string; entry: FileSystemDirectoryEntry }[] = [];
    let totalFilesToUpload = 0;

    try {
      // Compter d'abord tous les fichiers pour vérifier la limite
      for (const item of items) {
        if (item.kind === "file") {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isDirectory) {
              try {
                const dirEntry = entry as FileSystemDirectoryEntry;
                const folderFileCount = await countAllFilesInDirectory(dirEntry);
                totalFilesToUpload += folderFileCount;
                folderEntries.push({ name: entry.name, entry: dirEntry });
              } catch (error) {
                console.error("Erreur lors du comptage:", error);
                // Ajouter quand même le dossier
                folderEntries.push({ name: entry.name, entry: entry as FileSystemDirectoryEntry });
              }
            } else if (entry.isFile) {
              // Ignorer les fichiers - on ne peut que créer des dossiers dans la vue générale
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
      if (folderEntries.length > 0) {
        // Si totalFilesToUpload est 0, on va le mettre à jour dynamiquement
        setUploadProgress({ current: 0, total: totalFilesToUpload || 1, isUploading: true });
      }

      let uploadedFilesCounter = 0;
      let dynamicTotal = totalFilesToUpload || 1;
      
      const onFileUploaded = () => {
        uploadedFilesCounter++;
        // Mettre à jour le total si nécessaire
        if (uploadedFilesCounter > dynamicTotal) {
          dynamicTotal = uploadedFilesCounter;
        }
        setUploadProgress({ 
          current: uploadedFilesCounter, 
          total: dynamicTotal,
          isUploading: true 
        });
      };

      const folderPromises: Promise<void>[] = [];

      // Créer les dossiers et uploader leur contenu
      for (const { name, entry } of folderEntries) {
        folderPromises.push(
          createFolderAndUploadContent(name, null, entry, onFileUploaded).catch((error) => {
            console.error(`Erreur lors de la création du dossier "${name}":`, error);
            setErrorModal({
              isOpen: true,
              title: "Erreur",
              message: error.message || `Erreur lors de la création du dossier "${name}"`
            });
          })
        );
      }

      // Attendre que tous les dossiers soient créés
      if (folderPromises.length > 0) {
        await Promise.all(folderPromises);
        router.refresh();
      }
    } catch (error: any) {
      console.error("Erreur globale dans handleDrop:", error);
      setErrorModal({
        isOpen: true,
        title: "Erreur",
        message: error.message || "Erreur lors du dépôt des dossiers"
      });
    } finally {
      setUploadProgress({ current: 0, total: 0, isUploading: false });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-700 text-black min-h-screen select-none relative ${
        isDraggingOver ? "bg-brand-primary/5 border-2 border-dashed border-brand-primary rounded-2xl" : ""
      }`}
      onMouseDown={onMouseDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        // Ignorer le clic si on vient de terminer un lasso
        if (justFinishedLasso) {
          return;
        }
        
        // Clic sur fond vide → désélectionne tous les dossiers + ferme le menu de création
        const target = e.target as HTMLElement;
        if (
          !target.closest('button') &&
          !target.closest('a') &&
          !target.closest('[data-sortable-item="true"]') &&
          !target.closest('input') &&
          !target.closest('[data-folder-id]')
        ) {
          setSelectedIds([]);
          if (showCreateInput) {
            handleCancelGrouping();
          }
        }
      }}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-primary/10 backdrop-blur-sm rounded-2xl z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-brand-primary">
            <Folder className="w-12 h-12 text-brand-primary mx-auto mb-4" />
            <p className="text-lg font-semibold text-black text-center">Déposez vos dossiers ici</p>
            <p className="text-sm text-black/40 text-center mt-2">Seuls les dossiers seront créés</p>
          </div>
        </div>
      )}
      {uploadProgress.isUploading && uploadProgress.total > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-black/10 z-50 min-w-[280px] sm:min-w-[320px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
              <span className="text-sm font-semibold text-black">Upload en cours</span>
            </div>
            <span className="text-sm font-semibold text-black/60">
              {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden mb-2">
            <div 
              className="h-full bg-brand-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-black/40 text-center">
            {uploadProgress.current} / {uploadProgress.total} fichiers
          </p>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight">Mes dossiers</h1>
          <p className="text-black/40 text-sm sm:text-base font-medium">Organisez vos documents par simple glissement.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="flex items-center gap-1 sm:gap-2 bg-black text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/20 flex-1 sm:flex-initial"
              >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mr-2 sm:mr-4 border-r border-white/10 pr-2 sm:pr-4 whitespace-nowrap">{selectedIds.length} sélectionnés</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  {currentFilter !== "trash" && currentFilter !== "favorites" && currentFilter !== "shared" && (
                    <button onClick={handleStartGrouping} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                      <FolderPlus className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Grouper</span>
                    </button>
                  )}
                  <button onClick={handleBatchDelete} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-red-500/20 text-red-400 rounded-lg sm:rounded-xl transition-all text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
                <button onClick={() => setSelectedIds([])} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all ml-1 sm:ml-2">
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {currentFilter !== "trash" && currentFilter !== "favorites" && currentFilter !== "shared" && (
            <button 
              onClick={() => setShowCreateInput(true)}
              className="bg-black text-white flex items-center gap-2 sm:gap-3 shadow-xl shadow-black/10 h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:bg-black/90 transition-all font-semibold text-xs sm:text-sm flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="uppercase tracking-widest text-[9px] sm:text-[10px]">Nouveau dossier</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 max-w-md mb-6 sm:mb-8 lg:mb-12 group">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/20 group-focus-within:text-black transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un dossier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#f5f5f7] border-none rounded-xl sm:rounded-2xl text-sm sm:text-[14px] font-medium focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
        />
      </div>

      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
        {showCreateInput && (
          <div className="p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border-2 border-black ring-4 sm:ring-8 ring-black/5 animate-in zoom-in-95 duration-300 bg-white min-h-[180px] sm:min-h-[200px] flex flex-col justify-between shadow-2xl">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary mb-4 sm:mb-6">
              <FolderOpen className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </div>
            <input 
              autoFocus
              className="w-full text-base sm:text-[17px] font-medium bg-transparent outline-none border-b-2 border-black/10 focus:border-black transition-colors pb-2 sm:pb-3"
              placeholder={isGroupingMode ? "Nom du groupe..." : "Nom du dossier..."}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <div className="flex gap-4 sm:gap-6 mt-4 sm:mt-6">
              <button onClick={handleCreateFolder} className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest hover:underline">Confirmer</button>
              <button onClick={handleCancelGrouping} className="text-[10px] sm:text-[11px] font-bold text-black/30 uppercase tracking-widest hover:underline">Annuler</button>
            </div>
          </div>
        )}

        {filteredFolders.map((folder) => (
          <FolderItem 
            key={folder.id}
            folder={folder}
            isSelected={selectedIds.includes(folder.id)}
            currentFilter={currentFilter}
            onToggleSelect={(id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
            onShare={(id: string, name: string, e: any) => { setSelectedFolder({id, name}); setIsShareModalOpen(true); }}
            onTrash={(id: string, e: any) => { 
              const folder = filteredFolders.find(f => f.id === id);
              if (folder?.isShared) {
                // Dossier partagé : retirer l'accès
                setConfirmModal({
                  isOpen: true,
                  title: "Retirer l'accès ?",
                  message: "Ce dossier disparaîtra de votre vue. Le propriétaire conservera toujours l'accès.",
                  isDestructive: true,
                  onConfirm: async () => {
                    const { revokeSharedFolderAccessAction } = await import("@/lib/actions/sharing");
                    await revokeSharedFolderAccessAction(id);
                    setConfirmModal(p => ({...p, isOpen: false}));
                    router.refresh();
                  }
                });
              } else {
                // Dossier normal : mettre à la corbeille
                setConfirmModal({
                  isOpen: true,
                  title: "Mettre à la corbeille ?",
                  message: "Le dossier sera déplacé. Vous pourrez le restaurer plus tard.",
                  isDestructive: true,
                  onConfirm: () => moveToTrashAction(id, true).then(() => { setConfirmModal(p => ({...p, isOpen: false})); router.refresh(); })
                });
              }
            }}
            onRestore={(id: string, e: any) => {
              // moveToTrashAction gère automatiquement la restauration pour les dossiers partagés
              moveToTrashAction(id, false).then(() => router.refresh());
            }}
            onDeletePermanent={(id: string, e: any) => {
              setConfirmModal({
                isOpen: true,
                title: "Supprimer définitivement ?",
                message: "Cette action est irréversible.",
                isDestructive: true,
                onConfirm: () => deleteFolderAction(id).then(() => { setConfirmModal(p => ({...p, isOpen: false})); router.refresh(); })
              });
            }}
            onToggleFavorite={(id: string, curr: boolean, e: any) => toggleFavoriteAction(id, !curr).then(() => router.refresh())}
          />
        ))}
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        folderId={selectedFolder?.id || ""}
        folderName={selectedFolder?.name || ""} 
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadFiles([]);
        }}
        files={uploadFiles}
      />

      <AnimatePresence>
        {selectionBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none border-2 border-black bg-black/5 rounded-sm z-50"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.currentX),
              top: Math.min(selectionBox.startY, selectionBox.currentY),
              width: Math.abs(selectionBox.currentX - selectionBox.startX),
              height: Math.abs(selectionBox.currentY - selectionBox.startY),
            }}
          />
        )}
      </AnimatePresence>

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: "", message: "" })}
        title={errorModal.title}
        message={errorModal.message}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />

      {/* Modal pour la limite de fichiers */}
      {limitModal.isOpen && typeof document !== 'undefined' && createPortal(
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
