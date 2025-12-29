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

export default function FolderView({ folder, fromFilter }: { folder: any, fromFilter?: string }) {
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
    <div className="p-10 max-w-7xl mx-auto text-black animate-in fade-in duration-700 select-none">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link 
            href={fromFilter ? `/dashboard?filter=${fromFilter}` : "/dashboard"} 
            className="w-12 h-12 flex items-center justify-center bg-black/5 hover:bg-black/10 rounded-full transition-all text-black active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-medium tracking-tight">{folder.name}</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-black/20 uppercase tracking-[0.2em] mt-0.5">
              <span>Dossier</span>
              <span>•</span>
              <span>{folder.files.length + folder.children.length} éléments</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-2xl shadow-xl"
              >
                <span className="text-[11px] font-bold uppercase tracking-widest mr-2">{selectedIds.length} sélectionnés</span>
                <button onClick={handleBatchDelete} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 rounded-xl transition-colors border-l border-white/10 pl-3">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowCreateInput(true)}
            className="h-11 px-5 bg-white border border-black/10 rounded-xl text-[13px] font-semibold hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm text-black"
          >
            <PlusCircle className="w-4 h-4 opacity-40" />
            Nouveau sous-dossier
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="h-11 px-5 bg-white border border-black/10 rounded-xl text-[13px] font-semibold hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm text-black"
          >
            <ArrowUpRight className="w-4 h-4 opacity-40" />
            Partager
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
            className="h-11 px-6 bg-black text-white rounded-xl font-semibold text-[13px] disabled:opacity-50 shadow-lg shadow-black/10 hover:bg-black/90 transition-all flex items-center gap-2"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Envoi..." : "Ajouter"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/5">
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
                    <Link href={`/dashboard/folder/${child.id}?from=${fromFilter || ''}`} className="flex items-center gap-5">
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
