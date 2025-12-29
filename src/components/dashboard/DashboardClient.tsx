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
  Users
} from "lucide-react";
import { ShareModal } from "@/components/dashboard/ShareModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
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

  const itemClass = `p-6 transition-all duration-500 group relative bg-white h-full block rounded-2xl border border-black/[0.05] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-black/10 ${
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
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform duration-500">
              <FolderOpen className="w-6 h-6 fill-current" />
            </div>
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(folder.id, folder.isFavorite, e); }}
              className={`p-1.5 transition-all duration-300 group/star opacity-0 group-hover:opacity-100 ${
                folder.isFavorite ? "text-orange-400 scale-110 !opacity-100" : "text-black/10 hover:text-orange-400 hover:scale-110"
              }`}
            >
              <Star className={`w-4 h-4 transition-all ${folder.isFavorite ? "fill-current" : "group-hover/star:fill-current text-orange-400"}`} />
            </button>
          </div>
          
          <div className="flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            <div className="flex items-center gap-1">
              {!folder.isDeleted && !(folder as any).isPermissionHidden ? (
                <>
                  {!folder.isShared && (
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(folder.id, folder.name, e); }} 
                      className="p-2 text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTrash(folder.id, e); }} 
                    className="p-2 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {(folder.isDeleted || (folder as any).isPermissionHidden) && (
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRestore(folder.id, e); }} 
                      className="text-[10px] font-bold text-black px-3 py-1 bg-black/5 rounded-full hover:bg-black/10 transition-all text-nowrap"
                    >
                      Restaurer
                    </button>
                  )}
                  {folder.isDeleted && (
                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeletePermanent(folder.id, e); }} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
            {/* Badge partagé en dessous du bouton supprimer */}
            {folder.isShared && !folder.isDeleted && !(folder as any).isPermissionHidden && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-full">
                <Users className="w-3 h-3" />
                <span className="text-[10px] font-medium">Partagé</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="pointer-events-none space-y-2">
          <div>
            <h3 className="text-lg font-medium text-black truncate tracking-tight">{folder.name}</h3>
            {folder.isShared && folder.sharedBy && (
              <p className="text-xs text-black/40 font-medium mt-0.5">Partagé par {folder.sharedBy}</p>
            )}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-black/30 font-medium uppercase tracking-widest">{folder._count.files} fichiers</span>
              {folder.isShared && (
                <>
                  <span className="text-[10px] px-2 py-0.5 bg-black text-white rounded-full font-medium">
                    {folder.shareRole === "VIEWER" ? "Viewer" : "Editor"}
                  </span>
                  {folder.shareRole === "VIEWER" && !folder.shareCanDownload && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">
                      Download off
                    </span>
                  )}
                </>
              )}
            </div>
            <span className="text-[11px] text-black/30 font-medium uppercase tracking-widest" suppressHydrationWarning>
              {new Date(folder.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const gridRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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
      alert("Erreur lors de la création du dossier");
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
            alert("Erreur lors de la suppression définitive.");
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
            alert("Erreur lors de la suppression groupée.");
          }
        }
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="p-10 max-w-7xl mx-auto animate-in fade-in duration-700 text-black min-h-screen select-none relative"
      onMouseDown={onMouseDown}
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
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-medium tracking-tight">Mes dossiers</h1>
          <p className="text-black/40 text-base font-medium">Organisez vos documents par simple glissement.</p>
        </div>
        
        <div className="flex gap-4">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl shadow-2xl shadow-black/20"
              >
                <span className="text-[11px] font-bold uppercase tracking-widest mr-4 border-r border-white/10 pr-4">{selectedIds.length} sélectionnés</span>
                <div className="flex items-center gap-2">
                  {currentFilter !== "trash" && currentFilter !== "favorites" && currentFilter !== "shared" && (
                    <button onClick={handleStartGrouping} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest">
                      <FolderPlus className="w-4 h-4" /> Grouper
                    </button>
                  )}
                  <button onClick={handleBatchDelete} className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
                <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 rounded-xl transition-all ml-2">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {currentFilter !== "trash" && currentFilter !== "favorites" && currentFilter !== "shared" && (
            <button 
              onClick={() => setShowCreateInput(true)}
              className="bg-black text-white flex items-center gap-3 shadow-xl shadow-black/10 h-12 px-6 rounded-2xl hover:bg-black/90 transition-all font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="uppercase tracking-widest text-[10px]">Nouveau dossier</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 max-w-md mb-12 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-black transition-colors" />
        <input 
          type="text" 
          placeholder="Rechercher un dossier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#f5f5f7] border-none rounded-2xl text-[14px] font-medium focus:ring-2 focus:ring-black/5 focus:bg-white transition-all outline-none"
        />
      </div>

      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {showCreateInput && (
          <div className="p-8 rounded-[32px] border-2 border-black ring-8 ring-black/5 animate-in zoom-in-95 duration-300 bg-white min-h-[200px] flex flex-col justify-between shadow-2xl">
            <div className="w-14 h-14 bg-black/5 rounded-2xl flex items-center justify-center text-brand-primary mb-6">
              <FolderOpen className="w-7 h-7 fill-current" />
            </div>
            <input 
              autoFocus
              className="w-full text-[17px] font-medium bg-transparent outline-none border-b-2 border-black/10 focus:border-black transition-colors pb-3"
              placeholder={isGroupingMode ? "Nom du groupe..." : "Nom du dossier..."}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <div className="flex gap-6 mt-6">
              <button onClick={handleCreateFolder} className="text-[11px] font-bold text-black uppercase tracking-widest hover:underline">Confirmer</button>
              <button onClick={handleCancelGrouping} className="text-[11px] font-bold text-black/30 uppercase tracking-widest hover:underline">Annuler</button>
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
}
