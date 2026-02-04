"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Shield, Lock, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

interface SharePageLayoutProps {
  children: ReactNode;
  folderName: string;
  fileCount: number;
  folderCount?: number;
  showCTA?: boolean;
}

export function SharePageLayout({
  children,
  folderName,
  fileCount,
  folderCount = 0,
  showCTA = true,
}: SharePageLayoutProps) {
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
          <div className="flex items-center justify-between text-xs text-black/30">
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

/**
 * Error state - Style Dashboard
 */
export function SharePageError({
  title,
  message,
  icon: Icon = Shield,
}: {
  title: string;
  message: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      {/* Header */}
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
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="p-12 text-center text-black">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Icon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2 tracking-tight">{title}</h1>
          <p className="text-black/40 mb-8 font-medium">{message}</p>
          <Link 
            href="/register" 
            className="bg-black text-white px-8 py-3 rounded-2xl font-semibold hover:bg-black/90 transition-all shadow-xl shadow-black/10 inline-flex items-center gap-2 text-sm"
          >
            Créer un compte gratuit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer compact */}
      <footer className="border-t border-black/[0.05] bg-white/50 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center justify-between text-xs text-black/30">
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

/**
 * Password form - Style Dashboard
 */
export function SharePasswordForm({
  token,
  error,
}: {
  token: string;
  error?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      {/* Header */}
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
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="p-8 bg-white rounded-2xl border border-black/[0.05] shadow-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-5 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-brand-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-black tracking-tight mb-1">Dossier protégé</h1>
              <p className="text-sm text-black/40">Ce partage nécessite un mot de passe</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm font-medium text-red-600 text-center">Mot de passe incorrect</p>
              </div>
            )}

            <form action={`/share/${token}`} method="get" className="space-y-4">
              <input
                id="pwd"
                name="pwd"
                type="password"
                placeholder="Entrez le mot de passe"
                className="w-full px-4 py-3 bg-black/[0.03] border border-black/[0.08] rounded-xl text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/30 transition-all"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-black/90 transition-all shadow-md shadow-black/10"
              >
                Accéder au dossier
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer compact */}
      <footer className="border-t border-black/[0.05] bg-white/50 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-3">
          <div className="flex items-center justify-between text-xs text-black/30">
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
