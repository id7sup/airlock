"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ChevronDown, Shield, Lock, Server, Cloud, Compass, ShieldCheck, Activity, Key, Eye, Clock, Network, Database } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityPage() {
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-black selection:text-white">
      {/* Dynamic Island Navbar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full px-4 flex justify-center">
        <nav 
          onMouseLeave={() => setIsFeaturesHovered(false)}
          className={`bg-black text-white px-6 py-3 shadow-2xl border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-[32px] scale-90 md:scale-100 overflow-hidden w-full max-w-[620px]`}
        >
          <div className="flex items-center justify-between h-10 w-full">
            <Link href="/" className="flex items-center shrink-0">
              <Logo className="w-7 h-7 brightness-0 invert" />
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-tight">
              <button 
                onMouseEnter={() => setIsFeaturesHovered(true)}
                className={`transition-colors flex items-center gap-1.5 py-2 ${isFeaturesHovered ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                Fonctionnalités <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-500 ${isFeaturesHovered ? 'rotate-180' : ''}`} />
              </button>
              <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">
                Facturation
              </Link>
              <Link href="/security" className="text-white hover:text-white transition-colors underline underline-offset-4">
                Sécurité
              </Link>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <SignedOut>
                <Link href="/login" className="text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 transition-colors">
                  Connexion
                </Link>
                <Link href="/register" className="bg-white text-black text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-all">
                  Inscription
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 transition-colors">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>

          <AnimatePresence>
            {isFeaturesHovered && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-row gap-2 py-4 mt-2 border-t border-white/5 w-full">
                  {[
                    { id: "workspace", title: "Workspace", desc: "Au geste.", icon: <Compass className="w-5 h-5" /> },
                    { id: "rules", title: "Règles", desc: "Contrôle.", icon: <ShieldCheck className="w-5 h-5" /> },
                    { id: "analytics", title: "Analytics", desc: "Live.", icon: <Activity className="w-5 h-5" /> }
                  ].map((feature) => (
                    <Link key={feature.id} href={`/#${feature.id}`} onClick={() => setIsFeaturesHovered(false)} className="group flex-1 flex flex-row items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 overflow-hidden">
                      <div className={`w-9 h-9 shrink-0 bg-[#B7C5A9]/15 text-[#96A982] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                        {feature.icon}
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <h4 className="text-[13px] font-medium text-white whitespace-nowrap">{feature.title}</h4>
                        <p className="text-[11px] text-white/30 font-medium whitespace-nowrap">{feature.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>

      <main>
        {/* Hero Section - Asymétrique */}
        <section className="pt-40 md:pt-60 pb-32 md:pb-48 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
              <div className="lg:w-2/5 space-y-8">
                <div className="inline-block px-4 py-1.5 bg-[#f5f5f7] rounded-full">
                  <span className="text-[11px] font-semibold text-black/40 uppercase tracking-[0.2em]">Sécurité</span>
                </div>
                <h1 className="text-5xl md:text-[72px] font-medium tracking-tight text-black leading-[1.05]">
                  Chiffré. <br />
                  Souverain. <br />
                  Sans compromis.
                </h1>
                <p className="text-xl md:text-[24px] text-black/45 font-medium leading-relaxed">
                  La sécurité n'est pas une option, c'est le cœur de notre architecture. Chaque composant est conçu pour protéger vos données.
                </p>
              </div>
              <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: <Lock className="w-8 h-8 text-[#96A982]" />, title: "Chiffrement", desc: "URLs présignées éphémères. Vos fichiers sont inaccessibles sans le token temporaire." },
                  { icon: <Server className="w-8 h-8 text-[#96A982]" />, title: "Souveraineté", desc: "Vos fichiers dans vos buckets Cloudflare R2 ou AWS S3. Contrôle total." },
                  { icon: <Shield className="w-8 h-8 text-[#96A982]" />, title: "Zero-Knowledge", desc: "Airlock ne peut jamais lire vos fichiers. Seul le détenteur du lien y a accès." },
                  { icon: <Key className="w-8 h-8 text-[#96A982]" />, title: "Tokens sécurisés", desc: "SHA-256 pour tous les tokens. Aucun secret stocké en clair." }
                ].map((item, i) => (
                  <div key={i} className="bg-[#f5f5f7] rounded-[32px] p-8 space-y-4 border border-black/[0.03] hover:border-black/[0.08] transition-all duration-300">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/5">
                      {item.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-medium text-black">{item.title}</h3>
                      <p className="text-[16px] text-black/40 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Flow Horizontal - Architecture */}
        <section className="py-24 md:py-40 px-6 bg-[#fbfbfd] border-t border-black/[0.02] overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-6 mb-16">
              <div className="inline-block px-4 py-1.5 bg-[#96A982]/10 rounded-full">
                <span className="text-[11px] font-bold text-[#96A982] uppercase tracking-[0.2em]">Architecture</span>
              </div>
              <h2 className="text-4xl md:text-[56px] font-medium tracking-tight text-black leading-[1.05]">Le parcours de vos données</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:gap-6 items-stretch">
              {[
                { icon: <Network className="w-7 h-7 text-[#96A982]" />, title: "Upload direct", desc: "URL présignée valable 5 minutes. Upload direct vers votre bucket sans transiter par nos serveurs.", step: "1" },
                { icon: <Database className="w-7 h-7 text-[#96A982]" />, title: "Stockage isolé", desc: "Fichiers dans votre bucket Cloudflare R2 ou AWS S3. Métadonnées minimales dans notre base.", step: "2" },
                { icon: <Key className="w-7 h-7 text-[#96A982]" />, title: "Partage contrôlé", desc: "Tokens hachés SHA-256, URLs éphémères, mots de passe optionnels. Accès tracé et révocable.", step: "3" }
              ].map((item, i) => (
                <div key={i} className="flex-1 bg-white rounded-[40px] p-10 space-y-6 border border-black/[0.04] relative">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 bg-[#B7C5A9]/10 rounded-[24px] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-bold text-black/5">{item.step}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-medium text-black">{item.title}</h3>
                    <p className="text-[17px] text-black/40 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6">
                      <div className="w-full h-0.5 bg-black/10" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Large Cards - Features détaillées */}
        <section className="py-32 md:py-56 px-6 bg-white">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="inline-block px-4 py-1.5 bg-[#f5f5f7] rounded-full">
                <span className="text-[12px] font-semibold text-black/40 uppercase tracking-[0.2em]">Protection Multi-Niveaux</span>
              </div>
              <h2 className="text-4xl md:text-[56px] font-medium tracking-tight text-black leading-[1.05]">Sécurité à chaque niveau</h2>
              <p className="text-xl md:text-[24px] text-black/45 leading-relaxed font-medium">De l'upload au partage, chaque étape est sécurisée.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                { icon: <Clock className="w-7 h-7 text-[#96A982]" />, title: "URLs présignées éphémères", desc: "Durée de vie limitée à 5 minutes pour upload et téléchargement. Sans ce token temporaire, les fichiers sont totalement inaccessibles sur le bucket, même avec l'URL directe." },
                { icon: <Eye className="w-7 h-7 text-[#96A982]" />, title: "Traçabilité complète", desc: "Chaque accès est enregistré en temps réel. Vous savez qui consulte vos fichiers, quand, et combien de fois. Analytics détaillés pour chaque partage." },
                { icon: <Database className="w-7 h-7 text-[#96A982]" />, title: "Métadonnées minimales", desc: "Seules les informations essentielles sont stockées. Nom, taille, type MIME. Le contenu des fichiers reste exclusivement dans votre bucket de stockage." },
                { icon: <Cloud className="w-7 h-7 text-[#96A982]" />, title: "Infrastructure Cloudflare", desc: "Protection DDoS, CDN mondial, SSL/TLS par défaut. Bénéficiez de l'infrastructure de classe entreprise de Cloudflare pour une disponibilité et une sécurité optimales." }
              ].map((item, i) => (
                <div key={i} className="group bg-[#f5f5f7] rounded-[40px] p-10 space-y-6 border border-black/[0.03] hover:border-black/[0.08] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-black/5 group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-medium text-black">{item.title}</h3>
                    <p className="text-[17px] text-black/40 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance - Layout vertical simple */}
        <section className="py-32 md:py-56 px-6 bg-[#fbfbfd] border-t border-black/[0.02]">
          <div className="max-w-5xl mx-auto space-y-20">
            <div className="text-center space-y-6">
              <div className="inline-block px-4 py-1.5 bg-[#96A982]/10 rounded-full">
                <span className="text-[11px] font-bold text-[#96A982] uppercase tracking-[0.2em]">Conformité</span>
              </div>
              <h2 className="text-4xl md:text-[56px] font-medium tracking-tight text-black leading-[1.05]">Standards & conformité</h2>
              <p className="text-xl md:text-[24px] text-black/45 leading-relaxed font-medium">Nous respectons les normes les plus strictes en matière de sécurité et de protection des données.</p>
            </div>
            <div className="space-y-6">
              {[
                { title: "Conformité RGPD", desc: "Droit à l'oubli, portabilité des données, et transparence totale. Vos données sont traitées conformément au Règlement Général sur la Protection des Données européen." },
                { title: "Souveraineté des données", desc: "Vos fichiers restent dans vos buckets. Vous choisissez la localisation (Cloudflare R2 ou AWS S3) et gardez le contrôle total de vos données." },
                { title: "Hachage cryptographique", desc: "SHA-256 pour tous les tokens et mots de passe. Standards cryptographiques modernes pour garantir l'intégrité et la confidentialité de vos secrets." },
                { title: "Infrastructure Cloudflare", desc: "Protection DDoS, réseau mondial de distribution de contenu, SSL/TLS par défaut. Bénéficiez de l'infrastructure de classe entreprise de Cloudflare." }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-[32px] p-8 md:p-10 border border-black/[0.04] hover:border-black/[0.08] transition-all duration-300">
                  <h3 className="text-2xl md:text-[28px] font-medium text-black mb-4">{item.title}</h3>
                  <p className="text-lg md:text-[19px] text-black/40 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Card (Stuck to bottom) */}
          <div className="bg-[#f5f5f7] rounded-t-[48px] p-12 md:p-24 border-x border-t border-black/[0.03] space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
              {/* Brand & Mission */}
              <div className="md:col-span-7 space-y-10 text-left">
                <div className="flex items-center gap-4"><Logo className="w-12 h-12" /><span className="text-3xl font-semibold tracking-tighter">Airlock</span></div>
                <div className="space-y-6 max-w-md">
                  <p className="text-2xl font-medium text-black/80 leading-tight">La nouvelle norme du partage de fichiers sécurisé et souverain.</p>
                  <p className="text-lg text-black/40 font-medium">Développé pour les équipes qui exigent un contrôle total sur leurs données.</p>
                </div>
              </div>

              {/* Links Grid */}
              <div className="md:col-span-5 grid grid-cols-2 gap-12 md:justify-items-end text-left">
                <div className="space-y-8">
                  <h4 className="text-sm font-bold text-black uppercase tracking-[0.2em]">Produit</h4>
                  <ul className="space-y-5 text-[17px] text-black/40 font-medium">
                    <li><Link href="/#workspace" className="hover:text-black transition-colors">Workspace</Link></li>
                    <li><Link href="/#rules" className="hover:text-black transition-colors">Partages</Link></li>
                    <li><Link href="/security" className="hover:text-black transition-colors">Sécurité</Link></li>
                    <li><Link href="/faq" className="hover:text-black transition-colors">FAQ</Link></li>
                  </ul>
                </div>
                <div className="space-y-8">
                  <h4 className="text-sm font-bold text-black uppercase tracking-[0.2em]">Légal</h4>
                  <ul className="space-y-5 text-[17px] text-black/40 font-medium">
                    <li><Link href="/confidentialite" className="hover:text-black transition-colors">Confidentialité</Link></li>
                    <li><Link href="/mentions" className="hover:text-black transition-colors">Mentions</Link></li>
                    <li><Link href="/pricing" className="hover:text-black transition-colors">Facturation</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Bar inside the Card */}
            <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-3 text-black/40 font-medium bg-white/50 px-4 py-2 rounded-full border border-black/[0.03]"><Compass className="w-4 h-4 text-[#96A982]" /><span>Français</span><ChevronDown className="w-3 h-3 opacity-50" /></div>
              <div className="flex items-center gap-8 text-black/40">
                <a href="https://linkedin.com/company/airlck" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors font-semibold">LinkedIn</a>
                <a href="https://twitter.com/airlck" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors font-semibold">𝕏 (Twitter)</a>
              </div>
              <p className="text-black/20 text-[11px] font-bold uppercase tracking-[0.4em]">© 2025 AIRLOCK TECHNOLOGIES</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
