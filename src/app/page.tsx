"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ChevronDown, Compass, Search, MousePointer2, Layers, Database, Zap, LayoutDashboard, Activity, Timer, BarChart3, History, Power, ArrowRight, Lock, Eye, Download, ShieldCheck, RefreshCw, Menu, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useEffect, useState, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { StructuredData } from "@/components/shared/StructuredData";
import { homeFaqStructuredData } from "@/lib/structured-data";

const generateData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: Math.floor(Math.random() * 50) + 30,
  }));
};

const ProcessAnimation = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: "Déposez vos fichiers", sub: "Le glisser-déposer intuitif." },
    { title: "Chiffrement sécurisé", sub: "Vos données sont isolées et protégées." },
    { title: "Génération du lien", sub: "Instantané et prêt à être partagé." },
    { title: "Contrôle des accès", sub: "Définissez vos propres règles." }
  ];

  return (
    <div className="w-full max-w-3xl relative flex flex-col items-center">
      <div className="h-16 mb-4 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-1"
          >
            <h3 className="text-xl md:text-2xl font-medium text-black tracking-tight">{steps[step].title}</h3>
            <p className="text-base md:text-lg text-black/30 font-medium">{steps[step].sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full h-[280px] relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#96A982]/5 to-transparent blur-[60px] opacity-40" />
        
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(15px)" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative"
            >
              <motion.div 
                animate={{ y: [0, -15, 0], rotate: [0, -2, 2, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-32 h-44 bg-white rounded-[32px] flex items-center justify-center text-[#96A982] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-black/[0.03]"
              >
                <Download className="w-12 h-12 rotate-180" />
              </motion.div>
              <div className="absolute -z-10 top-3 left-3 w-28 h-36 bg-black/[0.02] rounded-[28px] border border-black/[0.03] shadow-sm" />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(15px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              className="relative w-40 h-40 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[#96A982]/5 rounded-full animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-[#96A982]/20 rounded-[48px]"
              />
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="w-20 h-20 bg-[#96A982] rounded-[24px] flex items-center justify-center text-white shadow-2xl relative z-10"
              >
                <Layers className="w-10 h-10" />
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -50, filter: "blur(15px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 50, filter: "blur(15px)" }}
              className="w-full max-w-md px-6"
            >
              <div className="bg-white p-8 rounded-[32px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)] border border-black/[0.03] space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#B7C5A9]/20 rounded-full flex items-center justify-center text-[#96A982]">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-black/30 uppercase tracking-[0.2em]">Upload...</span>
                  </div>
                  <span className="text-sm font-bold text-[#96A982]">100%</span>
                </div>
                <div className="h-2.5 bg-black/[0.03] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-[#B7C5A9] to-[#96A982]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(15px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(15px)" }}
              className="grid grid-cols-3 gap-6"
            >
              {[
                { icon: <Eye className="w-7 h-7" />, label: "Lecture" },
                { icon: <Lock className="w-7 h-7" />, label: "Pass" },
                { icon: <Timer className="w-7 h-7" />, label: "Expire" }
              ].map((ctrl, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, type: "spring" }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-white rounded-[24px] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#96A982] border border-black/[0.03] transition-all hover:scale-110">
                    {ctrl.icon}
                  </div>
                  <span className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">{ctrl.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex gap-3 p-2 bg-black/[0.02] rounded-full border border-black/[0.02]">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
              step === i ? "w-10 bg-[#96A982]" : "bg-black/10 hover:bg-black/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [chartData, setChartData] = useState(generateData());
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1), { 
          time: prev[prev.length - 1].time + 1, 
          value: Math.floor(Math.random() * 50) + 30 
        }];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <StructuredData />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeFaqStructuredData),
        }}
      />
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
            
            {/* Desktop Navigation */}
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
              <Link href="/security" className="text-white/70 hover:text-white transition-colors">
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
                <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 transition-colors">
                    Connexion
                  </button>
                </SignInButton>
                <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                  <button className="bg-white text-black text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-all">
                    Inscription
                  </button>
                </SignUpButton>
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
                  <Link 
                    href="/#workspace" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2"
                  >
                    Workspace
                  </Link>
                  <Link 
                    href="/#rules" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2"
                  >
                    Règles
                  </Link>
                  <Link 
                    href="/#analytics" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2"
                  >
                    Analytics
                  </Link>
                  <Link 
                    href="/pricing" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2"
                  >
                    Facturation
                  </Link>
                  <Link 
                    href="/security" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2"
                  >
                    Sécurité
                  </Link>
                  <div className="pt-2 mt-2 border-t border-white/5 flex flex-col gap-2">
                    <SignedOut>
                      <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                        <button 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-white/70 hover:text-white text-[13px] font-medium py-2 px-2 text-left transition-colors w-full"
                        >
                          Connexion
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                        <button 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="bg-white text-black text-[13px] font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-all w-full text-center"
                        >
                          Inscription
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white/70 hover:text-white text-[13px] font-medium py-2 px-2 transition-colors"
                      >
                        Dashboard
                      </Link>
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
        {/* Hero Section */}
        <section className="pt-40 md:pt-60 pb-20 md:pb-32 px-6 text-center">
          <div className="max-w-5xl mx-auto space-y-10 md:space-y-14">
            <div className="space-y-6 md:space-y-8">
              <h1 className="font-medium tracking-tight text-[#1d1d1f] flex flex-col items-center gap-2 md:gap-3">
                <span className="text-5xl md:text-[88px] leading-none">Partagez des dossiers.</span>
                <span className="text-4xl md:text-[76px] leading-none opacity-90">Gardez le contrôle.</span>
              </h1>
              <p className="text-lg md:text-[22px] text-black/45 font-medium max-w-2xl mx-auto leading-relaxed px-4">
                Liens expirables, lecture seule, mot de passe, quota de vues. <br className="hidden md:block" /> Une data room simple, sécurisée et souveraine.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard" className="bg-[#96A982] text-white px-8 md:px-10 py-4 md:py-4.5 rounded-[22px] font-medium text-[17px] hover:opacity-90 transition-all shadow-xl shadow-[#96A982]/20 w-full sm:w-auto min-w-[220px]">
                  Démarrer gratuitement
                </Link>
                <Link href="#demo" className="bg-[#f5f5f7] text-[#1d1d1f] px-8 md:px-10 py-4 md:py-4.5 rounded-[22px] font-medium text-[17px] hover:bg-[#e8e8ed] transition-all w-full sm:w-auto min-w-[220px]">
                  Découvrir
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="relative w-full h-[92vh] flex items-center justify-center overflow-hidden select-none">
          <img src="/assets/background.jpg" alt="Airlock - Interface de partage de fichiers sécurisé en arrière-plan" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            className="relative z-10 w-[88%] md:w-[72%] max-w-6xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[8px] md:rounded-[24px] overflow-hidden border border-white/10"
          >
            <img src="/assets/dashboard.png" alt="Airlock Dashboard - Interface de gestion de fichiers avec workspace, dossiers et navigation intuitive" className="w-full h-auto pointer-events-none select-none" loading="lazy" />
          </motion.div>
        </section>

        <section id="workspace" className="py-32 md:py-56 px-6 bg-white">
          <div className="max-w-6xl mx-auto space-y-32 md:space-y-48">
            <div className="text-center space-y-10">
              <div className="inline-block px-4 py-1.5 bg-[#f5f5f7] rounded-full">
                <span className="text-[12px] font-semibold text-black/40 uppercase tracking-[0.2em]">Workspace</span>
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl md:text-[68px] font-medium tracking-tight text-black leading-[1.05]">Un espace de travail <br className="hidden md:block" /> qui se pilote au geste.</h2>
                <p className="text-2xl md:text-[38px] font-medium tracking-tight text-black/20 leading-[1.15] max-w-5xl mx-auto">Crée, range et retrouve tes dossiers en quelques secondes. Tout est pensé pour une sensation “desktop” : glisser-déposer, sélection multiple, recherche instantanée.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-20 gap-y-24 md:gap-y-32">
              {[
                { icon: <Compass className="w-6 h-6 text-[#96A982]" />, title: "Navigation claire", desc: "Tous les dossiers, Récents, Favoris, Corbeille." },
                { icon: <Search className="w-6 h-6 text-[#96A982]" />, title: "Recherche instantanée", desc: "filtre en temps réel, sans rechargement." },
                { icon: <MousePointer2 className="w-6 h-6 text-[#96A982]" />, title: "Rangement intelligent", desc: "glisse un dossier sur un autre pour le ranger." },
                { icon: <Layers className="w-6 h-6 text-[#96A982]" />, title: "Ordre personnalisé", desc: "réorganise librement, l’ordre est mémorisé." },
                { icon: <Database className="w-6 h-6 text-[#96A982]" />, title: "Quota visible", desc: "ton stockage est toujours sous contrôle (5 Go / espace)." },
                { icon: <Zap className="w-6 h-6 text-[#96A982]" />, title: "Activité en direct", desc: "notifications quand un partage est consulté / téléchargé." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-7">
                  <div className="w-16 h-16 bg-[#B7C5A9]/15 rounded-[22px] flex items-center justify-center">{item.icon}</div>
                  <div className="space-y-3">
                    <h3 className="text-[22px] font-medium text-black tracking-tight">{item.title}</h3>
                    <p className="text-[17px] text-black/40 leading-relaxed font-medium max-w-[280px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative w-full h-[92vh] flex items-center justify-center overflow-hidden select-none bg-white">
          <img src="/assets/backgroundtwo.jpg" alt="Airlock - Règles de partage et contrôle d'accès en arrière-plan" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            className="relative z-10 w-[88%] md:w-[72%] max-w-5xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[8px] md:rounded-[24px] overflow-hidden border border-white/10"
          >
            <img src="/assets/dashboardtwo.png" alt="Airlock Règles de Partage - Configuration des paramètres de sécurité : mot de passe, expiration, quota de vues" className="w-full h-auto pointer-events-none select-none" loading="lazy" />
          </motion.div>
        </section>

        <section id="rules" className="bg-[#fbfbfd] py-32 md:py-64 px-6 overflow-hidden border-t border-black/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-24 lg:gap-40">
              <div className="lg:w-[42%] lg:sticky lg:top-48 space-y-10">
                <div className="inline-block px-4 py-1.5 bg-[#96A982]/10 rounded-full">
                  <span className="text-[11px] font-bold text-[#96A982] uppercase tracking-[0.2em]">Règles de Partage</span>
                </div>
                <div className="space-y-8">
                  <h2 className="text-5xl md:text-[64px] font-medium tracking-tight text-black leading-[1.05]">Un partage public. <br /> Des règles privées.</h2>
                  <p className="text-xl md:text-[24px] text-black/45 leading-relaxed font-medium max-w-lg">Créez un lien en quelques secondes, puis ajustez précisément ce qu’il permet : consultation seule, téléchargement, mot de passe, expiration, quota de vues… Tout reste sous votre contrôle.</p>
                </div>
                <div className="pt-6">
                  <Link href="/dashboard" className="group inline-flex items-center gap-4 text-[18px] font-semibold text-black hover:text-[#96A982] transition-colors">Accéder au dashboard <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" /></Link>
                </div>
              </div>
              <div className="lg:w-[58%] space-y-8 w-full">
                {[
                  { icon: <Download className="w-6 h-6" />, title: "Lecture seule / téléchargement", desc: "activez ou bloquez le download en un clic.", detail: "Contrôlez si vos destinataires peuvent enregistrer localement vos documents." },
                  { icon: <Lock className="w-6 h-6" />, title: "Mot de passe", desc: "ajoutez une protection simple, efficace.", detail: "Une barrière de sécurité supplémentaire pour vos fichiers sensibles." },
                  { icon: <Timer className="w-6 h-6" />, title: "Date d’expiration", desc: "définissez une durée de vie claire pour chaque lien.", detail: "Le lien s'autodétruit passée la date choisie." },
                  { icon: <Eye className="w-6 h-6" />, title: "Quota de vues", desc: "limite automatique pour éviter les partages qui traînent.", detail: "Idéal pour les documents à usage unique." },
                  { icon: <ShieldCheck className="w-6 h-6" />, title: "Révocation immédiate", desc: "désactivez un lien à tout moment.", detail: "Coupez l'accès instantanément en cas d'erreur." },
                  { icon: <RefreshCw className="w-6 h-6" />, title: "Réactivation intelligente", desc: "prolongez ou augmentez le quota pour le rendre valide.", detail: "Redonnez vie à un lien expiré sans en générer un nouveau." }
                ].map((item, i) => (
                  <div key={i} className="group relative bg-white border border-black/[0.04] rounded-[40px] p-10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                      <div className="w-16 h-16 shrink-0 bg-[#B7C5A9]/10 rounded-[24px] flex items-center justify-center text-[#96A982] transition-all duration-700 group-hover:bg-[#B7C5A9]/20 group-hover:scale-110">{item.icon}</div>
                      <div className="space-y-4 text-left">
                        <h3 className="text-2xl font-medium text-black tracking-tight">{item.title}</h3>
                        <p className="text-[19px] text-black/40 leading-relaxed font-medium group-hover:text-black/60 transition-colors duration-700">{item.desc}</p>
                        <div className="pt-0 opacity-0 max-h-0 overflow-hidden transition-all duration-700 group-hover:opacity-100 group-hover:max-h-24 group-hover:pt-6 border-t border-black/[0.03] mt-2">
                          <p className="text-[16px] text-black/35 font-medium leading-relaxed italic">{item.detail}</p>
                        </div>
                      </div>
        </div>
        </div>
                ))}
            </div>
            </div>
          </div>
        </section>

        <section className="relative w-full h-[92vh] flex flex-col items-center justify-center overflow-hidden select-none bg-white">
          <img src="/assets/backgroundthree.jpg" alt="Airlock - Analytics et suivi des partages en arrière-plan" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
            className="relative z-10 w-[88%] md:w-[72%] max-w-5xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-[8px] md:rounded-[24px] overflow-hidden border border-white/10"
          >
            <img src="/assets/dashboardthree.png" alt="Airlock Analytics - Tableau de bord avec statistiques en temps réel : vues, téléchargements, sessions actives" className="w-full h-auto pointer-events-none select-none" loading="lazy" />
          </motion.div>
        </section>

        <section id="analytics" className="py-32 md:py-64 px-6 bg-white overflow-hidden border-t border-black/[0.02]">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="flex flex-col md:flex-row gap-16 md:gap-32 items-center">
              <div className="md:w-1/2 space-y-8">
                <div className="inline-block px-4 py-1.5 bg-[#B7C5A9]/10 rounded-full">
                  <span className="text-[11px] font-bold text-[#96A982] uppercase tracking-[0.2em]">Pilotage & Analytics</span>
                </div>
                <div className="space-y-6">
                  <h2 className="text-5xl md:text-[68px] font-medium tracking-tight text-black leading-[1.05]">Pilotez vos partages. <br /> Suivez chaque accès.</h2>
                  <p className="text-xl md:text-[24px] text-black/45 leading-relaxed font-medium">Centralisez tous vos liens publics au même endroit. Voyez ce qui est actif, ce qui expire, et ce qui a été consulté.</p>
                </div>
              </div>
              <div className="md:w-1/2 w-full h-[300px] md:h-[400px] bg-[#f5f5f7] rounded-[48px] p-10 flex flex-col justify-between border border-black/[0.03] shadow-inner relative overflow-hidden">
                <div className="flex justify-between items-center z-10 text-left">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-black/30 uppercase tracking-widest">Activité Temps Réel</p>
                    <p className="text-2xl font-medium text-black">Vues & Téléchargements</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live</span>
                  </div>
                </div>
                <div className="flex-1 w-full pt-10 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#96A982" stopOpacity={0.3}/><stop offset="95%" stopColor="#96A982" stopOpacity={0}/></linearGradient></defs>
                      <Area type="monotone" dataKey="value" stroke="#96A982" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" isAnimationActive={true} animationDuration={1500} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 z-10 text-left">
                  <div className="bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/50">
                    <p className="text-[10px] font-bold text-black/30 uppercase">Sessions actives</p>
                    <p className="text-2xl font-medium text-black">12</p>
                  </div>
                  <div className="bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/50">
                    <p className="text-[10px] font-bold text-black/30 uppercase">Téléchargements</p>
                    <p className="text-2xl font-medium text-black">4</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
              {[
                { icon: <LayoutDashboard className="w-6 h-6" />, title: "Tableau de contrôle", desc: "tous les liens actifs, au même endroit." },
                { icon: <Activity className="w-6 h-6" />, title: "Statuts lisibles", desc: "actif, expiré, révoqué — en un coup d’œil." },
                { icon: <Timer className="w-6 h-6" />, title: "Expiration & quota", desc: "date limite + vues restantes, sans surprise." },
                { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics 7 jours", desc: "vues et téléchargements, affichés proprement." },
                { icon: <History className="w-6 h-6" />, title: "Traçabilité", desc: "chaque interaction est enregistrée." },
                { icon: <Power className="w-6 h-6" />, title: "Action rapide", desc: "réactiver, prolonger ou désactiver un lien." }
              ].map((item, i) => (
                <div key={i} className="group flex gap-6 items-start p-8 rounded-[32px] hover:bg-[#f5f5f7] transition-all duration-500">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center text-[#96A982] transition-transform duration-500 group-hover:scale-110">{item.icon}</div>
                  <div className="space-y-2">
                    <h3 className="text-[20px] font-medium text-black tracking-tight">{item.title}</h3>
                    <p className="text-[16px] text-black/40 leading-relaxed font-medium group-hover:text-black/60 transition-colors">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="py-24 md:py-32 bg-[#f5f5f7] overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center space-y-6 mb-16 md:mb-20">
              <div className="inline-block px-4 py-1.5 bg-white rounded-full border border-black/[0.03] shadow-sm">
                <span className="text-[11px] font-bold text-[#96A982] uppercase tracking-[0.2em]">Expérience Desktop</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl md:text-[56px] font-medium tracking-tight text-black leading-tight">Le processus Airlock.</h2>
                <p className="text-xl md:text-[28px] font-medium tracking-tight text-black/20 leading-tight max-w-3xl mx-auto">De l'upload au contrôle total, <br className="hidden md:block" /> découvrez la fluidité en mouvement.</p>
              </div>
                    </div>
            <div className="relative flex items-center justify-center"><ProcessAnimation /></div>
                    </div>
        </section>

        <section className="py-32 md:py-64 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-40 h-fit">
                <h2 className="text-5xl md:text-[60px] font-medium tracking-tight text-black leading-tight">Questions <br /> fréquentes.</h2>
                <p className="text-xl text-black/40 font-medium">Tout ce qu'il faut savoir sur Airlock.</p>
                    </div>
              <div className="lg:col-span-8 space-y-0">
                {[
                  { q: "Quelle est la différence avec Google Drive / Dropbox ?", a: "Airlock est pensé pour le partage sensible : liens expirables, lecture seule, mot de passe, quota de vues, révocation immédiate, et suivi des accès — sans complexité." },
                  { q: "Est-ce que je peux partager un dossier sans créer de compte pour l’autre personne ?", a: "Oui. Avec un lien public sécurisé, l’autre personne accède sans compte (selon vos règles)." },
                  { q: "Comment je limite ce que le lien permet de faire ?", a: "Vous choisissez : consultation seule (téléchargement désactivé), mot de passe, date d’expiration, et quota de vues." },
                  { q: "Que se passe-t-il quand un lien expire ou atteint son quota ?", a: "Il devient automatiquement inactif. Vous pouvez le réactiver en prolongeant la date ou en augmentant le quota." },
                  { q: "Est-ce que je vois qui a consulté ou téléchargé ?", a: "Airlock enregistre les interactions (vues / téléchargements) et les affiche dans Mes partages et le centre de notifications." },
                  { q: "Est-ce que les fichiers passent par vos serveurs pendant l’upload ?", a: "Non : l’upload se fait directement depuis le navigateur vers le stockage via des URLs signées, pour la performance et la sécurité." }
                ].map((item, i) => (
                  <div key={i} className="py-10 border-b border-black/[0.05] first:pt-0 last:border-0 group cursor-default">
                    <h3 className="text-2xl md:text-[26px] font-medium text-black tracking-tight mb-4 transition-colors group-hover:text-[#96A982]">{item.q}</h3>
                    <p className="text-lg md:text-[19px] text-black/40 font-medium leading-relaxed max-w-3xl">{item.a}</p>
                </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#f5f5f7] rounded-t-[48px] p-12 md:p-24 border-x border-t border-black/[0.03] space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
              <div className="md:col-span-7 space-y-10 text-left">
                <div className="flex items-center gap-4"><Logo className="w-12 h-12" /><span className="text-3xl font-semibold tracking-tighter">Airlock</span></div>
                <div className="space-y-6 max-w-md">
                  <p className="text-2xl font-medium text-black/80 leading-tight">La nouvelle norme du partage de fichiers sécurisé et souverain.</p>
                  <p className="text-lg text-black/40 font-medium">Développé pour les équipes qui exigent un contrôle total sur leurs données.</p>
                </div>
              </div>
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
    </>
  );
}
