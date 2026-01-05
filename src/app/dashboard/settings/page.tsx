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
    <div className="p-10 max-w-5xl mx-auto text-black animate-in fade-in duration-700 select-none">
      <div className="mb-12">
        <h1 className="text-4xl font-medium tracking-tight">Paramètres</h1>
        <p className="text-black/40 text-base font-medium">Gérez votre identité et vos préférences de sécurité.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-16">
        {/* Navigation latérale */}
        <aside className="md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[15px] font-medium transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-black text-white shadow-xl shadow-black/20 scale-[1.02]" 
                  : "text-black/40 hover:bg-black/5 hover:text-black"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 space-y-10 pb-32">
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="bg-white rounded-[40px] p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-8">
                    <div className="relative w-24 h-24 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white ring-1 ring-black/5">
                      <img src={user.imageUrl} alt={user.fullName || ""} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-3xl font-medium tracking-tight text-black">{user.fullName}</h2>
                      <p className="text-[11px] font-bold text-black/20 uppercase tracking-[0.2em]">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openUserProfile()}
                    className="w-12 h-12 flex items-center justify-center bg-[#f5f5f7] hover:bg-black hover:text-white rounded-2xl transition-all"
                  >
                    <Settings2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-[#f5f5f7] rounded-[28px] border border-black/[0.01]">
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-2">Prénom</p>
                    <p className="text-lg font-medium text-black">{user.firstName || "Non renseigné"}</p>
                  </div>
                  <div className="p-6 bg-[#f5f5f7] rounded-[28px] border border-black/[0.01]">
                    <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-2">Nom</p>
                    <p className="text-lg font-medium text-black">{user.lastName || "Non renseigné"}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[40px] p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-brand-primary">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-black tracking-tight">Préférences régionales</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-[#f5f5f7] rounded-[28px]">
                    <span className="text-base font-medium text-black">Langue de l'interface</span>
                    <span className="text-[10px] font-bold text-black uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-full shadow-sm">Français</span>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-[#f5f5f7] rounded-[28px]">
                    <span className="text-base font-medium text-black">Fuseau horaire</span>
                    <span className="text-[11px] font-bold text-black/20 tracking-tighter">Europe/Paris (UTC+01:00)</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="bg-white rounded-[40px] p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-brand-primary">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-black tracking-tight">Sécurité du compte</h3>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => openUserProfile()}
                    className="w-full flex items-center justify-between p-6 bg-[#f5f5f7] hover:bg-white hover:shadow-2xl transition-all rounded-[32px] border border-transparent hover:border-black/5 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-base font-medium text-black">Double authentification</p>
                        <p className="text-[13px] text-black/30 font-medium">Protégez vos accès via 2FA.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-black/10 group-hover:text-black/40 transition-all" />
                  </button>

                  <button 
                    onClick={() => openUserProfile()}
                    className="w-full flex items-center justify-between p-6 bg-[#f5f5f7] hover:bg-white hover:shadow-2xl transition-all rounded-[32px] border border-transparent hover:border-black/5 group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                        <Lock className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-base font-medium text-black">Mot de passe</p>
                        <p className="text-[13px] text-black/30 font-medium">Dernière modification il y a 3 mois.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-black/10 group-hover:text-black/40 transition-all" />
                  </button>
                </div>
              </section>

              <section className="bg-red-50/20 rounded-[40px] p-10 border border-red-100/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-red-600 tracking-tight">Zone de danger</h3>
                </div>
                <p className="text-base text-red-600/60 font-medium mb-8 leading-relaxed max-w-lg">
                  La suppression de votre compte est irréversible. Toutes vos données et vos partages actifs seront instantanément détruits.
                </p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="px-8 py-4 bg-red-500 text-white rounded-2xl text-[13px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-red-200 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Supprimer mon compte Airlock
                </button>
              </section>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <section className="bg-white rounded-[40px] p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-brand-primary">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-black tracking-tight">Formule & Stockage</h3>
                </div>

                <div className="relative group mb-10">
                  <div className="p-10 bg-black rounded-[40px] text-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden relative">
                    <div className="flex items-center justify-between mb-12 relative z-10">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] opacity-40">Formule Gratuite</span>
                      <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] animate-pulse" />
                        Abonnement Actif
                      </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <p className="text-6xl font-medium tracking-tighter">5 Go <span className="text-lg font-medium opacity-40 uppercase tracking-[0.2em] ">Souverains</span></p>
                      <p className="text-base font-medium opacity-60 leading-relaxed max-w-md">Profitez d'un stockage chiffré de bout en bout <br /> sur vos propres serveurs.</p>
                    </div>
                    
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-black/5 rounded-full blur-[120px] -z-0" />
                  </div>
                </div>

                <div className="space-y-6">
                  <button className="bg-black text-white w-full h-16 rounded-[24px] shadow-2xl shadow-black/20 text-lg font-semibold hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-4 group">
                    Passer à l'offre Pro <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-all" />
                  </button>
                  <p className="text-center text-[11px] text-black/20 font-bold uppercase tracking-[0.3em]">
                    Aucun engagement. Annulable à tout moment.
                  </p>
                </div>
              </section>

              <section className="bg-white rounded-[40px] p-10 shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-brand-primary">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-medium text-black tracking-tight">Infrastructure</h3>
                </div>
                <div className="p-6 bg-[#f5f5f7] rounded-[32px] flex items-center justify-between border border-black/[0.01]">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                      <div className="w-6 h-6 bg-orange-500 rounded-lg shadow-inner shadow-black/10" /> 
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-base font-medium text-black">Cloudflare R2</p>
                      <p className="text-[11px] text-black/20 font-bold uppercase tracking-widest">Stockage de documents</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-black bg-white px-4 py-1.5 rounded-full border border-black/5 shadow-sm">CONNECTÉ</span>
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
