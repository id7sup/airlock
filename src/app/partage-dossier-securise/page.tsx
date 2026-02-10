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
import { Footer } from "@/components/shared/Footer";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PartageDossierSecurisePage() {
  const [isFeaturesHovered, setIsFeaturesHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Puis-je partager plusieurs dossiers en meme temps ?",
      answer:
        "Chaque lien est associe a un dossier. Vous pouvez creer autant de liens que necessaire, chacun avec ses propres regles de securite.",
    },
    {
      question: "Le destinataire peut-il retransmettre le lien ?",
      answer:
        "Le lien reste accessible tant qu'il n'a pas expire. Vous pouvez ajouter un mot de passe et un quota de vues pour limiter les acces non autorises.",
    },
    {
      question: "Comment savoir si mon dossier a ete consulte ?",
      answer:
        "Le dashboard affiche en temps reel les vues, telechargements et la geolocalisation des acces.",
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
                Fonctionnalites{" "}
                <ChevronDown
                  className={`w-3 h-3 opacity-50 transition-transform duration-500 ${isFeaturesHovered ? "rotate-180" : ""}`}
                />
              </button>
              <Link href="/cas-usage" className="text-white/70 hover:text-white transition-colors">Cas d&apos;usage</Link>
              <Link href="/pricing" className="text-white/70 hover:text-white transition-colors">Facturation</Link>
              <Link href="/security" className="text-white/70 hover:text-white transition-colors">Securite</Link>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-8 h-8 flex items-center justify-center text-white/70 hover:text-white transition-colors">
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden md:hidden">
                <div className="flex flex-col gap-2 py-4 mt-2 border-t border-white/5">
                  <Link href="/#workspace" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Workspace</Link>
                  <Link href="/#rules" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Regles</Link>
                  <Link href="/#analytics" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Analytics</Link>
                  <Link href="/cas-usage" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Cas d&apos;usage</Link>
                  <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Facturation</Link>
                  <Link href="/security" onClick={() => setIsMobileMenuOpen(false)} className="text-white/70 hover:text-white transition-colors text-[13px] font-medium py-2 px-2">Securite</Link>
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden hidden md:block">
                <div className="flex flex-row gap-2 py-4 mt-2 border-t border-white/5 w-full">
                  {[
                    { id: "workspace", title: "Workspace", desc: "Au geste.", icon: <Compass className="w-5 h-5" /> },
                    { id: "rules", title: "Regles", desc: "Controle.", icon: <ShieldCheck className="w-5 h-5" /> },
                    { id: "analytics", title: "Analytics", desc: "Live.", icon: <Activity className="w-5 h-5" /> },
                  ].map((feature) => (
                    <Link key={feature.id} href={`/#${feature.id}`} onClick={() => setIsFeaturesHovered(false)} className="group flex-1 flex flex-row items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all duration-300 overflow-hidden">
                      <div className="w-9 h-9 shrink-0 bg-[#B7C5A9]/15 text-[#96A982] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">{feature.icon}</div>
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
          <div className="max-w-4xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[13px] font-semibold text-[#96A982] uppercase tracking-wider mb-6"
            >
              Partage Sécurisé
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-[64px] font-medium tracking-tight text-black leading-[1.08] opacity-90 mb-6"
            >
              Un lien. Vos règles.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-black/45 font-medium max-w-xl mx-auto leading-relaxed mb-10"
            >
              Envoyez vos dossiers avec des liens protégés, traçables et
              révocables en un clic.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-[#96A982] text-white px-7 py-3.5 rounded-full font-medium text-[15px] hover:bg-[#86997a] transition-all"
              >
                Démarrez gratuitement <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 justify-center"
            >
              {["Token SHA-256", "Expiration auto", "Sans compte"].map(
                (item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-black/30"
                  >
                    <Check className="w-3.5 h-3.5 text-[#96A982]" />
                    <span className="text-[13px] font-medium">{item}</span>
                  </div>
                )
              )}
            </motion.div>
          </div>
        </section>

        {/* Problem Section - Alternating Left */}
        <section className="py-24 md:py-32 px-6 bg-[#f5f5f7]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="lg:w-1/2 space-y-6"
              >
                <h2 className="text-3xl md:text-[44px] font-medium tracking-tight text-black leading-tight opacity-90">
                  Les limites du partage classique.
                </h2>
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  Envoyer un dossier par e-mail ou via un lien Google Drive,
                  c&apos;est perdre le controle : pas de tracabilite, pas
                  d&apos;expiration, pas de revocation. Une fois le fichier envoye,
                  impossible de savoir qui l&apos;a consulte, copie ou retransmis.
                </p>
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  Pour les documents sensibles, c&apos;est un risque majeur.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:w-1/2"
              >
                <div className="bg-white rounded-[32px] p-8 border border-black/5 space-y-6">
                  <div className="flex items-center gap-3 text-red-400">
                    <X className="w-5 h-5" />
                    <span className="text-[15px] font-medium">Pas de tracabilite des acces</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-400">
                    <X className="w-5 h-5" />
                    <span className="text-[15px] font-medium">Aucune date d&apos;expiration</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-400">
                    <X className="w-5 h-5" />
                    <span className="text-[15px] font-medium">Impossible de revoquer un lien envoye</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-400">
                    <X className="w-5 h-5" />
                    <span className="text-[15px] font-medium">Pas de protection par mot de passe</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Solution Section - Alternating Right */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="lg:w-1/2 space-y-6"
              >
                <h2 className="text-3xl md:text-[44px] font-medium tracking-tight text-black leading-tight opacity-90">
                  Le partage securise avec Airlock.
                </h2>
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  Airlock vous permet de partager un dossier complet via un lien
                  unique, protege par mot de passe, avec une date d&apos;expiration et
                  un quota de consultations. Chaque acces est enregistre et
                  visible en temps reel. Si vous changez d&apos;avis, la revocation
                  est instantanee.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="lg:w-1/2"
              >
                <div className="bg-[#f5f5f7] rounded-[32px] p-8 border border-black/[0.03] space-y-6">
                  {[
                    "Lien unique avec mot de passe",
                    "Date d'expiration configurable",
                    "Quota de vues par lien",
                    "Revocation instantanee",
                    "Suivi des acces en temps reel",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#96A982]">
                      <Check className="w-5 h-5" />
                      <span className="text-[15px] font-medium text-black/70">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Horizontal Features Strip */}
        <section className="py-20 md:py-24 px-6 bg-[#f5f5f7]">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Fonctionnalites de partage.
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: <Lock className="w-6 h-6" />, title: "Lien unique" },
                { icon: <Timer className="w-6 h-6" />, title: "Expiration" },
                { icon: <Eye className="w-6 h-6" />, title: "Suivi live" },
                { icon: <Fingerprint className="w-6 h-6" />, title: "Sans compte" },
                { icon: <Shield className="w-6 h-6" />, title: "Anti-download" },
                { icon: <FileKey className="w-6 h-6" />, title: "Upload direct" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group bg-white rounded-2xl p-6 text-center border border-black/5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto bg-[#96A982]/10 rounded-2xl flex items-center justify-center text-[#96A982] mb-4 group-hover:bg-[#96A982] group-hover:text-white transition-all duration-300">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-black">{item.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases - Alternating Layout */}
        <section className="py-24 md:py-32 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight mb-4 opacity-90">
                Pour chaque situation.
              </h2>
            </motion.div>

            <div className="space-y-8">
              {[
                {
                  title: "Envoi de maquettes",
                  description: "Partagez des creations graphiques avec vos clients sans risque de diffusion.",
                  icon: <Globe className="w-6 h-6" />,
                  align: "left" as const,
                },
                {
                  title: "Documents RH",
                  description: "Transmettez des bulletins de paie ou contrats de maniere confidentielle.",
                  icon: <FileKey className="w-6 h-6" />,
                  align: "right" as const,
                },
                {
                  title: "Collaboration projet",
                  description: "Donnez un acces temporaire a des prestataires externes.",
                  icon: <Activity className="w-6 h-6" />,
                  align: "left" as const,
                },
                {
                  title: "Transfert de dossiers clients",
                  description: "Envoyez des dossiers complets a vos partenaires avec tracabilite.",
                  icon: <Shield className="w-6 h-6" />,
                  align: "right" as const,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: item.align === "left" ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row items-center gap-8 ${item.align === "right" ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="w-16 h-16 shrink-0 bg-[#96A982]/10 rounded-2xl flex items-center justify-center text-[#96A982]">
                    {item.icon}
                  </div>
                  <div className={`flex-1 ${item.align === "right" ? "md:text-right" : ""}`}>
                    <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                    <p className="text-[15px] text-black/50 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-24 md:py-32 px-6 bg-[#f5f5f7]">
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
                    <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:bg-[#96A982]/10 transition-colors">
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
        <section className="py-24 md:py-32 px-6 bg-white">
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
                    Partagez vos premiers dossiers en quelques minutes. 5 Go de
                    stockage offerts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 bg-[#96A982] text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-[#86997a] transition-all"
                    >
                      Creer un compte gratuit <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/faq"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-medium text-[16px] hover:bg-white/20 transition-all border border-white/10"
                    >
                      Questions frequentes
                    </Link>
                  </div>
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
