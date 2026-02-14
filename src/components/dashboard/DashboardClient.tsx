"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  FolderOpen, 
  MoreVertical, 
  Plus, 
  Search, 
  ArrowUpRight, 
  Trash2, 
  Edit2, 
 
  Star,
  RefreshCw,
  Folder,
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
import {
  createFolderAction,
  deleteFolderAction,
  moveToTrashAction,
  toggleFavoriteAction,
  groupFoldersAction,
  renameFolderAction,
  updateFoldersOrderAction
} from "@/lib/actions/folders";
import { useUploadContext } from "@/components/dashboard/UploadProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


interface FolderType {
  id: string;
  name: string;
  isFavorite: boolean;
  isDeleted: boolean;
  order: number;
  parentId: string | null;
  _count: { files: number; children: number };
  updatedAt: string;
  createdAt: string;
  shareRole?: "VIEWER" | "EDITOR";
  shareCanDownload?: boolean;
  isShared?: boolean;
  sharedBy?: string;
  isPermissionHidden?: boolean;
}

// --- Sortable Folder Item (Drag & Drop Wrapper) ---
function SortableFolderItem(props: any) {
  const { folder, isDragging, ...rest } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isSortableDragging ? 1000 : 0,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <FolderItem
        folder={folder}
        isDragging={isSortableDragging}
        {...rest}
      />
    </div>
  );
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
  onRename,
  currentFilter,
  isDragging,
}: any) {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle renaming
  const handleRenameSave = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === folder.name) {
      setIsRenaming(false);
      setRenameValue(folder.name);
      return;
    }

    if (trimmed.length > 60) {
      setRenameValue(folder.name);
      return;
    }

    try {
      await renameFolderAction(folder.id, trimmed);
      onRename?.(folder.id, trimmed);
      setIsRenaming(false);
    } catch (error) {
      console.error("Erreur lors du renommage:", error);
      setRenameValue(folder.name);
      setIsRenaming(false);
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameValue(folder.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      handleRenameSave();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      handleRenameCancel();
    }
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuOpen(true);
  };

  const handleDotsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenuPosition({ x: rect.right, y: rect.bottom });
    setIsContextMenuOpen(true);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setIsContextMenuOpen(false);
      }
    };

    if (isContextMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isContextMenuOpen]);

  // Focus input when entering rename mode
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  // Handle F2 key for renaming
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2" && !isRenaming) {
        // Check if folder item is focused/hovered
        if ((document.activeElement as HTMLElement)?.closest('[data-folder-id="' + folder.id + '"]')) {
          e.preventDefault();
          setIsRenaming(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isRenaming, folder.id]);

  const itemClass = `p-4 sm:p-5 lg:p-6 transition-all duration-500 group relative bg-white h-full block rounded-xl sm:rounded-2xl border border-black/[0.05] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-black/10 ${
    isSelected ? "ring-2 ring-black shadow-xl" : "shadow-sm shadow-black/[0.01]"
  } ${isDragging ? "opacity-50" : ""}`;

  return (
    <div
      className="relative h-full select-none"
      data-folder-id={folder.id}
      onContextMenu={handleContextMenu}
      onClick={(e) => {
        // Si on est en train de renommer, ignorer les clics
        if (isRenaming) {
          e.stopPropagation();
          return;
        }

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
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!folder.isDeleted && !(folder as any).isPermissionHidden) {
          setIsRenaming(true);
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

          <div className="flex flex-col items-end gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 relative">
            <div className="flex items-center gap-1">
              {!folder.isDeleted && !(folder as any).isPermissionHidden ? (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleDotsClick}
                  className="p-1.5 sm:p-2 text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-colors"
                  title="Menu actions"
                >
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
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
            {/* Badge partagé en dessous du bouton menu */}
            {folder.isShared && !folder.isDeleted && !(folder as any).isPermissionHidden && (
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-brand-primary/10 text-brand-primary rounded-full">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="text-[9px] sm:text-[10px] font-medium">Partagé</span>
              </div>
            )}
          </div>
        </div>

        <div className={`space-y-1.5 sm:space-y-2 ${isRenaming ? "" : "pointer-events-none"}`}>
          <div>
            {isRenaming ? (
              <input
                ref={inputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleRenameSave}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                className="w-full text-base sm:text-lg font-medium bg-transparent outline-none border-b-2 border-brand-primary focus:border-brand-primary transition-colors pb-1 text-black"
                maxLength={60}
              />
            ) : (
              <h3 className="text-base sm:text-lg font-medium text-black truncate tracking-tight">{folder.name}</h3>
            )}
            {folder.isShared && folder.sharedBy && !isRenaming && (
              <p className="text-[10px] sm:text-xs text-black/40 font-medium mt-0.5 truncate">Partagé par {folder.sharedBy}</p>
            )}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] text-black/30 font-medium uppercase tracking-widest">{folder._count.files} fichiers</span>
              {folder.isShared && !isRenaming && (
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
            {!isRenaming && (
              <span className="text-[10px] sm:text-[11px] text-black/30 font-medium uppercase tracking-widest" suppressHydrationWarning>
                {new Date(folder.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu Portal */}
      {isContextMenuOpen && createPortal(
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-xl shadow-2xl border border-black/10 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!folder.isDeleted && !(folder as any).isPermissionHidden) {
                router.push(`/dashboard/folder/${folder.id}?from=${currentFilter}`);
              }
              setIsContextMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors text-left flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Ouvrir
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!folder.isDeleted && !(folder as any).isPermissionHidden) {
                setIsRenaming(true);
              }
              setIsContextMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors text-left flex items-center gap-2 border-t border-black/5"
          >
            <Edit2 className="w-4 h-4" />
            Renommer
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(folder.id, folder.isFavorite, e);
              setIsContextMenuOpen(false);
            }}
            className="w-full px-4 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors text-left flex items-center gap-2 border-t border-black/5"
          >
            <Star className={`w-4 h-4 ${folder.isFavorite ? "fill-current text-orange-400" : ""}`} />
            {folder.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          </button>
          {!folder.isDeleted && !(folder as any).isPermissionHidden && !folder.isShared && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare(folder.id, folder.name, e);
                setIsContextMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors text-left flex items-center gap-2 border-t border-black/5"
            >
              <ArrowUpRight className="w-4 h-4" />
              Partager
            </button>
          )}
          {!folder.isDeleted && !(folder as any).isPermissionHidden && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrash(folder.id, e);
                setIsContextMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left flex items-center gap-2 border-t border-black/5"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          )}
          {(folder.isDeleted || (folder as any).isPermissionHidden) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(folder.id, e);
                setIsContextMenuOpen(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-black hover:bg-black/5 transition-colors text-left flex items-center gap-2 border-t border-black/5"
            >
              <RefreshCw className="w-4 h-4" />
              Restaurer
            </button>
          )}
        </div>,
        document.body
      )}
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
  const { uploadFiles: contextUploadFiles, addFiles: contextAddFiles } = useUploadContext();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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
  const [dropToast, setDropToast] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({ isOpen: false, title: "", message: "" });
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

  // Filtrer par recherche et appliquer le tri selon la vue
  let filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !hiddenFolderIds.includes(folder.id) // Exclure les dossiers temporairement cachés
  );

  // Re-trier selon le currentFilter pour éviter que le drag-and-drop affecte l'ordre final
  if (currentFilter === "recent") {
    // Trier par date de mise à jour (plus récent en premier)
    filteredFolders = [...filteredFolders].sort((a, b) => {
      const getTime = (o: FolderType) => {
        const date = new Date(o.updatedAt);
        return date.getTime();
      };
      return getTime(b) - getTime(a);
    });
  } else if (currentFilter === "favorites") {
    // Les favoris peuvent être réordonnés, pas besoin de re-tri
  } else if (currentFilter === "trash") {
    // La corbeille peut être réordonnée, pas besoin de re-tri
  } else if (currentFilter === "shared") {
    // Les dossiers partagés peuvent être réordonnés, pas besoin de re-tri
  }
  // Pour "all" et undefined, garder l'ordre du drag-and-drop

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

  // Synchroniser les dossiers initiaux seulement si l'ensemble change (filtre/vue), pas pour l'ordre
  useEffect(() => {
    const initialIds = new Set(initialFolders.map(f => f.id));
    const currentIds = new Set(folders.map(f => f.id));

    // Si l'ensemble des dossiers a vraiment changé (IDs différents), réinitialiser
    // Cela évite de réinitialiser après un simple drag-drop qui fait revalidatePath
    const idsChanged = initialIds.size !== currentIds.size ||
      Array.from(initialIds).some(id => !currentIds.has(id));

    if (idsChanged) {
      setFolders(initialFolders);
    }
  }, [initialFolders]);

  // Auto-dismiss drop toast after 5s
  useEffect(() => {
    if (!dropToast.isOpen) return;
    const t = setTimeout(() => setDropToast(p => ({ ...p, isOpen: false })), 5000);
    return () => clearTimeout(t);
  }, [dropToast.isOpen]);

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
    parentFolderId: string | null,
    directoryEntry: FileSystemDirectoryEntry
  ): Promise<void> => {
    const newFolderId = await createFolderAction(folderName, parentFolderId);
    const { files, subFolders } = await readDirectoryEntries(directoryEntry);

    const uploadPromise = files.length > 0
      ? contextAddFiles(files, newFolderId)
      : Promise.resolve();

    const subFolderPromises = subFolders.map(subFolder =>
      createFolderAndUploadContent(subFolder.name, newFolderId, subFolder.entry)
    );

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

    // IMPORTANT: Capturer TOUS les entries de manière SYNCHRONE avant toute opération async
    // Les DataTransferItem deviennent invalides après le premier await
    const folderEntries: { name: string; entry: FileSystemDirectoryEntry }[] = [];
    let hasFileEntries = false;

    for (const item of items) {
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          if (entry.isDirectory) {
            folderEntries.push({ name: entry.name, entry: entry as FileSystemDirectoryEntry });
          } else {
            hasFileEntries = true;
          }
        }
      }
    }

    // Afficher une erreur si des fichiers sont déposés au niveau workspace
    if (hasFileEntries && folderEntries.length === 0) {
      setDropToast({
        isOpen: true,
        title: "Action impossible",
        message: "Impossible d'ajouter des fichiers dans le workspace. Déposez-les dans un dossier."
      });
      return;
    }

    if (hasFileEntries && folderEntries.length > 0) {
      setDropToast({
        isOpen: true,
        title: "Fichiers ignorés",
        message: "Les fichiers hors dossier ont été ignorés. Seuls les dossiers sont traités."
      });
    }

    let totalFilesToUpload = 0;

    try {
      // Compter les fichiers dans les dossiers (maintenant on peut faire des await)
      for (const { entry } of folderEntries) {
        try {
          const folderFileCount = await countAllFilesInDirectory(entry);
          totalFilesToUpload += folderFileCount;
        } catch (error) {
          console.error("Erreur lors du comptage:", error);
        }
      }

      // Vérifier la limite globale
      if (totalFilesToUpload > MAX_FILES_PER_UPLOAD) {
        setLimitModal({ isOpen: true, selectedCount: totalFilesToUpload });
        return;
      }

      const folderPromises: Promise<void>[] = [];

      // Créer les dossiers et uploader leur contenu
      for (const { name, entry } of folderEntries) {
        folderPromises.push(
          createFolderAndUploadContent(name, null, entry).catch((error) => {
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
    }
  };

  // Drag and Drop Configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Désactiver le drag-and-drop pour les vues autres que "all"
    // Le drag-and-drop est seulement autorisé pour la vue "Tous les dossiers"
    if (currentFilter && currentFilter !== "all") {
      return;
    }

    // Si l'élément n'a pas bougé ou qu'on drague hors d'une zone valide
    if (!over || active.id === over.id) {
      return;
    }

    // Trouver les indices dans la liste filtrée (pour l'affichage)
    const oldIndex = filteredFolders.findIndex(f => f.id === active.id);
    const newIndex = filteredFolders.findIndex(f => f.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Créer une copie de la liste filtrée reordonnée pour calculer les nouveaux ordres
    const reorderedFiltered = [...filteredFolders];
    const [movedFolder] = reorderedFiltered.splice(oldIndex, 1);
    reorderedFiltered.splice(newIndex, 0, movedFolder);

    // Mettre à jour l'état local immédiatement avec les nouveaux ordres
    const newFolders = folders.map((folder) => {
      const newOrderIndex = reorderedFiltered.findIndex(f => f.id === folder.id);
      return newOrderIndex !== -1
        ? { ...folder, order: newOrderIndex }
        : folder;
    });

    // Trier les dossiers par ordre pour avoir une liste cohérente
    const sortedFolders = [...newFolders].sort((a, b) => a.order - b.order);
    setFolders(sortedFolders);

    // Créer l'objet pour la mise à jour du serveur avec les vrais indices
    const folderOrders = reorderedFiltered.map((folder, index) => ({
      id: folder.id,
      order: index
    }));

    try {
      await updateFoldersOrderAction(folderOrders);
    } catch (error) {
      console.error("Erreur lors du réordonnement:", error);
      setFolders(folders); // Restaurer l'état précédent en cas d'erreur
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-black opacity-90">Mes dossiers</h1>
          <p className="text-black/40 text-sm sm:text-base font-medium">
            {currentFilter === "favorites" && "Gérez vos dossiers favoris en sélectionnant plusieurs éléments à la fois."}
            {currentFilter === "trash" && "Restaurez ou supprimez définitivement plusieurs dossiers en une seule action."}
            {currentFilter === "recent" && "Accédez rapidement à vos dossiers récemment modifiés et gérez-les par lot."}
            {currentFilter === "shared" && "Gérez les permissions et accès de plusieurs dossiers partagés simultanément."}
            {(currentFilter === "all" || !currentFilter) && "Sélectionnez plusieurs dossiers pour créer des groupes, partager ou organiser en masse."}
          </p>
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
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#f5f5f7] border-none rounded-xl sm:rounded-2xl text-sm sm:text-[14px] font-medium text-black focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none placeholder:text-black/40"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
          {showCreateInput && (
            <div className="p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border-2 border-black ring-4 sm:ring-8 ring-black/5 animate-in zoom-in-95 duration-300 bg-white min-h-[180px] sm:min-h-[200px] flex flex-col justify-between shadow-2xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary mb-4 sm:mb-6">
                <FolderOpen className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
              </div>
              <input
                autoFocus
                className="w-full text-base sm:text-[17px] font-medium bg-transparent outline-none border-b-2 border-black/10 focus:border-black transition-colors pb-2 sm:pb-3 text-black placeholder:text-black/40"
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

          <SortableContext items={filteredFolders.map(f => f.id)}>
            {filteredFolders.map((folder) => (
              <SortableFolderItem
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
                onRename={(id: string, newName: string) => setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f))}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        folderId={selectedFolder?.id || ""}
        folderName={selectedFolder?.name || ""} 
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
      {/* Toast bottom-right pour erreurs de drop */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {dropToast.isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-5 right-5 z-[10000] w-[360px] bg-white rounded-2xl shadow-2xl border border-black/[0.06] overflow-hidden"
            >
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-black">{dropToast.title}</p>
                  <p className="text-[11px] text-black/40 mt-0.5">{dropToast.message}</p>
                </div>
                <button
                  onClick={() => setDropToast(p => ({ ...p, isOpen: false }))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-black/5 rounded-lg transition-colors text-black/30 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

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
