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
  ArrowRight
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
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FolderView({ folder, fromFilter, parentId }: { folder: any, fromFilter?: string, parentId?: string | null }) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await createFolderAction(newFolderName, folder.id);
      setNewFolderName("");
      setShowCreateInput(false);
      router.refresh();
    } catch (error) {
      alert("Erreur lors de la création du sous-dossier");
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const droppedFiles = Array.from(e.target.files || []);
    if (droppedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const CONCURRENCY = 5;
      for (let i = 0; i < droppedFiles.length; i += CONCURRENCY) {
        const batch = droppedFiles.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(async (file) => {
          const { uploadUrl, s3Key } = await getPresignedUploadUrlAction({
            name: file.name,
            size: file.size,
            mimeType: file.type,
            folderId: folder.id,
          });

          await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || "application/octet-stream" },
          });

          await confirmFileUploadAction({
            name: file.name,
            size: file.size,
            mimeType: file.type,
            s3Key: s3Key,
            folderId: folder.id,
          });
        }));
      }
      router.refresh();
    } catch (error) {
      alert("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const url = await getFileDownloadUrlAction(fileId);
      window.open(url, "_blank");
    } catch (error) {
      alert("Erreur lors du téléchargement");
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
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto text-black animate-in fade-in duration-700 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link 
            href={parentId ? `/dashboard/folder/${parentId}${fromFilter ? `?from=${fromFilter}` : ''}` : (fromFilter ? `/dashboard?filter=${fromFilter}` : "/dashboard")} 
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/5 hover:bg-black/10 rounded-full transition-all text-black active:scale-90 flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight truncate">{folder.name}</h1>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold text-black/20 uppercase tracking-[0.2em]">
              <span>Dossier</span>
              <span>•</span>
              <span>{folder.files.length + folder.children.length} éléments</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 sm:gap-3 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl flex-1 sm:flex-initial"
              >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mr-1 sm:mr-2 whitespace-nowrap">{selectedIds.length} sélectionnés</span>
                <button onClick={handleBatchDelete} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors">
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button onClick={() => setSelectedIds([])} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors border-l border-white/10 pl-2 sm:pl-3">
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowCreateInput(true)}
            className="h-9 sm:h-11 px-3 sm:px-5 bg-white border border-black/10 rounded-lg sm:rounded-xl text-xs sm:text-[13px] font-semibold hover:bg-black/5 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm text-black flex-shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />
            <span className="hidden sm:inline">Nouveau sous-dossier</span>
            <span className="sm:hidden">Sous-dossier</span>
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="h-9 sm:h-11 px-3 sm:px-5 bg-white border border-black/10 rounded-lg sm:rounded-xl text-xs sm:text-[13px] font-semibold hover:bg-black/5 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm text-black flex-shrink-0"
          >
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-40" />
            <span className="hidden sm:inline">Partager</span>
            <span className="sm:hidden">Partager</span>
          </button>
          
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
            className="h-9 sm:h-11 px-4 sm:px-6 bg-black text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-[13px] disabled:opacity-50 shadow-lg shadow-black/10 hover:bg-black/90 transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            {isUploading ? "Envoi..." : "Ajouter"}
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.02] bg-[#fbfbfd]">
                <th className="w-16 px-8 py-5">
                  <button 
                    onClick={() => {
                      const allIds = [...folder.children.map((c: any) => c.id), ...folder.files.map((f: any) => f.id)];
                      setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
                    }}
                    className="text-black/20 hover:text-brand-primary transition-colors"
                  >
                    {selectedIds.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="px-4 py-5 text-[11px] font-bold text-black/20 uppercase tracking-[0.2em]">Nom</th>
                <th className="px-8 py-5 text-[11px] font-bold text-black/20 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-5 text-[11px] font-bold text-black/20 uppercase tracking-[0.2em]">Modifié</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.02]">
              {showCreateInput && (
                <tr className="bg-brand-primary/[0.02] animate-in slide-in-from-top-2 duration-300">
                  <td className="px-8 py-5" colSpan={5}>
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <input 
                        autoFocus
                        className="flex-1 bg-transparent border-b-2 border-brand-primary/10 outline-none text-lg font-medium py-2 focus:border-brand-primary transition-colors"
                        placeholder="Nom du sous-dossier..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                      />
                      <div className="flex gap-6">
                        <button 
                          onClick={handleCreateFolder}
                          disabled={isCreatingFolder}
                          className="text-[11px] font-bold text-black uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCreatingFolder && <RefreshCw className="w-3 h-3 animate-spin" />}
                          Confirmer
                        </button>
                        <button 
                          onClick={() => setShowCreateInput(false)}
                          className="text-[11px] font-bold text-black/30 uppercase tracking-widest hover:underline"
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
                  <td colSpan={5} className="px-8 py-24 text-center text-black/20 font-medium">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    Ce dossier est vide.
                  </td>
                </tr>
              )}

              {folder.children.map((child: any) => (
                <tr 
                  key={child.id} 
                  className={`hover:bg-[#fbfbfd] transition-colors group ${selectedIds.includes(child.id) ? 'bg-black/[0.02]' : ''}`}
                >
                  <td className="px-8 py-6">
                    <button onClick={() => toggleSelect(child.id)} className="text-black/10 hover:text-brand-primary transition-colors">
                      {selectedIds.includes(child.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5 opacity-0 group-hover:opacity-100" />}
                    </button>
                  </td>
                  <td className="px-4 py-6">
                    <Link href={`/dashboard/folder/${child.id}?from=${fromFilter || ''}&parent=${folder.id}`} className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-brand-primary/60 group-hover:bg-black/15 group-hover:text-brand-primary transition-all duration-500 group-hover:scale-110">
                        <FolderOpen className="w-6 h-6 fill-current" />
                      </div>
                      <span className="text-lg font-medium tracking-tight text-black">{child.name}</span>
                    </Link>
                  </td>
                  <td className="px-8 py-6 text-[12px] font-bold text-black/20 uppercase tracking-widest">
                    Dossier
                  </td>
                  <td className="px-8 py-6 text-[12px] font-bold text-black/40 tabular-nums" suppressHydrationWarning>
                    {new Date(child.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={(e) => handleDeleteSubFolder(child.id, e)}
                        className="p-3 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {folder.files.map((file: any) => (
                <tr 
                  key={file.id} 
                  className={`hover:bg-[#fbfbfd] transition-colors group ${selectedIds.includes(file.id) ? 'bg-black/[0.02]' : ''}`}
                >
                  <td className="px-8 py-6">
                    <button onClick={() => toggleSelect(file.id)} className="text-black/10 hover:text-brand-primary transition-colors">
                      {selectedIds.includes(file.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5 opacity-0 group-hover:opacity-100" />}
                    </button>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center text-brand-primary/60 group-hover:bg-black/15 group-hover:text-brand-primary transition-all duration-500 group-hover:scale-110">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-lg font-medium tracking-tight text-black">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[12px] font-bold text-black/20 tabular-nums uppercase tracking-widest">
                    {(file.size / 1024 / 1024).toFixed(2)} Mo
                  </td>
                  <td className="px-8 py-6 text-[12px] font-bold text-black/40 tabular-nums" suppressHydrationWarning>
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleDownload(file.id)}
                        className="p-3 bg-black/5 text-black/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="p-3 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Mobile List View */}
      <div className="lg:hidden space-y-2">
        {/* Select All Button */}
        <div className="flex items-center justify-between p-3 bg-[#fbfbfd] rounded-xl mb-2">
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

        {/* Create Input Mobile */}
        {showCreateInput && (
          <div className="p-4 bg-brand-primary/[0.02] rounded-xl border-2 border-brand-primary/10 animate-in slide-in-from-top-2 duration-300 mb-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0">
                <FolderOpen className="w-5 h-5" />
              </div>
              <input 
                autoFocus
                className="flex-1 bg-transparent border-b-2 border-brand-primary/10 outline-none text-base font-medium py-2 focus:border-brand-primary transition-colors"
                placeholder="Nom du sous-dossier..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
              <div className="flex gap-4 flex-shrink-0">
                <button 
                  onClick={handleCreateFolder}
                  disabled={isCreatingFolder}
                  className="text-[10px] font-bold text-black uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  {isCreatingFolder && <RefreshCw className="w-3 h-3 animate-spin" />}
                  OK
                </button>
                <button 
                  onClick={() => setShowCreateInput(false)}
                  className="text-[10px] font-bold text-black/30 uppercase tracking-widest hover:underline"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State Mobile */}
        {folder.children.length === 0 && folder.files.length === 0 && !showCreateInput && (
          <div className="p-12 text-center text-black/20 font-medium">
            <Folder className="w-10 h-10 mx-auto mb-3 opacity-10" />
            <p>Ce dossier est vide.</p>
          </div>
        )}

        {/* Folders Mobile */}
        {folder.children.map((child: any) => (
          <div 
            key={child.id} 
            className={`p-4 bg-white rounded-xl border border-black/[0.05] hover:bg-[#fbfbfd] transition-colors ${
              selectedIds.includes(child.id) ? 'bg-black/[0.02] ring-2 ring-black' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => toggleSelect(child.id)} className="text-black/10 hover:text-brand-primary transition-colors flex-shrink-0">
                {selectedIds.includes(child.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5" />}
              </button>
              <Link href={`/dashboard/folder/${child.id}?from=${fromFilter || ''}&parent=${folder.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-brand-primary/60 flex-shrink-0">
                  <FolderOpen className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium tracking-tight text-black truncate">{child.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Dossier</span>
                    <span className="text-[10px] text-black/30">•</span>
                    <span className="text-[10px] font-bold text-black/40 tabular-nums" suppressHydrationWarning>
                      {new Date(child.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
              <button 
                onClick={(e) => handleDeleteSubFolder(child.id, e)}
                className="p-2 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Files Mobile */}
        {folder.files.map((file: any) => (
          <div 
            key={file.id} 
            className={`p-4 bg-white rounded-xl border border-black/[0.05] hover:bg-[#fbfbfd] transition-colors ${
              selectedIds.includes(file.id) ? 'bg-black/[0.02] ring-2 ring-black' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => toggleSelect(file.id)} className="text-black/10 hover:text-brand-primary transition-colors flex-shrink-0">
                {selectedIds.includes(file.id) ? <CheckSquare className="w-5 h-5 text-brand-primary" /> : <Square className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-brand-primary/60 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium tracking-tight text-black truncate">{file.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-black/20 tabular-nums uppercase tracking-widest">
                      {(file.size / 1024 / 1024).toFixed(2)} Mo
                    </span>
                    <span className="text-[10px] text-black/30">•</span>
                    <span className="text-[10px] font-bold text-black/40 tabular-nums" suppressHydrationWarning>
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button 
                  onClick={() => handleDownload(file.id)}
                  className="p-2 bg-black/5 text-black/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDeleteFile(file.id, e)}
                  className="p-2 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
    </div>
  );
}
