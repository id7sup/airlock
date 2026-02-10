"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ChevronDown,
  Compass,
  ShieldCheck,
  Activity,
  Lock,
  Crown,
  Key,
  Database,
  Check,
  Shield,
  Eye,
  FileKey,
  Server,
  Globe,
  Fingerprint,
  Timer,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Footer } from "@/components/shared/Footer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityPage() {
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-black selection:text-white">
      {/* Dynamic Island Navbar */}
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
                className={`transition-colors flex items-center gap-1.5 py-2 ${isFeaturesHovered ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                Fonctionnalités <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-500 ${isFeaturesHovered ? 'rotate-180' : ''}`} />
              </button>
              <Link href="/cas-usage" className="text-white/70 hover:text-white transition-colors">
                Cas d&apos;usage
              </Link>
              <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">
                Facturation
              </Link>
              <Link href="/security" className="text-white hover:text-white transition-colors underline underline-offset-4">
                Sécurité
              </Link>
            </div>

            {/* Mobile Menu Button */}
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
                animate={{ height: 'auto', opacity: 1 }}
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
                  <Link href="/security" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-white transition-colors text-[13px] font-medium py-2 px-2 underline underline-offset-4">Sécurité</Link>
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
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden hidden md:block"
              >
                <div className="flex flex-row gap-2 py-4 mt-2 border-t border-white/5 w-full">
                  {[
                    { id: "workspace", title: "Workspace", desc: "Au geste.", icon: <Compass className="w-5 h-5" /> },
                    { id: "rules", title: "Règles", desc: "Contrôle.", icon: <ShieldCheck className="w-5 h-5" /> },
                    { id: "analytics", title: "Analytics", desc: "Live.", icon: <Activity className="w-5 h-5" /> }
                  ].map((feature) => (
                    <Link key={feature.id} href={`/#${feature.id}`} onClick={() => setIsFeaturesHovered(false)} className="group flex-1 flex flex-row items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 overflow-hidden">
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

      <main className="relative bg-white">
        {/* Hero Section - Split Layout like Ledgerly */}
        <section className="pt-32 md:pt-40 pb-16 md:pb-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Left Content */}
              <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex px-4 py-2 bg-[#96A982]/10 rounded-full"
                >
                  <span className="text-[12px] font-semibold text-[#96A982] uppercase tracking-wider">Sécurité de niveau entreprise</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-4xl md:text-[64px] font-medium tracking-tight text-black leading-[1.05]"
                >
                  Une <span className="text-[#96A982]">protection</span> pensée pour les professionnels.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-lg md:text-xl text-black/50 font-medium max-w-lg mx-auto lg:mx-0"
                >
                  Pas de promesses vagues. Voici exactement comment Airlock protège vos données à chaque étape du partage.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Link
                    href="/register"
                    className="bg-[#96A982] text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-[#86997a] transition-all shadow-lg shadow-[#96A982]/20"
                  >
                    Commencer gratuitement
                  </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="flex flex-wrap items-center gap-6 justify-center lg:justify-start pt-4"
                >
                  <div className="flex items-center gap-2 text-black/40">
                    <Check className="w-4 h-4 text-[#96A982]" />
                    <span className="text-sm font-medium">HTTPS/TLS 1.3</span>
                  </div>
                  <div className="flex items-center gap-2 text-black/40">
                    <Check className="w-4 h-4 text-[#96A982]" />
                    <span className="text-sm font-medium">Chiffrement au repos</span>
                  </div>
                  <div className="flex items-center gap-2 text-black/40">
                    <Check className="w-4 h-4 text-[#96A982]" />
                    <span className="text-sm font-medium">MFA disponible</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Content - Hero Image with Floating Elements */}
              <div className="lg:w-1/2 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative lg:overflow-visible"
                >
                  {/* Main Dashboard Image (oversized, cropped on the right) */}
                  <div className="relative rounded-[12px] overflow-hidden shadow-2xl shadow-black/10 border border-black/5 lg:w-[140%] lg:ml-auto">
                    <img
                      src="/assets/logsview.png"
                      alt="Airlock Security Dashboard"
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Floating Badge 1 - Logs en temps réel (côté gauche) */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="hidden lg:block absolute -left-6 md:-left-12 top-[54%] -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-4 shadow-2xl shadow-black/10 border border-black/10 z-20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#96A982]/10 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#96A982]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Logs en temps réel</p>
                        <p className="text-sm font-semibold text-black">Suivi des accès</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Badge 2 - Suivi des partages (en haut à droite) */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="hidden lg:block absolute right-2 md:right-10 -top-5 md:-top-9 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-4 shadow-2xl shadow-black/10 border border-black/10 z-20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#96A982]/10 rounded-xl flex items-center justify-center">
                        <Eye className="w-5 h-5 text-[#96A982]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Partages suivis</p>
                        <p className="text-sm font-semibold text-black">Vues & téléchargements</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Like Ledgerly "Where Finance Meets Automation" */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16 md:mb-20"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Sécurité à chaque couche.
              </h2>
              <p className="text-lg md:text-xl text-black/40 font-medium max-w-2xl mx-auto">
                Chaque interaction avec Airlock passe par plusieurs niveaux de protection.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
              {[
                {
                  icon: <Fingerprint className="w-6 h-6" />,
                  title: "Authentification Clerk",
                  desc: "MFA, OAuth Google, sessions sécurisées. Vos identifiants ne transitent jamais par nos serveurs."
                },
                {
                  icon: <Key className="w-6 h-6" />,
                  title: "Tokens chiffrés",
                  desc: "Chaque lien utilise un token 64-char haché SHA-256. Impossible à deviner ou reconstruire."
                },
                {
                  icon: <Crown className="w-6 h-6" />,
                  title: "Permissions granulaires",
                  desc: "Système Owner/Editor/Viewer avec isolation par workspace. Révocation instantanée."
                },
                {
                  icon: <Timer className="w-6 h-6" />,
                  title: "URLs signées temporaires",
                  desc: "Les URLs d'accès expirent automatiquement. Durée configurable de 5 min à 1 heure."
                },
                {
                  icon: <Server className="w-6 h-6" />,
                  title: "Chiffrement au repos",
                  desc: "Vos fichiers sont chiffrés sur les serveurs Cloudflare R2 avec redondance géographique."
                },
                {
                  icon: <Globe className="w-6 h-6" />,
                  title: "TLS 1.3 obligatoire",
                  desc: "Toutes les communications sont chiffrées en transit. Aucune exception."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group flex items-start gap-5"
                >
                  <div className="w-12 h-12 shrink-0 bg-[#96A982]/10 rounded-2xl flex items-center justify-center text-[#96A982] group-hover:bg-[#96A982] group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-black">{item.title}</h3>
                    <p className="text-[15px] text-black/50 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Box Section - Like Ledgerly "Everything You Need" */}
        <section className="py-24 md:py-32 px-6 bg-[#f8f8f8]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Tout ce qu'il faut pour sécuriser vos partages.
              </h2>
              <p className="text-lg md:text-xl text-black/40 font-medium max-w-2xl mx-auto">
                Une infrastructure robuste avec des contrôles précis.
              </p>
            </motion.div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Card - Authentication */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 bg-white rounded-[32px] p-8 md:p-10 border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="inline-block px-3 py-1 bg-[#96A982]/10 rounded-full">
                      <span className="text-[11px] font-bold text-[#96A982] uppercase tracking-wider">Authentification</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium text-black">
                      Contrôlez qui accède à vos fichiers.
                    </h3>
                    <p className="text-[16px] text-black/50 leading-relaxed">
                      Chaque partage peut exiger un mot de passe, être limité à un nombre de vues, ou expirer automatiquement. Vous gardez le contrôle total.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-4">
                      {["Mot de passe", "Quota de vues", "Expiration auto", "Révocation"].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-black/[0.03] rounded-full text-[13px] font-medium text-black/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-[280px] shrink-0">
                    <div className="bg-[#f5f5f7] rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/60">Protection</span>
                        <div className="w-10 h-5 bg-[#96A982] rounded-full relative">
                          <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                          <Lock className="w-4 h-4 text-[#96A982]" />
                          <span className="text-sm text-black/70">Mot de passe requis</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                          <Eye className="w-4 h-4 text-[#96A982]" />
                          <span className="text-sm text-black/70">5 vues maximum</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                          <Timer className="w-4 h-4 text-[#96A982]" />
                          <span className="text-sm text-black/70">Expire dans 7 jours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Small Card - Encryption */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-[32px] p-8 border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
              >
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#96A982] to-[#7a8a6d] rounded-2xl flex items-center justify-center">
                    <FileKey className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-black">Tokens SHA-256</h3>
                    <p className="text-[15px] text-black/50 leading-relaxed">
                      Chaque lien de partage utilise un token unique haché. Impossible à deviner.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-black/5">
                    <code className="text-xs text-black/40 font-mono break-all">
                      7f83b165...a3d5e8c1
                    </code>
                  </div>
                </div>
              </motion.div>

              {/* Small Card - Monitoring */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-[32px] p-8 border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all duration-500"
              >
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#96A982] to-[#7a8a6d] rounded-2xl flex items-center justify-center">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-medium text-black">Suivi en temps réel</h3>
                    <p className="text-[15px] text-black/50 leading-relaxed">
                      Visualisez chaque consultation et téléchargement de vos fichiers partagés.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-black/5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-black/50">12 accès cette semaine</span>
                  </div>
                </div>
              </motion.div>

              {/* Large Card - Infrastructure */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-2 bg-[#232323] rounded-[32px] p-8 md:p-10 text-white overflow-hidden relative"
              >
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="inline-block px-3 py-1 bg-white/10 rounded-full">
                      <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Infrastructure</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium">
                      Appuyé sur des géants.
                    </h3>
                    <p className="text-[16px] text-white/60 leading-relaxed">
                      Chaque brique de notre infrastructure repose sur des services éprouvés et certifiés. Pas de bricolage.
                    </p>
                  </div>
                  <div className="flex flex-wrap md:flex-col gap-4 w-full md:w-auto">
                    {[
                      { name: "Clerk", role: "Auth" },
                      { name: "Firebase", role: "Database" },
                      { name: "Cloudflare", role: "Storage" }
                    ].map((provider, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Database className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{provider.name}</p>
                          <p className="text-[11px] text-white/50">{provider.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Background decoration */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#96A982]/20 rounded-full blur-3xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3 Steps Section - Like Ledgerly "Connect in Three Simple Steps" */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Protection en trois étapes.
              </h2>
              <p className="text-lg md:text-xl text-black/40 font-medium max-w-2xl mx-auto">
                De l'upload au partage, chaque action est sécurisée.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: <Lock className="w-8 h-8" />,
                  title: "Upload sécurisé",
                  desc: "Vos fichiers sont uploadés directement vers le stockage chiffré via des URLs signées temporaires."
                },
                {
                  step: "02",
                  icon: <ShieldCheck className="w-8 h-8" />,
                  title: "Définissez vos règles",
                  desc: "Mot de passe, expiration, quota de vues, téléchargement autorisé ou non — vous décidez."
                },
                {
                  step: "03",
                  icon: <Eye className="w-8 h-8" />,
                  title: "Suivez les accès",
                  desc: "Chaque consultation et téléchargement est enregistré. Révoquez l'accès à tout moment."
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative bg-[#f8f8f8] rounded-[28px] p-8 hover:bg-[#f0f0f0] transition-all duration-300"
                >
                  <div className="absolute top-6 right-6 text-[48px] font-bold text-black/[0.03]">
                    {item.step}
                  </div>
                  <div className="space-y-5">
                    <div className="w-16 h-16 bg-[#96A982]/10 rounded-2xl flex items-center justify-center text-[#96A982]">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-black">{item.title}</h3>
                    <p className="text-[15px] text-black/50 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners/Infrastructure Section - Like Ledgerly Integrations */}
        <section className="py-24 md:py-32 px-6 bg-[#f8f8f8]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Nos partenaires de confiance.
              </h2>
              <p className="text-lg md:text-xl text-black/40 font-medium max-w-2xl mx-auto">
                Une infrastructure construite sur des leaders du marché.
              </p>
            </motion.div>

            {/* Logo Carousel/Wave */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
            >
              {[
                { name: "Clerk", logo: "/assets/logo/clerklogo.webp", desc: "Authentification" },
                { name: "Firebase", logo: "/assets/logo/Firebase_Logo.svg", desc: "Base de données" },
                { name: "Cloudflare", logo: "/assets/logo/Cloudflare_Logo.png", desc: "Stockage fichiers" }
              ].map((partner, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-black/5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 w-[180px]"
                >
                  <div className="h-12 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} Logo`}
                      className="h-10 object-contain opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-black">{partner.name}</p>
                    <p className="text-xs text-black/40">{partner.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* TLS Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-black/5 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#96A982]" />
                <span className="text-[15px] text-black/60 font-medium">
                  Toutes les communications chiffrées (HTTPS/TLS 1.3)
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - Like Ledgerly Final CTA */}
        <section className="py-24 md:py-32 px-6 bg-[#f8f8f8]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-[#232323] rounded-[40px] p-10 md:p-16 overflow-hidden relative">
                {/* Background decoration */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#96A982]/20 rounded-full blur-3xl" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#96A982]/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
                  <div className="flex-1 text-center lg:text-left space-y-6">
                    <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-white leading-tight">
                      Prêt à partager en toute confiance ?
                    </h2>
                    <p className="text-lg text-white/60 font-medium max-w-lg mx-auto lg:mx-0">
                      Commencez gratuitement avec 5 Go de stockage et toutes les fonctionnalités de sécurité incluses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                      <Link
                        href="/register"
                        className="bg-[#96A982] text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-[#86997a] transition-all"
                      >
                        Créer un compte gratuit
                      </Link>
                      <Link
                        href="/faq"
                        className="bg-white/10 text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-white/20 transition-all border border-white/10"
                      >
                        Questions fréquentes
                      </Link>
                    </div>
                  </div>

                  {/* Mini product preview */}
                  <div className="w-full lg:w-[300px] shrink-0">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#96A982]/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#96A982]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Airlock Free</p>
                            <p className="text-xs text-white/50">5 Go inclus</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {["Liens sécurisés illimités", "Mots de passe", "Expiration auto", "Analytics basiques"].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-[#96A982]" />
                              <span className="text-sm text-white/70">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer className="bg-[#f8f8f8]" />
    </div>
  );
}
