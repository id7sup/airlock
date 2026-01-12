"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ChevronDown, Check, Compass, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingPage() {
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
              <Link href="/pricing" className="text-white hover:text-white transition-colors underline underline-offset-4">
                Facturation
              </Link>
              <Link href="/security" className="text-white/70 hover:text-white transition-colors">
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

      <main className="relative pt-40 md:pt-60 pb-32 px-6 overflow-hidden">
        {/* Dégradé de ciel bleu clair */}
        <div className="hidden md:block absolute top-0 left-0 right-0 h-72 pointer-events-none overflow-hidden bg-gradient-to-b from-sky-100 via-blue-100/70 to-transparent" />
        
        {/* Mini nuages blancs */}
        <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
          {/* Nuage 1 - Haut gauche */}
          <div className="absolute top-[8%] left-[8%] w-24 h-14 bg-white/85 rounded-full blur-sm" />
          <div className="absolute top-[10%] left-[10%] w-20 h-12 bg-white/85 rounded-full blur-sm" />
          <div className="absolute top-[6%] left-[12%] w-22 h-13 bg-white/85 rounded-full blur-sm" />
          
          {/* Nuage 2 - Haut droit */}
          <div className="absolute top-[10%] right-[10%] w-22 h-13 bg-white/85 rounded-full blur-sm" />
          <div className="absolute top-[12%] right-[12%] w-20 h-11 bg-white/85 rounded-full blur-sm" />
          <div className="absolute top-[8%] right-[14%] w-18 h-12 bg-white/85 rounded-full blur-sm" />
          
          {/* Nuage 3 - Centre haut */}
          <div className="absolute top-[5%] left-[48%] w-20 h-12 bg-white/85 rounded-full blur-sm" />
          <div className="absolute top-[7%] left-[50%] w-18 h-10 bg-white/85 rounded-full blur-sm" />
          <div className="absolute top-[3%] left-[52%] w-16 h-11 bg-white/85 rounded-full blur-sm" />
        </div>

        {/* Montgolfières décoratives */}
        <div className="hidden md:block absolute inset-0 pointer-events-none">
          {/* Montgolfière 1 - Gauche-haut, rouge (grande) */}
          <div
            className="absolute left-[2%] md:left-[3%] top-[20%] md:top-[18%] w-12 h-12 md:w-18 md:h-18"
            style={{ transform: 'rotate(-2deg)' }}
          >
            <svg viewBox="0 0 512 512" className="w-full h-full" style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.08))' }}>
              <rect x="205.322" y="364.084" style={{fill:"#D4A574"}} width="31.347" height="59.099"/>
              <rect x="275.331" y="364.084" style={{fill:"#C89A6A"}} width="31.347" height="59.099"/>
              <rect x="190.412" y="407.51" style={{fill:"#D4B89A"}} width="131.176" height="104.49"/>
              <path style={{fill:"#EF4444"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H199.022l-72.296-145.021
                c-2.079-4.389-50.385-108.387-6.531-177.643c22.674-35.809,64.742-54.93,125.127-56.916C248.822,0.063,252.374,0,256,0
                c4.159,0,8.234,0.073,12.236,0.23c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <rect x="256" y="407.51" style={{fill:"#C89A6A"}} width="65.588" height="104.49"/>
              <path style={{fill:"#DC2626"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H256V0c4.159,0,8.234,0.073,12.236,0.23
                c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <path style={{fill:"#FFFFFF"}} d="M262.499,379.758h-12.988c-103.758-235.53-8.882-374-4.942-379.58C248.069,0.063,251.622,0,255.248,0
                H256c3.897,0.01,7.722,0.084,11.483,0.23C271.924,6.562,365.955,144.906,262.499,379.758z"/>
              <path style={{fill:"#C8C6CD"}} d="M262.499,379.758H256V0c3.897,0.01,7.722,0.084,11.483,0.23
                C271.924,6.562,365.955,144.906,262.499,379.758z"/>
            </svg>
          </div>

          {/* Montgolfière 3 - Droite-haut, verte (grande) */}
          <div
            className="absolute right-[2%] md:right-[3%] top-[22%] md:top-[20%] w-14 h-14 md:w-28 md:h-28"
          >
            <svg viewBox="0 0 512 512" className="w-full h-full" style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.08))' }}>
              <rect x="205.322" y="364.084" style={{fill:"#F4C2A5"}} width="31.347" height="59.099"/>
              <rect x="275.331" y="364.084" style={{fill:"#E8B896"}} width="31.347" height="59.099"/>
              <rect x="190.412" y="407.51" style={{fill:"#F9D5C0"}} width="131.176" height="104.49"/>
              <path style={{fill:"#FCD34D"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H199.022l-72.296-145.021
                c-2.079-4.389-50.385-108.387-6.531-177.643c22.674-35.809,64.742-54.93,125.127-56.916C248.822,0.063,252.374,0,256,0
                c4.159,0,8.234,0.073,12.236,0.23c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <rect x="256" y="407.51" style={{fill:"#E8B896"}} width="65.588" height="104.49"/>
              <path style={{fill:"#FBBF24"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H256V0c4.159,0,8.234,0.073,12.236,0.23
                c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <path style={{fill:"#FFFFFF"}} d="M262.499,379.758h-12.988c-103.758-235.53-8.882-374-4.942-379.58C248.069,0.063,251.622,0,255.248,0
                H256c3.897,0.01,7.722,0.084,11.483,0.23C271.924,6.562,365.955,144.906,262.499,379.758z"/>
              <path style={{fill:"#C8C6CD"}} d="M262.499,379.758H256V0c3.897,0.01,7.722,0.084,11.483,0.23
                C271.924,6.562,365.955,144.906,262.499,379.758z"/>
            </svg>
          </div>

          {/* Montgolfière 5 - Haut-centre, rose (petite) */}
          <div
            className="absolute left-[50%] -translate-x-1/2 top-[12%] md:top-[10%] w-10 h-10 md:w-16 md:h-16"
          >
            <svg viewBox="0 0 512 512" className="w-full h-full" style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.08))' }}>
              <rect x="205.322" y="364.084" style={{fill:"#A5D4C4"}} width="31.347" height="59.099"/>
              <rect x="275.331" y="364.084" style={{fill:"#8BC8B8"}} width="31.347" height="59.099"/>
              <rect x="190.412" y="407.51" style={{fill:"#B8E8D4"}} width="131.176" height="104.49"/>
              <path style={{fill:"#5EEAD4"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H199.022l-72.296-145.021
                c-2.079-4.389-50.385-108.387-6.531-177.643c22.674-35.809,64.742-54.93,125.127-56.916C248.822,0.063,252.374,0,256,0
                c4.159,0,8.234,0.073,12.236,0.23c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <rect x="256" y="407.51" style={{fill:"#8BC8B8"}} width="65.588" height="104.49"/>
              <path style={{fill:"#2DD4BF"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H256V0c4.159,0,8.234,0.073,12.236,0.23
                c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <path style={{fill:"#FFFFFF"}} d="M262.499,379.758h-12.988c-103.758-235.53-8.882-374-4.942-379.58C248.069,0.063,251.622,0,255.248,0
                H256c3.897,0.01,7.722,0.084,11.483,0.23C271.924,6.562,365.955,144.906,262.499,379.758z"/>
              <path style={{fill:"#C8C6CD"}} d="M262.499,379.758H256V0c3.897,0.01,7.722,0.084,11.483,0.23
                C271.924,6.562,365.955,144.906,262.499,379.758z"/>
            </svg>
          </div>

          {/* Montgolfière 6 - Haut-gauche, violette */}
          <div
            className="absolute left-[20%] md:left-[25%] top-[14%] md:top-[12%] w-14 h-14 md:w-28 md:h-28"
          >
            <svg viewBox="0 0 512 512" className="w-full h-full" style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.08))' }}>
              <rect x="205.322" y="364.084" style={{fill:"#B8A5D4"}} width="31.347" height="59.099"/>
              <rect x="275.331" y="364.084" style={{fill:"#A89AC8"}} width="31.347" height="59.099"/>
              <rect x="190.412" y="407.51" style={{fill:"#C5B8E8"}} width="131.176" height="104.49"/>
              <path style={{fill:"#A78BFA"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H199.022l-72.296-145.021
                c-2.079-4.389-50.385-108.387-6.531-177.643c22.674-35.809,64.742-54.93,125.127-56.916C248.822,0.063,252.374,0,256,0
                c4.159,0,8.234,0.073,12.236,0.23c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <rect x="256" y="407.51" style={{fill:"#A89AC8"}} width="65.588" height="104.49"/>
              <path style={{fill:"#8B5CF6"}} d="M385.275,234.736l-0.146,0.293l-72.15,144.729H256V0c4.159,0,8.234,0.073,12.236,0.23
                c59.549,2.257,101.083,21.358,123.57,56.863C435.66,126.349,387.354,230.348,385.275,234.736z"/>
              <path style={{fill:"#FFFFFF"}} d="M262.499,379.758h-12.988c-103.758-235.53-8.882-374-4.942-379.58C248.069,0.063,251.622,0,255.248,0
                H256c3.897,0.01,7.722,0.084,11.483,0.23C271.924,6.562,365.955,144.906,262.499,379.758z"/>
              <path style={{fill:"#C8C6CD"}} d="M262.499,379.758H256V0c3.897,0.01,7.722,0.084,11.483,0.23
                C271.924,6.562,365.955,144.906,262.499,379.758z"/>
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-1.5 bg-[#f5f5f7] rounded-full">
              <span className="text-[11px] font-semibold text-black/40 uppercase tracking-[0.2em]">Facturation</span>
            </div>
            <h1 className="text-5xl md:text-[88px] font-medium tracking-tight text-black leading-none">
              Simple et transparent.
            </h1>
            <p className="text-xl md:text-[24px] text-black/45 font-medium max-w-2xl mx-auto leading-relaxed">
              Une solution souveraine pour tous vos besoins de partage sécurisé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#f5f5f7] rounded-[48px] p-12 space-y-10 border border-black/[0.03]">
              <div className="space-y-4">
                <h3 className="text-2xl font-medium text-black">Individuel</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-medium">0€</span>
                  <span className="text-black/40 font-medium">/mois</span>
                </div>
                <p className="text-black/40 font-medium">Parfait pour commencer à partager en toute sécurité.</p>
              </div>
              
              <ul className="space-y-4 text-[17px] font-medium">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> 5 Go de stockage</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> Liens publics sécurisés</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> Mot de passe & Expiration</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> Analytics basiques</li>
              </ul>

              <Link href="/login" className="block w-full text-center py-4 bg-white rounded-2xl font-medium border border-black/5 hover:bg-black hover:text-white transition-all">
                Démarrer maintenant
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-black text-white rounded-[48px] p-12 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-medium">Professionnel</h3>
                  <span className="bg-[#96A982] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Bientôt</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-medium">9€</span>
                  <span className="text-white/40 font-medium">/mois</span>
                </div>
                <p className="text-white/40 font-medium">Pour les équipes exigeantes qui veulent plus de puissance.</p>
              </div>
              
              <ul className="space-y-4 text-[17px] font-medium">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> 100 Go de stockage</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> Analytics avancés</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> Révocation immédiate</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#96A982]" /> Support prioritaire</li>
              </ul>

              <button className="block w-full text-center py-4 bg-[#96A982] rounded-2xl font-medium hover:bg-[#B7C5A9] transition-all">
                Rejoindre la liste d'attente
              </button>
            </div>
          </div>
        </div>
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
