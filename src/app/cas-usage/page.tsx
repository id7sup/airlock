import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/shared/Logo";
import { SEONavbar } from "@/components/shared/SEONavbar";
import { Footer } from "@/components/shared/Footer";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { secteurs } from "@/data/pseo/secteurs";
import { alternatives } from "@/data/pseo/alternatives";
import { casUsage } from "@/data/pseo/cas-usage";
import { glossaire } from "@/data/pseo/glossaire";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

export const metadata: Metadata = {
  title: "Cas d'usage | Comment utiliser Airlock pour vos fichiers",
  description:
    "Découvrez comment Airlock sécurise le partage de fichiers pour chaque métier, chaque situation et chaque besoin. Data rooms, contrats, audits, plans, et plus.",
  openGraph: {
    title: "Cas d'usage | Airlock",
    description:
      "Découvrez comment Airlock sécurise le partage de fichiers pour chaque métier et chaque situation.",
    url: `${siteUrl}/cas-usage`,
  },
  alternates: {
    canonical: `${siteUrl}/cas-usage`,
  },
};

export default function CasUsageHubPage() {
  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-black selection:text-white">
      <SEONavbar />

      <main className="relative bg-white">
        {/* Hero - compact */}
        <section className="pt-36 md:pt-44 pb-12 md:pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-[56px] font-medium tracking-tight text-black leading-[1.08] opacity-90 mb-5">
              Chaque fichier a<br />son contexte.
            </h1>
            <p className="text-lg md:text-xl text-black/40 font-medium max-w-lg mx-auto">
              Explorez comment Airlock s&apos;adapte à votre métier et résout vos
              problèmes de partage sécurisé.
            </p>
          </div>
        </section>

        {/* Alternatives - visual logo cards */}
        <section className="py-12 md:py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] mb-6">
              Airlock vs.
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { slug: "wetransfer", name: "WeTransfer", href: "/alternative/wetransfer", logo: "/assets/comparatiflogo/WeTransfer_logo.png", rounded: false },
                { slug: "dropbox", name: "Dropbox", href: "/alternative/dropbox", logo: "/assets/comparatiflogo/Dropbox_Icon.png", rounded: false },
                { slug: "google-drive", name: "Google Drive", href: "/alternative-google-drive-pro", logo: "/assets/comparatiflogo/Google_Drive.svg", rounded: false },
                { slug: "onedrive", name: "OneDrive", href: "/alternative/onedrive", logo: "/assets/comparatiflogo/onedrive-1.svg", rounded: false },
                { slug: "sharepoint", name: "SharePoint", href: "/alternative/sharepoint", logo: "/assets/comparatiflogo/Microsoft_Office_SharePoint.png", rounded: false },
                { slug: "box", name: "Box", href: "/alternative/box", logo: "/assets/comparatiflogo/Box,_.png", rounded: false },
                { slug: "tresorit", name: "Tresorit", href: "/alternative/tresorit", logo: "/assets/comparatiflogo/tresorit.png", rounded: false },
                { slug: "smash", name: "Smash", href: "/alternative/smash", logo: "/assets/comparatiflogo/smashlogo.png", rounded: false },
                { slug: "swisstransfer", name: "SwissTransfer", href: "/alternative/swisstransfer", logo: "/assets/comparatiflogo/swisstransfer.png", rounded: true },
              ].map((alt) => (
                <Link
                  key={alt.slug}
                  href={alt.href}
                  className="group flex flex-col items-center gap-3 bg-[#f5f5f7] rounded-2xl p-5 border border-black/[0.03] hover:border-[#96A982]/30 hover:bg-white hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-300"
                >
                  <Image
                    src={alt.logo}
                    alt={alt.name}
                    width={48}
                    height={48}
                    className={`w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300${alt.rounded ? " rounded-lg" : ""}`}
                  />
                  <span className="text-[13px] font-semibold text-black/70 group-hover:text-[#7d9169] transition-colors text-center leading-tight">
                    {alt.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Cas d'usage - featured cards */}
        <section className="py-12 md:py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] mb-6">
              Par situation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {casUsage.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cas-usage/${c.slug}`}
                  className="group bg-[#f5f5f7] rounded-2xl p-5 border border-black/[0.03] hover:border-[#96A982]/30 hover:bg-[#96A982]/[0.05] transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <h3 className="text-[15px] font-semibold text-black/80 group-hover:text-[#7d9169] transition-colors leading-snug">
                    {c.title}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-black/15 group-hover:text-[#96A982] transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Par métier - compact pill cards */}
        <section className="py-12 md:py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] mb-6">
              Par métier
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {secteurs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/pour/${s.slug}`}
                  className="group flex items-center justify-between bg-[#f5f5f7] rounded-2xl px-5 py-4 border border-black/[0.03] hover:border-[#96A982]/30 hover:bg-[#96A982]/[0.05] transition-all duration-300"
                >
                  <span className="text-[14px] font-semibold text-black/80 group-hover:text-[#7d9169] transition-colors capitalize">
                    {s.slug.replace(/-/g, " ")}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-black/15 group-hover:text-[#96A982] transition-all shrink-0 ml-2" />
                </Link>
              ))}
              <Link
                href="/pour-avocats"
                className="group flex items-center justify-between bg-[#f5f5f7] rounded-2xl px-5 py-4 border border-black/[0.03] hover:border-[#96A982]/30 hover:bg-[#96A982]/[0.05] transition-all duration-300"
              >
                <span className="text-[14px] font-semibold text-black/80 group-hover:text-[#7d9169] transition-colors">
                  Avocats
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-black/15 group-hover:text-[#96A982] transition-all shrink-0 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Glossaire - editorial list */}
        <section className="py-12 md:py-16 px-6 border-t border-black/[0.04]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] mb-6">
              Glossaire
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
              {glossaire.map((g, i) => (
                <Link
                  key={g.slug}
                  href={`/glossaire/${g.slug}`}
                  className="group flex items-center gap-4 py-3.5 border-b border-black/[0.04] hover:border-[#96A982]/30 transition-colors"
                >
                  <span className="text-[11px] font-bold text-black/15 tabular-nums w-5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14px] font-semibold text-black/70 group-hover:text-[#7d9169] transition-colors">
                    {g.title}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-black/10 group-hover:text-[#96A982] transition-all ml-auto shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-black rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#0d1a0a]" />
              <div className="relative z-10 space-y-6">
                <h2 className="text-2xl md:text-[40px] font-medium tracking-tight text-white leading-tight opacity-90">
                  Prêt à sécuriser vos échanges ?
                </h2>
                <p className="text-[15px] text-white/35 font-medium">
                  5 Go offerts. Aucune carte bancaire. Conforme RGPD.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-[#96A982] text-white px-7 py-3.5 rounded-full font-medium text-[14px] hover:bg-[#86997a] transition-all"
                  >
                    Créer un compte gratuit <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-7 py-3.5 rounded-full font-medium text-[14px] hover:bg-white/20 transition-all border border-white/10"
                  >
                    Voir les tarifs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
