"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ChevronDown,
  Compass,
  ShieldCheck,
  Activity,
  ArrowRight,
  Menu,
  X,
  Lock,
  Shield,
  Eye,
  FileKey,
  Timer,
  Database,
  Globe,
  Fingerprint,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DataRoomVirtuellePage() {
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    const viewportCenter = window.innerHeight / 2;
    let closestIndex = -1;
    let closestDistance = Infinity;

    stepRefs.current.forEach((ref, i) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elementCenter - viewportCenter);
        if (distance < closestDistance && rect.top < window.innerHeight && rect.bottom > 0) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
    });

    // Only highlight if the closest step is reasonably close to viewport center
    setActiveStep(closestDistance < window.innerHeight * 0.4 ? closestIndex : -1);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const faqs = [
    {
      question: "Une data room Airlock convient-elle pour une levee de fonds ?",
      answer:
        "Oui. Vous pouvez creer un dossier dedie, y deposer vos documents (pitch deck, financiers, statuts) et generer un lien securise par investisseur, avec tracabilite des consultations.",
    },
    {
      question: "Combien de liens de partage puis-je creer par dossier ?",
      answer:
        "Il n'y a pas de limite. Chaque lien est independant avec ses propres regles (expiration, mot de passe, quota).",
    },
    {
      question: "Les destinataires doivent-ils creer un compte ?",
      answer:
        "Non. Les destinataires accedent directement via le lien securise, sans inscription.",
    },
    {
      question: "Quel est le prix d'une data room Airlock ?",
      answer:
        "Le plan gratuit inclut 5 Go de stockage. Le plan Professionnel a 9 \u20ac/mois offre 100 Go et des fonctionnalites avancees.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Creez votre espace",
      description:
        "Creez un workspace dedie a votre operation (levee de fonds, due diligence, cession). Organisez vos documents par dossiers thematiques.",
      icon: <Database className="w-7 h-7" />,
    },
    {
      number: "02",
      title: "Deposez vos documents",
      description:
        "Uploadez vos fichiers en toute securite. Les fichiers transitent directement du navigateur vers le stockage chiffre Cloudflare R2.",
      icon: <FileKey className="w-7 h-7" />,
    },
    {
      number: "03",
      title: "Configurez les acces",
      description:
        "Generez un lien unique par destinataire avec mot de passe, date d'expiration et quota de vues. Chaque lien est independant.",
      icon: <Lock className="w-7 h-7" />,
    },
    {
      number: "04",
      title: "Suivez en temps reel",
      description:
        "Consultez votre dashboard pour voir qui a ouvert, lu ou telecharge vos fichiers. Revoquez l'acces a tout moment.",
      icon: <Eye className="w-7 h-7" />,
    },
  ];

  const features = [
    {
      icon: <Timer className="w-6 h-6" />,
      title: "Liens expirables",
      description:
        "Definissez une date d'expiration ou un quota de vues pour chaque lien partage.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Mot de passe",
      description:
        "Ajoutez une couche de protection avec un mot de passe obligatoire.",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Tracabilite complete",
      description:
        "Suivez chaque consultation et telechargement en temps reel depuis votre dashboard.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Revocation instantanee",
      description:
        "Coupez l'acces a tout moment, meme si le lien a deja ete partage.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Lecture seule",
      description:
        "Autorisez la consultation sans permettre le telechargement.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Conforme RGPD",
      description:
        "Stockage souverain sur Cloudflare R2, chiffrement en transit et au repos.",
    },
  ];

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
                className={`transition-colors flex items-center gap-1.5 py-2 ${isFeaturesHovered ? "text-white" : "text-white/70 hover:text-white"}`}
              >
                Fonctionnalites{" "}
                <ChevronDown
                  className={`w-3 h-3 opacity-50 transition-transform duration-500 ${isFeaturesHovered ? "rotate-180" : ""}`}
                />
              </button>
              <Link
                href="/pricing"
                className="text-white/70 hover:text-white transition-colors"
              >
                Facturation
              </Link>
              <Link
                href="/security"
                className="text-white/70 hover:text-white transition-colors"
              >
                Securite
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <SignedOut>
                <Link
                  href="/login"
                  className="text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-black text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-all"
                >
                  Inscription
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 transition-colors"
                >
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
                    Regles
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
                    Securite
                  </Link>
                  <div className="pt-2 mt-2 border-t border-white/5 flex flex-col gap-2">
                    <SignedOut>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-white/70 hover:text-white text-[13px] font-medium py-2 px-2 text-left transition-colors w-full"
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-white text-black text-[13px] font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-all w-full text-center"
                      >
                        Inscription
                      </Link>
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
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden hidden md:block"
              >
                <div className="flex flex-row gap-2 py-4 mt-2 border-t border-white/5 w-full">
                  {[
                    {
                      id: "workspace",
                      title: "Workspace",
                      desc: "Au geste.",
                      icon: <Compass className="w-5 h-5" />,
                    },
                    {
                      id: "rules",
                      title: "Regles",
                      desc: "Controle.",
                      icon: <ShieldCheck className="w-5 h-5" />,
                    },
                    {
                      id: "analytics",
                      title: "Analytics",
                      desc: "Live.",
                      icon: <Activity className="w-5 h-5" />,
                    },
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
                        <h4 className="text-[13px] font-medium text-white whitespace-nowrap">
                          {feature.title}
                        </h4>
                        <p className="text-[11px] text-white/30 font-medium whitespace-nowrap">
                          {feature.desc}
                        </p>
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
        {/* Hero Section */}
        <section className="pt-36 md:pt-44 pb-20 md:pb-28 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[13px] font-semibold text-[#96A982] uppercase tracking-wider mb-6"
            >
              Data Room Virtuelle
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-[64px] font-medium tracking-tight text-black leading-[1.08] opacity-90 mb-6"
            >
              Votre data room,
              <br />
              prête en 2 minutes.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-black/45 font-medium max-w-xl leading-relaxed mb-10"
            >
              Un espace sécurisé pour partager vos documents sensibles, avec
              traçabilité et contrôle d&apos;accès granulaire.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#B7C5A9] text-white px-7 py-3.5 rounded-full font-medium text-[15px] hover:bg-[#96A982] transition-all"
              >
                Démarrez gratuitement <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center gap-2 text-black/50 px-4 py-3.5 font-medium text-[15px] hover:text-black transition-colors"
              >
                Voir la sécurité <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6"
            >
              {[
                "Chiffrement TLS 1.3",
                "Stockage souverain",
                "Aucun compte requis",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-black/30"
                >
                  <Check className="w-3.5 h-3.5 text-[#96A982]" />
                  <span className="text-[13px] font-medium">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problem / Why Section */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
            >
              <div className="space-y-6">
                <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                  Pourquoi une data room virtuelle ?
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  Les levees de fonds, audits, due diligences et cessions
                  d&apos;entreprise necessitent le partage de documents hautement
                  confidentiels. Les solutions classiques (e-mail, WeTransfer,
                  Google Drive) ne garantissent ni la tracabilite, ni le controle
                  d&apos;acces, ni la revocation des liens.
                </p>
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  Une data room virtuelle dediee reduit les risques de fuite et
                  centralise tous les echanges documentaires.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Numbered Steps Section (1, 2, 3, 4) */}
        <section className="py-24 md:py-32 px-6 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Comment Airlock repond.
              </h2>
              <p className="text-lg md:text-xl text-black/40 font-medium max-w-2xl mx-auto">
                Quatre etapes pour securiser vos echanges documentaires.
              </p>
            </motion.div>

            <div className="space-y-0">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex items-start gap-8 md:gap-12 py-12 border-b border-black/5 last:border-b-0"
                >
                  {/* Number */}
                  <div className="shrink-0 w-16 md:w-20">
                    <span className={`text-[56px] md:text-[72px] font-bold leading-none block transition-colors duration-300 ${activeStep === i ? "text-[#96A982]/35" : "text-[#96A982]/15"}`}>
                      {step.number}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 flex flex-col md:flex-row md:items-start gap-6">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 transition-all duration-300 ${activeStep === i ? "bg-[#B7C5A9] text-white" : "bg-white text-[#96A982]"}`}>
                      {step.icon}
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl md:text-2xl font-semibold text-black">
                        {step.title}
                      </h3>
                      <p className="text-[16px] text-black/50 leading-relaxed max-w-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
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
                Tout ce qu&apos;il faut pour votre data room.
              </h2>
              <p className="text-lg md:text-xl text-black/40 font-medium max-w-2xl mx-auto">
                Des fonctionnalites pensees pour les operations sensibles.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group bg-[#f5f5f7] rounded-[24px] p-8 hover:bg-[#eeeef0] transition-all duration-300"
                >
                  <div className="space-y-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#96A982] shadow-sm border border-black/5 group-hover:bg-[#96A982] group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-black">
                      {feature.title}
                    </h3>
                    <p className="text-[15px] text-black/50 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases - Horizontal Cards */}
        <section className="py-24 md:py-32 px-6 bg-[#f5f5f7]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Cas d&apos;usage.
              </h2>
              <p className="text-lg md:text-xl text-black/40 font-medium max-w-2xl mx-auto">
                Une data room adaptee a chaque situation.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Levee de fonds",
                  description:
                    "Partagez votre business plan et vos projections financieres avec des investisseurs.",
                  icon: <Database className="w-6 h-6" />,
                },
                {
                  title: "Due diligence",
                  description:
                    "Centralisez les documents juridiques, comptables et fiscaux pour les audits.",
                  icon: <FileKey className="w-6 h-6" />,
                },
                {
                  title: "Cession d'entreprise",
                  description:
                    "Donnez acces aux acquereurs potentiels de maniere controlee et tracable.",
                  icon: <Shield className="w-6 h-6" />,
                },
                {
                  title: "Appels d'offres",
                  description:
                    "Transmettez vos reponses techniques et financieres en toute confidentialite.",
                  icon: <Globe className="w-6 h-6" />,
                },
              ].map((useCase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group bg-white rounded-[24px] p-8 border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all duration-500 flex items-start gap-6"
                >
                  <div className="w-12 h-12 shrink-0 bg-[#96A982]/10 rounded-2xl flex items-center justify-center text-[#96A982] group-hover:bg-[#96A982] group-hover:text-white transition-all duration-300">
                    {useCase.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-black">
                      {useCase.title}
                    </h3>
                    <p className="text-[15px] text-black/50 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Questions frequentes.
              </h2>
              <p className="text-lg text-black/40 font-medium">
                Tout ce que vous devez savoir sur la data room Airlock.
              </p>
            </motion.div>

            <div className="space-y-0">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="border-b border-black/5"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="text-[17px] font-medium text-black pr-8 group-hover:text-[#96A982] transition-colors">
                      {faq.question}
                    </span>
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center group-hover:bg-[#96A982]/10 transition-colors">
                      {openFaq === i ? (
                        <Minus className="w-4 h-4 text-[#96A982]" />
                      ) : (
                        <Plus className="w-4 h-4 text-black/40" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-[15px] text-black/50 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-[#232323] rounded-[40px] p-10 md:p-16 overflow-hidden relative">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#96A982]/20 rounded-full blur-3xl" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#96A982]/10 rounded-full blur-3xl" />

                <div className="relative z-10 text-center space-y-8 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-white leading-tight opacity-90">
                    Demarrez gratuitement.
                  </h2>
                  <p className="text-lg text-white/60 font-medium">
                    Creez votre data room en quelques minutes. 5 Go de stockage
                    offerts avec toutes les fonctionnalites de securite.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 bg-[#96A982] text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-[#86997a] transition-all"
                    >
                      Creer un compte gratuit{" "}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-white/20 transition-all border border-white/10"
                    >
                      Voir les tarifs
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="px-6 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-t-[48px] p-12 md:p-24 border-x border-t border-black/[0.06] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] space-y-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
              <div className="md:col-span-7 space-y-10 text-left">
                <div className="flex items-center gap-4">
                  <Logo className="w-12 h-12" />
                  <span className="text-3xl font-semibold tracking-tighter">
                    Airlock
                  </span>
                </div>
                <div className="space-y-6 max-w-md">
                  <p className="text-2xl font-medium text-black/80 leading-tight">
                    La nouvelle norme du partage de fichiers securise et
                    souverain.
                  </p>
                  <p className="text-lg text-black/40 font-medium">
                    Developpe pour les equipes qui exigent un controle total sur
                    leurs donnees.
                  </p>
                </div>
              </div>
              <div className="md:col-span-5 grid grid-cols-3 gap-10 md:justify-items-end text-left">
                <div className="space-y-8">
                  <h4 className="text-sm font-bold text-black uppercase tracking-[0.2em]">
                    Produit
                  </h4>
                  <ul className="space-y-5 text-[17px] text-black/40 font-medium">
                    <li>
                      <Link
                        href="/#workspace"
                        className="hover:text-black transition-colors"
                      >
                        Workspace
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#rules"
                        className="hover:text-black transition-colors"
                      >
                        Partages
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/security"
                        className="hover:text-black transition-colors"
                      >
                        Securite
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq"
                        className="hover:text-black transition-colors"
                      >
                        FAQ
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-8">
                  <h4 className="text-sm font-bold text-black uppercase tracking-[0.2em]">
                    Solutions
                  </h4>
                  <ul className="space-y-5 text-[17px] text-black/40 font-medium">
                    <li>
                      <Link
                        href="/data-room-virtuelle"
                        className="hover:text-black transition-colors"
                      >
                        Data Room
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/partage-dossier-securise"
                        className="hover:text-black transition-colors"
                      >
                        Partage Securise
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/pour-avocats"
                        className="hover:text-black transition-colors"
                      >
                        Pour Avocats
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/alternative-google-drive-pro"
                        className="hover:text-black transition-colors"
                      >
                        Alternative Drive
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="space-y-8">
                  <h4 className="text-sm font-bold text-black uppercase tracking-[0.2em]">
                    Legal
                  </h4>
                  <ul className="space-y-5 text-[17px] text-black/40 font-medium">
                    <li>
                      <Link
                        href="/confidentialite"
                        className="hover:text-black transition-colors"
                      >
                        Confidentialite
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/mentions"
                        className="hover:text-black transition-colors"
                      >
                        Mentions
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/pricing"
                        className="hover:text-black transition-colors"
                      >
                        Facturation
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-3 text-black/40 font-medium bg-white/50 px-4 py-2 rounded-full border border-black/[0.03]">
                <Compass className="w-4 h-4 text-[#96A982]" />
                <span>Francais</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </div>
              <div className="flex items-center gap-8 text-black/40">
                <a
                  href="https://linkedin.com/company/airlck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors font-semibold"
                >
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com/airlck"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors font-semibold"
                >
                  X (Twitter)
                </a>
              </div>
              <p className="text-black/20 text-[11px] font-bold uppercase tracking-[0.4em]">
                &copy; 2025 AIRLOCK TECHNOLOGIES
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
