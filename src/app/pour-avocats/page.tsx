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
  Fingerprint,
  Check,
  Plus,
  Minus,
  Scale,
  Users,
  FileText,
  Gavel,
  UserCheck,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Footer } from "@/components/shared/Footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PourAvocatsPage() {
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Airlock respecte-t-il le secret professionnel ?",
      answer:
        "Airlock chiffre vos fichiers en transit et au repos, avec des accès contrôlés par token unique. Nous n'analysons ni ne lisons jamais le contenu de vos documents.",
    },
    {
      question: "Puis-je savoir si un confrère a consulté les pièces ?",
      answer:
        "Oui. Chaque consultation est tracée avec horodatage et géolocalisation, visible dans votre dashboard.",
    },
    {
      question: "Le plan gratuit suffit-il pour un avocat ?",
      answer:
        "Le plan gratuit offre 5 Go, suffisant pour plusieurs dossiers. Le plan Pro à 9 €/mois offre 100 Go pour les cabinets avec un volume plus important.",
    },
    {
      question: "Mes clients doivent-ils créer un compte ?",
      answer:
        "Non. Vos clients accèdent aux documents via le lien sécurisé, sans inscription.",
    },
  ];

  const features = [
    {
      icon: <Lock className="w-7 h-7" />,
      title: "Confidentialité client",
      description: "Chaque dossier est isolé et partagé via un lien unique avec mot de passe.",
    },
    {
      icon: <Fingerprint className="w-7 h-7" />,
      title: "Traçabilité des accès",
      description: "Horodatage et géolocalisation de chaque consultation pour votre dossier.",
    },
    {
      icon: <Timer className="w-7 h-7" />,
      title: "Liens expirables",
      description: "Le lien se désactive automatiquement après la date ou le quota défini.",
    },
    {
      icon: <Eye className="w-7 h-7" />,
      title: "Consultation sans téléchargement",
      description: "Le destinataire peut lire sans pouvoir copier les fichiers.",
    },
    {
      icon: <Globe className="w-7 h-7" />,
      title: "Conformité RGPD",
      description: "Stockage sécurisé sur Cloudflare R2, chiffrement en transit et au repos.",
    },
    {
      icon: <UserCheck className="w-7 h-7" />,
      title: "Aucun compte requis",
      description: "Vos clients et confrères accèdent directement via le lien sécurisé.",
    },
  ];

  const timeline = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Communication de pièces",
      description: "Transmettez les pièces de procédure à la partie adverse ou au tribunal de manière sécurisée et traçable.",
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Due diligence juridique",
      description: "Créez une data room pour les audits d'acquisition ou de fusion. Chaque accès est tracé et révocable.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Partage avec les clients",
      description: "Donnez accès aux documents du dossier sans envoyer de pièces jointes par e-mail.",
    },
    {
      icon: <Gavel className="w-6 h-6" />,
      title: "Collaboration entre confrères",
      description: "Partagez un dossier avec un avocat collaborateur avec accès limité dans le temps.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-black selection:text-white">
      {/* Dynamic Island Navbar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full px-4 flex justify-center">
        <nav
          onMouseLeave={() => setIsFeaturesHovered(false)}
          className="bg-black text-white px-6 py-3 shadow-2xl border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-[32px] scale-90 md:scale-100 overflow-hidden w-full max-w-[750px]"
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
              <Link href="/cas-usage" className="text-white/70 hover:text-white transition-colors">Cas d&apos;usage</Link>
              <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">Facturation</Link>
              <Link href="/security" className="text-white/70 hover:text-white transition-colors">Sécurité</Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <SignedOut>
                <Link href="/login" className="text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 transition-colors">Connexion</Link>
                <Link href="/register" className="bg-white text-black text-[13px] font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-all">Inscription</Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="text-white/70 hover:text-white text-[13px] font-medium px-3 py-1.5 transition-colors">Dashboard</Link>
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

      <main className="relative bg-white">
        {/* Hero Section */}
        <section className="pt-36 md:pt-44 pb-20 md:pb-28 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-[13px] font-semibold text-[#96A982] uppercase tracking-wider">
                Pour Avocats
              </span>
              <span className="text-black/10">·</span>
              <span className="text-[12px] font-medium text-black/30 uppercase tracking-wider">
                Conforme RGPD
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-[64px] font-medium tracking-tight text-black leading-[1.08] opacity-90 mb-6"
            >
              Le secret professionnel,
              <br />
              jusque dans le partage.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-black/45 font-medium max-w-xl leading-relaxed mb-10"
            >
              Transmettez vos pièces et dossiers clients avec traçabilité,
              confidentialité et conformité RGPD.
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
                Commencer gratuitement <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center gap-2 text-black/50 px-4 py-3.5 font-medium text-[15px] hover:text-black transition-colors"
              >
                Notre sécurité <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6"
            >
              {[
                "Secret professionnel préservé",
                "Chiffrement TLS 1.3",
                "Sans compte pour vos clients",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-black/30">
                  <Check className="w-3.5 h-3.5 text-[#96A982]" />
                  <span className="text-[13px] font-medium">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Problem / Context */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
            >
              <div>
                <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                  Les enjeux du partage pour les avocats
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  Les avocats manipulent quotidiennement des documents hautement confidentiels : pièces de procédure, contrats, correspondances client.
                </p>
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  Les envoyer par e-mail ou via des plateformes grand public expose le cabinet à des risques de fuite, de non-conformité déontologique et de perte de contrôle sur la diffusion.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-0 md:py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[#96A982]/[0.06] rounded-3xl p-8 md:p-14 border border-[#96A982]/10"
            >
              <h2 className="text-2xl md:text-[40px] font-medium tracking-tight text-black leading-tight opacity-90 mb-6">
                Airlock, conçu pour la confidentialité juridique
              </h2>
              <p className="text-lg text-black/50 font-medium leading-relaxed">
                Airlock permet aux avocats de partager des dossiers complets via des liens sécurisés, protégés par mot de passe et expirables. Chaque accès est tracé : vous savez qui a consulté quoi, quand et depuis où. La révocation est instantanée et le stockage est chiffré et conforme RGPD.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                Fonctionnalités clés
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-[#f5f5f7] rounded-3xl p-8 border border-black/[0.03] hover:border-[#96A982]/15 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#96A982] mb-6 shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">{feature.title}</h3>
                  <p className="text-black/40 font-medium leading-relaxed text-[15px]">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vertical Timeline - Use Cases */}
        <section className="py-0 md:py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                Cas d&apos;usage
              </h2>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#96A982] via-[#96A982]/40 to-transparent" />

              <div className="space-y-8">
                {timeline.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="flex gap-6 md:gap-8 relative"
                  >
                    {/* Timeline dot */}
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#f0f4ed] rounded-2xl flex items-center justify-center text-[#96A982] flex-shrink-0 relative z-10 border border-[#96A982]/20">
                      {step.icon}
                    </div>
                    <div className="flex-1 bg-white rounded-2xl p-6 border border-black/[0.04] hover:border-[#96A982]/15 transition-all">
                      <h3 className="text-[17px] font-semibold text-black mb-2">{step.title}</h3>
                      <p className="text-black/40 font-medium text-[15px] leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Security Certifications */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0d1a0a] rounded-3xl p-10 md:p-16 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#96A982]/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-[44px] font-medium tracking-tight text-white leading-tight mb-8 opacity-90">
                  Sécurité et conformité
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Chiffrement TLS 1.3", desc: "En transit" },
                    { label: "Cloudflare R2", desc: "Au repos" },
                    { label: "SHA-256 Tokens", desc: "Accès sécurisé" },
                    { label: "Conforme RGPD", desc: "Europe" },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                    >
                      <p className="text-white text-[14px] font-semibold mb-1">{badge.label}</p>
                      <p className="text-white/30 text-[12px] font-medium">{badge.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-lg text-white/40 font-medium leading-relaxed mb-6 max-w-2xl">
                  Vos fichiers sont stockés avec chiffrement en transit et au repos. Airlock n&apos;analyse et n&apos;exploite jamais le contenu de vos documents. Le secret professionnel est préservé.
                </p>

                <Link
                  href="/security"
                  className="inline-flex items-center gap-2 text-[#96A982] hover:text-[#b8d4a0] font-medium transition-colors"
                >
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                Questions fréquentes
              </h2>
            </motion.div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between bg-white border border-black/[0.04] rounded-2xl p-6 hover:border-black/[0.08] transition-all text-left"
                  >
                    <h3 className={`text-[17px] font-medium pr-8 transition-colors ${openFaq === i ? "text-[#96A982]" : "text-black"}`}>
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {openFaq === i ? <Minus className="w-5 h-5 text-[#96A982]" /> : <Plus className="w-5 h-5 text-black/30" />}
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
                        <p className="text-black/50 font-medium leading-relaxed px-6 pb-6 pt-2">
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

        {/* CTA */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-black rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#0d1a0a]" />
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mx-auto">
                  <Scale className="w-4 h-4 text-[#96A982]" />
                  <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">Pour les cabinets</span>
                </div>
                <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-white leading-tight opacity-90">
                  Sécurisez vos échanges de documents
                </h2>
                <p className="text-lg text-white/40 font-medium max-w-lg mx-auto">
                  5 Go offerts. Aucune carte bancaire requise. Conforme RGPD.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-[#96A982] text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-[#86997a] transition-all"
                  >
                    Créer un compte gratuit <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-white/20 transition-all border border-white/10"
                  >
                    Voir les tarifs
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
