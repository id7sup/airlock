"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { 
  User, 
  Shield, 
  CreditCard, 
  Trash2, 
  ChevronRight, 
  Lock, 
  Smartphone,
  Globe,
  Database,
  ExternalLink,
  Settings2,
  ArrowUpRight
} from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { deleteAccountAction } from "@/lib/actions/account";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'billing'>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountAction();
      // Rediriger vers la page d'accueil après suppression
      router.push("/");
    } catch (error: any) {
      console.error("Erreur lors de la suppression du compte:", error);
      alert(`Erreur lors de la suppression du compte: ${error.message}`);
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'account', label: 'Sécurité', icon: Shield },
    { id: 'billing', label: 'Abonnement', icon: CreditCard },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto text-black animate-in fade-in duration-700 select-none -ml-2 sm:-ml-4 md:-ml-6">
      <div className="mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-black opacity-90">Paramètres</h1>
        <p className="text-black/40 text-sm sm:text-base font-medium mt-1 sm:mt-2">Gérez votre identité et vos préférences de sécurité.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-16">
        {/* Navigation latérale */}
        <aside className="w-full md:w-64 space-y-1 flex flex-row md:flex-col gap-2 md:gap-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 md:w-full flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-[15px] font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-black text-white shadow-xl shadow-black/20 scale-[1.02]" 
                  : "text-black/40 hover:bg-black/5 hover:text-black"
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 space-y-6 sm:space-y-8 md:space-y-10 pb-16 sm:pb-24 md:pb-32">
          {activeTab === 'profile' && (
            <div className="space-y-6 sm:space-y-8 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-6 md:p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 md:mb-12 gap-4 sm:gap-0">
                  <div className="flex items-center gap-4 sm:gap-6 md:gap-8 w-full sm:w-auto">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl md:rounded-[32px] overflow-hidden shadow-2xl border-2 sm:border-4 border-white ring-1 ring-black/5 flex-shrink-0">
                      <img src={user.imageUrl} alt={user.fullName || ""} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-black truncate opacity-90">{user.fullName}</h2>
                      <p className="text-[10px] sm:text-[11px] font-bold text-black/20 uppercase tracking-[0.2em] break-all sm:break-normal">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openUserProfile()}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#f5f5f7] hover:bg-black hover:text-white rounded-xl sm:rounded-2xl transition-all flex-shrink-0 self-end sm:self-auto"
                  >
                    <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 bg-[#f5f5f7] rounded-xl sm:rounded-2xl md:rounded-[28px] border border-black/[0.01]">
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-2">Prénom</p>
                    <p className="text-base sm:text-lg font-medium text-black">{user.firstName || "Non renseigné"}</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-[#f5f5f7] rounded-xl sm:rounded-2xl md:rounded-[28px] border border-black/[0.01]">
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-2">Nom</p>
                    <p className="text-base sm:text-lg font-medium text-black">{user.lastName || "Non renseigné"}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-6 md:p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary flex-shrink-0">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-black tracking-tight">Préférences régionales</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-[#f5f5f7] rounded-xl sm:rounded-2xl md:rounded-[28px] gap-2 sm:gap-0">
                    <span className="text-sm sm:text-base font-medium text-black">Langue de l'interface</span>
                    <span className="hidden lg:inline-block text-[10px] font-bold text-black uppercase tracking-[0.2em] bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">Français</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-[#f5f5f7] rounded-xl sm:rounded-2xl md:rounded-[28px] gap-2 sm:gap-0">
                    <span className="text-sm sm:text-base font-medium text-black">Fuseau horaire</span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-black/20 tracking-tighter text-right sm:text-left">Europe/Paris (UTC+01:00)</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6 sm:space-y-8 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-6 md:p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary flex-shrink-0">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-black tracking-tight">Sécurité du compte</h3>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <button 
                    onClick={() => openUserProfile()}
                    className="w-full flex items-center justify-between p-4 sm:p-6 bg-[#f5f5f7] hover:bg-white hover:shadow-2xl transition-all rounded-xl sm:rounded-2xl md:rounded-[32px] border border-transparent hover:border-black/5 group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0 flex-1">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-black">Double authentification</p>
                        <p className="text-xs sm:text-[13px] text-black/30 font-medium">Protégez vos accès via 2FA.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-black/10 group-hover:text-black/40 transition-all flex-shrink-0 ml-2" />
                  </button>

                  <button 
                    onClick={() => openUserProfile()}
                    className="w-full flex items-center justify-between p-4 sm:p-6 bg-[#f5f5f7] hover:bg-white hover:shadow-2xl transition-all rounded-xl sm:rounded-2xl md:rounded-[32px] border border-transparent hover:border-black/5 group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0 flex-1">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-black">Mot de passe</p>
                        <p className="text-xs sm:text-[13px] text-black/30 font-medium">Dernière modification il y a 3 mois.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-black/10 group-hover:text-black/40 transition-all flex-shrink-0 ml-2" />
                  </button>
                </div>
              </section>

              <section className="bg-red-50/20 rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-6 md:p-10 border border-red-100/50">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-red-500 flex-shrink-0">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-red-600 tracking-tight">Zone de danger</h3>
                </div>
                <p className="text-sm sm:text-base text-red-600/60 font-medium mb-6 sm:mb-8 leading-relaxed max-w-lg">
                  La suppression de votre compte est irréversible. Toutes vos données et vos partages actifs seront instantanément détruits.
                </p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-500 text-white rounded-xl sm:rounded-2xl text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Supprimer mon compte Airlock
                </button>
              </section>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6 sm:space-y-8 md:space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-6 md:p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary flex-shrink-0">
                    <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-black tracking-tight">Formule & Stockage</h3>
                </div>

                <div className="relative group mb-6 sm:mb-8 md:mb-10">
                  <div className="p-6 sm:p-8 md:p-10 bg-black rounded-2xl sm:rounded-3xl md:rounded-[40px] text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 md:mb-12 relative z-10 gap-3 sm:gap-0">
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.3em] opacity-40">Formule Gratuite</span>
                      <div className="hidden lg:flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] animate-pulse" />
                        Abonnement Actif
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 relative z-10">
                      <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter">5 Go <span className="text-sm sm:text-base md:text-lg font-medium opacity-40 uppercase tracking-[0.2em]">Souverains</span></p>
                      <p className="text-sm sm:text-base font-medium opacity-60 leading-relaxed max-w-md">Profitez d'un stockage chiffré de bout en bout <br className="hidden sm:block" /> sur vos propres serveurs.</p>
                    </div>
                    
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-black/5 rounded-full blur-[120px] -z-0" />
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <button className="bg-black text-white w-full h-12 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl md:rounded-[24px] shadow-2xl shadow-black/20 text-base sm:text-lg font-semibold hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-3 sm:gap-4 group">
                    Passer à l'offre Pro <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-all" />
                  </button>
                  <p className="text-center text-[10px] sm:text-[11px] text-black/20 font-bold uppercase tracking-[0.3em] px-2">
                    Aucun engagement. Annulable à tout moment.
                  </p>
                </div>
              </section>

              <section className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[40px] p-4 sm:p-6 md:p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-primary flex-shrink-0">
                    <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-black tracking-tight">Infrastructure</h3>
                </div>
                <div className="p-4 sm:p-6 bg-[#f5f5f7] rounded-xl sm:rounded-2xl md:rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between border border-black/[0.01] gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-5 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-lg shadow-inner shadow-black/10" /> 
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-black">Cloudflare R2</p>
                      <p className="hidden sm:block text-[10px] sm:text-[11px] text-black/20 font-bold uppercase tracking-widest">Stockage de documents</p>
                    </div>
                  </div>
                  <span className="hidden lg:inline-block text-[9px] sm:text-[10px] font-bold text-black bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-black/5 shadow-sm self-start sm:self-auto">CONNECTÉ</span>
                </div>
              </section>
            </div>
          )}

          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => !isDeleting && setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
            title="Supprimer définitivement votre compte"
            message="Cette action est irréversible. Toutes vos données, fichiers, dossiers et partages seront définitivement supprimés. Êtes-vous absolument certain de vouloir continuer ?"
            confirmText="Oui, supprimer mon compte"
            cancelText="Annuler"
            isDestructive={true}
            isLoading={isDeleting}
          />
        </main>
      </div>
    </div>
  );
}
