"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ChevronDown,
  Compass,
  ShieldCheck,
  Activity,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SEONavbar() {
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full px-4 flex justify-center">
      <nav
        onMouseLeave={() => setIsFeaturesHovered(false)}
        className="bg-black text-white px-6 py-3 shadow-2xl border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-[32px] scale-90 md:scale-100 overflow-hidden w-full max-w-[620px]"
      >
        <div className="flex items-center justify-between h-10 w-full">
          <Link href="/" className="flex items-center shrink-0">
            <Logo className="w-7 h-7 brightness-0 invert" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[13px] font-medium tracking-tight">
            <button
              onMouseEnter={() => setIsFeaturesHovered(true)}
              className={`transition-colors flex items-center gap-1.5 py-2 ${isFeaturesHovered ? "text-white" : "text-white/70 hover:text-white"}`}
            >
              Fonctionnalités{" "}
              <ChevronDown
                className={`w-3 h-3 opacity-50 transition-transform duration-500 ${isFeaturesHovered ? "rotate-180" : ""}`}
              />
            </button>
            <Link href="/cas-usage" className="text-white/70 hover:text-white transition-colors">
              Cas d&apos;usage
            </Link>
            <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">
              Facturation
            </Link>
            <Link href="/security" className="text-white/70 hover:text-white transition-colors">
              Sécurité
            </Link>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden md:flex items-center gap-3 shrink-0">
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex flex-col gap-2 py-4 mt-2 border-t border-white/5">
                <Link href="/#workspace" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Workspace</Link>
                <Link href="/#rules" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Règles</Link>
                <Link href="/#analytics" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Analytics</Link>
                <Link href="/cas-usage" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Cas d&apos;usage</Link>
                <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Facturation</Link>
                <Link href="/security" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Sécurité</Link>
                <div className="pt-2 mt-2 border-t border-white/5 flex flex-col gap-2">
                  <SignedOut>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white text-[13px] font-medium py-2 px-2 text-left transition-colors w-full">Connexion</Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-white text-black text-[13px] font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-all w-full text-center">Inscription</Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white text-[13px] font-medium py-2 px-2 transition-colors">Dashboard</Link>
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Features Dropdown */}
        <AnimatePresence>
          {isFeaturesHovered && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden hidden md:block"
            >
              <div className="flex flex-row gap-2 py-4 mt-2 border-t border-white/5 w-full">
                {[
                  { id: "workspace", title: "Workspace", desc: "Au geste.", icon: <Compass className="w-5 h-5" /> },
                  { id: "rules", title: "Règles", desc: "Contrôle.", icon: <ShieldCheck className="w-5 h-5" /> },
                  { id: "analytics", title: "Analytics", desc: "Live.", icon: <Activity className="w-5 h-5" /> },
                ].map((feature) => (
                  <Link
                    key={feature.id}
                    href={`/#${feature.id}`}
                    onClick={() => setIsFeaturesHovered(false)}
                    className="group flex-1 flex flex-row items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 overflow-hidden"
                  >
                    <div className="w-9 h-9 shrink-0 bg-[#B7C5A9]/15 text-[#96A982] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
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
  );
}
