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
  Fingerprint,
  Check,
  Plus,
  Minus,
  ShieldAlert,
  FileWarning,
  ScanEye,
  Ban,
  KeyRound,
  Server,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Footer } from "@/components/shared/Footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PartageDocumentsConfidentielsPage() {
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Airlock convient-il pour des données de santé ?",
      answer:
        "Airlock utilise un chiffrement en transit et au repos conforme aux standards européens. Pour les données de santé soumises à des réglementations spécifiques (HDS), vérifiez les exigences de votre secteur.",
    },
    {
      question: "Mes documents sont-ils analysés par Airlock ?",
      answer:
        "Non. Airlock n'analyse, ne lit et n'exploite jamais le contenu de vos fichiers. Vos documents restent strictement confidentiels.",
    },
    {
      question:
        "Puis-je savoir si un document a été capturé (screenshot) ?",
      answer:
        "Airlock ne peut pas détecter les captures d'écran. La consultation sans téléchargement et le filigrane réduisent ce risque.",
    },
    {
      question: "Quelle est la taille maximale de fichier ?",
      answer:
        "Le plan gratuit permet des fichiers jusqu'à 100 Mo. Le plan Pro à 9 €/mois supporte des fichiers plus volumineux avec 100 Go de stockage total.",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Chiffrement double couche",
      description:
        "Chiffrement en transit (TLS 1.3) et au repos sur Cloudflare R2. Vos fichiers ne sont jamais exposés.",
      badge: "TLS 1.3",
    },
    {
      icon: <KeyRound className="w-8 h-8" />,
      title: "Mot de passe obligatoire",
      description:
        "Ajoutez un mot de passe pour restreindre l'accès au seul destinataire autorisé.",
      badge: "SHA-256",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Consultation sans téléchargement",
      description:
        "Le destinataire peut lire le document sans pouvoir le télécharger ni le copier.",
      badge: "Lecture seule",
    },
    {
      icon: <ScanEye className="w-8 h-8" />,
      title: "Notifications d'accès",
      description:
        "Soyez alerté à chaque consultation de vos documents partagés. Traçabilité complète.",
      badge: "Temps réel",
    },
    {
      icon: <Ban className="w-8 h-8" />,
      title: "Révocation immédiate",
      description:
        "Coupez l'accès en un clic, même après envoi du lien. Effet instantané.",
      badge: "Instantané",
    },
    {
      icon: <Server className="w-8 h-8" />,
      title: "Conformité RGPD",
      description:
        "Stockage souverain sur Cloudflare R2 et respect des réglementations européennes.",
      badge: "RGPD",
    },
  ];

  const useCases = [
    {
      icon: <FileKey className="w-6 h-6" />,
      title: "Contrats et NDA",
      description:
        "Partagez des accords de confidentialité avec des partenaires de manière traçable et sécurisée.",
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Données financières",
      description:
        "Transmettez bilans, comptes de résultat et projections en toute sécurité avec contrôle d'accès.",
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Propriété intellectuelle",
      description:
        "Protégez brevets, designs et secrets commerciaux lors des échanges avec des tiers.",
    },
    {
      icon: <ShieldAlert className="w-6 h-6" />,
      title: "Documents médicaux",
      description:
        "Partagez des dossiers patients ou résultats d'analyse en conformité RGPD.",
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
              <Link
                href="/cas-usage"
                className="text-white/70 hover:text-white transition-colors"
              >
                Cas d&apos;usage
              </Link>
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
                Sécurité
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
        {/* Hero */}
        <section className="pt-36 md:pt-44 pb-20 md:pb-28 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {["Chiffrement", "Traçabilité", "RGPD"].map((badge, i) => (
                <span
                  key={i}
                  className="text-[12px] font-medium text-black/30 uppercase tracking-wider"
                >
                  {badge}{i < 2 && <span className="ml-2 text-black/10">·</span>}
                </span>
              ))}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-[64px] font-medium tracking-tight text-black leading-[1.08] opacity-90 mb-6"
            >
              Vos documents sensibles
              <br />
              méritent mieux qu&apos;un e-mail.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-black/45 font-medium max-w-xl leading-relaxed mb-10"
            >
              Envoyez vos documents les plus sensibles avec chiffrement,
              traçabilité et contrôle d&apos;accès total.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-black text-white px-7 py-3.5 rounded-full font-medium text-[15px] hover:bg-black/80 transition-all"
              >
                Protéger mes documents <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center gap-2 text-black/50 px-4 py-3.5 font-medium text-[15px] hover:text-black transition-colors"
              >
                Notre sécurité <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Problem Section - Split layout with accent border */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[#f5f5f7] rounded-3xl p-8 md:p-14 border border-black/[0.03] relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 via-orange-400 to-yellow-400 rounded-l-3xl" />
              <div className="flex items-start gap-5 mb-6">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileWarning className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-2xl md:text-[40px] font-medium tracking-tight text-black leading-tight opacity-90">
                  Le risque des documents confidentiels mal partagés
                </h2>
              </div>
              <p className="text-lg text-black/50 font-medium leading-relaxed pl-0 md:pl-[68px]">
                Contrats, bilans financiers, brevets, données médicales : les documents confidentiels transitent souvent par des canaux non sécurisés. Un e-mail intercepté, un lien Google Drive ouvert au public, ou un fichier stocké sans chiffrement exposent votre entreprise à des fuites de données coûteuses.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-0 md:py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-[#96A982]/[0.06] rounded-3xl p-8 md:p-14 border border-[#96A982]/10 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#96A982] to-[#b8d4a0] rounded-l-3xl" />
              <div className="flex items-start gap-5 mb-6">
                <div className="w-12 h-12 bg-[#96A982]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#96A982]" />
                </div>
                <h2 className="text-2xl md:text-[40px] font-medium tracking-tight text-black leading-tight opacity-90">
                  Airlock protège vos documents confidentiels
                </h2>
              </div>
              <p className="text-lg text-black/50 font-medium leading-relaxed pl-0 md:pl-[68px]">
                Avec Airlock, chaque document confidentiel est stocké avec chiffrement au repos et en transit. Le partage se fait via des liens sécurisés avec mot de passe, expiration et quota de vues. Vous gardez la main sur qui accède à quoi, et pouvez couper l&apos;accès à tout moment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid - 3 columns with badges */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                Sécurité à chaque étape
              </h2>
              <p className="text-lg text-black/40 font-medium mt-4 max-w-2xl mx-auto">
                Six couches de protection pour vos documents les plus sensibles.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group bg-white rounded-3xl p-8 border border-black/[0.04] hover:border-[#96A982]/20 hover:shadow-xl hover:shadow-[#96A982]/5 transition-all duration-500"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center text-[#96A982] group-hover:bg-[#96A982]/10 transition-colors duration-500">
                      {feature.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#96A982]/60 bg-[#96A982]/8 px-3 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-black/40 font-medium leading-relaxed text-[15px]">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases - Horizontal cards */}
        <section className="py-0 md:py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                Cas d&apos;usage
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {useCases.map((uc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex items-start gap-5 bg-[#f5f5f7] rounded-2xl p-6 border border-black/[0.03] hover:border-black/[0.06] transition-all"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#96A982] flex-shrink-0">
                    {uc.icon}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-black mb-1">
                      {uc.title}
                    </h3>
                    <p className="text-black/40 font-medium text-[15px] leading-relaxed">
                      {uc.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Banner - Full width callout */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-gradient-to-br from-black via-black to-[#1a2e14] rounded-3xl p-10 md:p-16 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#96A982]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#96A982]/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex flex-wrap gap-4 mb-8">
                  {[
                    { label: "TLS 1.3", icon: <Lock className="w-3.5 h-3.5" /> },
                    { label: "Cloudflare R2", icon: <Server className="w-3.5 h-3.5" /> },
                    { label: "SHA-256", icon: <Fingerprint className="w-3.5 h-3.5" /> },
                    { label: "RGPD", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>
                <h2 className="text-3xl md:text-[44px] font-medium tracking-tight text-white leading-tight mb-6 opacity-90">
                  Sécurité et contrôle
                </h2>
                <p className="text-lg text-white/50 font-medium leading-relaxed max-w-2xl mb-8">
                  Vos fichiers sont stockés sur Cloudflare R2 avec chiffrement en transit (TLS 1.3) et au repos. Chaque accès est contrôlé via des URLs présignées temporaires et des tokens hashés SHA-256. Airlock est conforme au RGPD.
                </p>
                <Link
                  href="/security"
                  className="inline-flex items-center gap-2 text-[#96A982] hover:text-[#b8d4a0] font-medium transition-colors"
                >
                  En savoir plus sur notre sécurité <ArrowRight className="w-4 h-4" />
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
                    <h3
                      className={`text-[17px] font-medium pr-8 transition-colors ${openFaq === i ? "text-[#96A982]" : "text-black"}`}
                    >
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {openFaq === i ? (
                        <Minus className="w-5 h-5 text-[#96A982]" />
                      ) : (
                        <Plus className="w-5 h-5 text-black/30" />
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
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#1a2e14]" />
              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-white leading-tight opacity-90">
                  Protégez vos documents dès maintenant
                </h2>
                <p className="text-lg text-white/50 font-medium max-w-lg mx-auto">
                  5 Go de stockage offerts. Aucune carte bancaire requise.
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
