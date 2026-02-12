import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { ChevronDown, Compass } from "lucide-react";

interface FooterProps {
  /** Classe optionnelle pour le fond du footer (ex: bg-white, bg-[#f8f8f8]) */
  className?: string;
}

export function Footer({ className = "bg-white" }: FooterProps) {
  return (
    <footer className={`px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#f5f5f7] rounded-t-2xl sm:rounded-t-[32px] md:rounded-t-[48px] p-6 sm:p-8 md:p-12 lg:p-24 border-x border-t border-black/[0.03] space-y-12 md:space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 md:gap-8">
            <div className="md:col-span-7 space-y-6 md:space-y-10 text-left">
              <div className="flex items-center gap-3 sm:gap-4">
                <Logo className="w-10 h-10 sm:w-12 sm:h-12" />
                <span className="text-2xl sm:text-3xl font-semibold tracking-tighter">Airlock</span>
              </div>
              <div className="space-y-4 sm:space-y-6 max-w-md">
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-black/80 leading-tight">
                  La nouvelle norme du partage de fichiers sécurisé et contrôlé.
                </p>
                <p className="text-base sm:text-lg text-black/40 font-medium">
                  Développé pour les équipes qui exigent un contrôle total sur leurs données.
                </p>
              </div>
            </div>
            <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:justify-items-end text-left">
              <div className="space-y-5 sm:space-y-8">
                <h4 className="text-xs sm:text-sm font-bold text-black uppercase tracking-[0.2em]">Produit</h4>
                <ul className="space-y-3 sm:space-y-5 text-[15px] sm:text-[17px] text-black/40 font-medium">
                  <li><Link href="/#workspace" className="hover:text-black transition-colors">Workspace</Link></li>
                  <li><Link href="/#rules" className="hover:text-black transition-colors">Partages</Link></li>
                  <li><Link href="/security" className="hover:text-black transition-colors">Sécurité</Link></li>
                  <li><Link href="/faq" className="hover:text-black transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div className="space-y-5 sm:space-y-8">
                <h4 className="text-xs sm:text-sm font-bold text-black uppercase tracking-[0.2em]">Solutions</h4>
                <ul className="space-y-3 sm:space-y-5 text-[15px] sm:text-[17px] text-black/40 font-medium">
                  <li><Link href="/data-room-virtuelle" className="hover:text-black transition-colors">Data Room</Link></li>
                  <li><Link href="/partage-dossier-securise" className="hover:text-black transition-colors">Partage Sécurisé</Link></li>
                  <li><Link href="/pour-avocats" className="hover:text-black transition-colors">Pour Avocats</Link></li>
                  <li><Link href="/alternative-google-drive-pro" className="hover:text-black transition-colors">Alternative Drive</Link></li>
                  <li><Link href="/cas-usage" className="hover:text-black transition-colors">Tous les cas d&apos;usage</Link></li>
                </ul>
              </div>
              <div className="space-y-5 sm:space-y-8 sm:col-span-2 md:col-span-1">
                <h4 className="text-xs sm:text-sm font-bold text-black uppercase tracking-[0.2em]">Légal</h4>
                <ul className="space-y-3 sm:space-y-5 text-[15px] sm:text-[17px] text-black/40 font-medium">
                  <li><Link href="/confidentialite" className="hover:text-black transition-colors">Confidentialité</Link></li>
                  <li><Link href="/mentions" className="hover:text-black transition-colors">Mentions</Link></li>
                  <li><Link href="/pricing" className="hover:text-black transition-colors">Facturation</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 sm:pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-10 text-center md:text-left">
            <div className="flex items-center gap-3 text-black/40 font-medium bg-white/50 px-4 py-2 rounded-full border border-black/[0.03]">
              <Compass className="w-4 h-4 text-[#96A982] shrink-0" />
              <span>Français</span>
              <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-black/40">
              <a href="https://linkedin.com/company/airlck" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors font-semibold">LinkedIn</a>
              <a href="https://twitter.com/airlck" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors font-semibold">X (Twitter)</a>
            </div>
            <p className="text-black/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em]">&copy; 2025 AIRLOCK TECHNOLOGIES</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
