"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

interface ShareFolderPageLayoutProps {
  children: ReactNode;
  folderName: string;
  fileCount: number;
  folderCount?: number;
  backLink: string;
  showCTA?: boolean;
}

export function ShareFolderPageLayout({
  children,
  folderName,
  fileCount,
  folderCount = 0,
  backLink,
  showCTA = true,
}: ShareFolderPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      {/* Header - Style Dashboard */}
      <header className="h-16 lg:h-20 border-b border-black/[0.05] bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo className="w-8 h-8" />
          <span className="text-xl font-semibold tracking-tight text-black">Airlock</span>
        </Link>

        <Link
          href="/register"
          className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 transition-all shadow-md shadow-black/10"
        >
          Créer un compte
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-5 lg:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* CTA Banner - Compact et intégré */}
      {showCTA && (
        <div className="px-4 sm:px-5 lg:px-8 pb-4 max-w-5xl mx-auto w-full">
          <div className="p-3 lg:p-4 bg-white rounded-xl border border-black/[0.05]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-brand-primary" />
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-medium text-black truncate">Partagez vos fichiers en toute sécurité</p>
                </div>
                <p className="sm:hidden text-sm font-medium text-black">5 Go gratuits</p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/90 transition-all whitespace-nowrap flex-shrink-0"
              >
                <span className="hidden sm:inline">Créer un compte</span>
                <span className="sm:hidden">S'inscrire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer compact */}
      <footer className="border-t border-black/[0.05] bg-white/50 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-center sm:text-left text-xs text-black/30">
            <span>© {new Date().getFullYear()} Airlock</span>
            <div className="flex items-center gap-3">
              <Link href="/security" className="hover:text-black/60 transition-colors">Sécurité</Link>
              <Link href="/confidentialite" className="hover:text-black/60 transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
