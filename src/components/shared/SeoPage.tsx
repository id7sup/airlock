import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { SEONavbar } from "@/components/shared/SEONavbar";
import { Footer } from "@/components/shared/Footer";
import { ArrowRight, ChevronDown } from "lucide-react";

interface SeoFaq {
  question: string;
  answer: string;
}

interface RelatedPage {
  href: string;
  label: string;
}

interface SeoPageProps {
  title: string;
  subtitle: string;
  problemTitle: string;
  problemContent: string;
  solutionTitle: string;
  solutionContent: string;
  features: { title: string; description: string }[];
  useCases: { title: string; description: string }[];
  faqs: SeoFaq[];
  relatedPages: RelatedPage[];
}

export function SeoPage({
  title,
  subtitle,
  problemTitle,
  problemContent,
  solutionTitle,
  solutionContent,
  features,
  useCases,
  faqs,
  relatedPages,
}: SeoPageProps) {
  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans selection:bg-black selection:text-white">
      {/* Dynamic Island Navbar */}
      <SEONavbar />

      <main className="relative bg-white">
        {/* Hero */}
        <section className="pt-36 md:pt-44 pb-16 md:pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-[56px] font-medium tracking-tight text-black leading-tight opacity-90 mb-6">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-black/50 font-medium max-w-2xl leading-relaxed mb-10">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
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
            </div>
          </div>
        </section>

        {/* Problème / Contexte */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90">
                  {problemTitle}
                </h2>
              </div>
              <div>
                <p className="text-lg text-black/50 font-medium leading-relaxed">
                  {problemContent}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-0 md:py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-[#96A982]/[0.06] rounded-3xl p-8 md:p-14 border border-[#96A982]/10">
              <h2 className="text-2xl md:text-[40px] font-medium tracking-tight text-black leading-tight opacity-90 mb-6">
                {solutionTitle}
              </h2>
              <p className="text-lg text-black/50 font-medium leading-relaxed">
                {solutionContent}
              </p>
            </div>
          </div>
        </section>

        {/* Fonctionnalités clés */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90 mb-16">
              Fonctionnalités clés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-[#f5f5f7] rounded-3xl p-8 border border-black/[0.03] hover:border-[#96A982]/15 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-black mb-3">{f.title}</h3>
                  <p className="text-black/40 font-medium leading-relaxed text-[15px]">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cas d'usage */}
        <section className="py-0 md:py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90 mb-16">
              Cas d&apos;usage
            </h2>
            <div className="space-y-4">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className="flex items-start gap-6 bg-white rounded-2xl p-6 border border-black/[0.04] hover:border-[#96A982]/15 transition-all"
                >
                  <div className="w-10 h-10 shrink-0 bg-[#96A982]/10 rounded-xl flex items-center justify-center">
                    <span className="text-[#96A982] text-sm font-bold">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-black mb-1">{uc.title}</h3>
                    <p className="text-black/40 font-medium text-[15px] leading-relaxed">
                      {uc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sécurité */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0d1a0a] rounded-3xl p-10 md:p-16 relative overflow-hidden">
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
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-white text-[14px] font-semibold mb-1">{badge.label}</p>
                      <p className="text-white/30 text-[12px] font-medium">{badge.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="text-lg text-white/40 font-medium leading-relaxed mb-6 max-w-2xl">
                  Vos fichiers sont stockés avec chiffrement en transit et au repos. Airlock n&apos;analyse et n&apos;exploite jamais le contenu de vos documents.
                </p>
                <Link
                  href="/security"
                  className="inline-flex items-center gap-2 text-[#96A982] hover:text-[#b8d4a0] font-medium transition-colors"
                >
                  En savoir plus <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-black leading-tight opacity-90 mb-12">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-white border border-black/[0.04] rounded-2xl p-6 hover:border-black/[0.08] transition-all"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-[17px] font-medium text-black pr-8 group-open:text-[#96A982] transition-colors">
                      {faq.question}
                    </h3>
                    <ChevronDown className="w-5 h-5 text-black/30 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <p className="mt-4 text-black/50 font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-black rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#0d1a0a]" />
              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl md:text-[48px] font-medium tracking-tight text-white leading-tight opacity-90">
                  Démarrez gratuitement
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
            </div>
          </div>
        </section>

        {/* Lire aussi */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-medium tracking-tight text-black opacity-90 mb-6">
              Lire aussi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPages.map((page, i) => (
                <Link
                  key={i}
                  href={page.href}
                  className="group bg-[#f5f5f7] rounded-2xl p-6 border border-black/[0.03] hover:border-[#96A982]/15 transition-all"
                >
                  <span className="text-base font-medium text-black group-hover:text-[#96A982] transition-colors">
                    {page.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-black/30 mt-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
            <Link
              href="/cas-usage"
              className="inline-flex items-center gap-2 text-[#96A982] hover:text-[#7d9169] font-medium mt-8 transition-colors"
            >
              Explorer tous les cas d&apos;usage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
