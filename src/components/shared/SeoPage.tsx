import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { ArrowLeft, ArrowRight, ChevronDown, Compass } from "lucide-react";

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
    <div className="min-h-screen bg-white">
      <header className="px-6 py-8 border-b border-black/[0.03]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-semibold tracking-tighter">Airlock</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-black/40 hover:text-black transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Link>
        </div>
      </header>

      <main className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="mb-16 md:mb-24">
            <h1 className="text-4xl md:text-[56px] font-medium tracking-tight text-black leading-tight opacity-90 mb-6">{title}</h1>
            <p className="text-xl md:text-2xl text-black/50 font-medium max-w-2xl">{subtitle}</p>
          </div>

          {/* Probleme / Contexte */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black opacity-90 mb-6">{problemTitle}</h2>
            <p className="text-lg text-black/60 leading-relaxed">{problemContent}</p>
          </section>

          {/* Solution */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black opacity-90 mb-6">{solutionTitle}</h2>
            <p className="text-lg text-black/60 leading-relaxed">{solutionContent}</p>
          </section>

          {/* Fonctionnalites cles */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black opacity-90 mb-8">Fonctionnalités clés</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <div key={i} className="bg-[#f5f5f7] rounded-3xl p-8 border border-black/[0.03]">
                  <h3 className="text-lg font-medium text-black mb-3">{f.title}</h3>
                  <p className="text-black/50 font-medium leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cas d'usage */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black opacity-90 mb-8">Cas d'usage</h2>
            <div className="space-y-4">
              {useCases.map((uc, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#96A982] mt-2.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-black">{uc.title}</h3>
                    <p className="text-black/50 font-medium">{uc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Securite */}
          <section className="mb-16 bg-[#f5f5f7] rounded-3xl p-8 md:p-12 border border-black/[0.03]">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black opacity-90 mb-6">Sécurité et contrôle</h2>
            <p className="text-lg text-black/60 leading-relaxed mb-6">
              Vos fichiers sont stockés sur Cloudflare R2 (API compatible S3), avec chiffrement en transit (TLS 1.3) et au repos. Chaque accès est contrôlé via des URLs présignées temporaires et des tokens hashés SHA-256. Airlock est conforme au RGPD.
            </p>
            <Link href="/security" className="inline-flex items-center gap-2 text-[#96A982] hover:text-[#7d9169] font-medium transition-colors">
              En savoir plus sur notre sécurité <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black opacity-90 mb-8">Questions fréquentes</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white border border-black/[0.04] rounded-2xl p-6 hover:border-black/[0.08] transition-all">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="text-lg font-medium text-black pr-8 group-open:text-[#96A982] transition-colors">{faq.question}</h3>
                    <ChevronDown className="w-5 h-5 text-black/30 group-open:rotate-180 transition-transform flex-shrink-0" />
                  </summary>
                  <p className="mt-4 text-black/50 font-medium leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-16 text-center bg-black rounded-3xl p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-4">Démarrez gratuitement</h2>
            <p className="text-white/60 text-lg font-medium mb-8 max-w-lg mx-auto">5 Go de stockage offerts. Aucune carte bancaire requise.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-colors">
              Créer un compte gratuit <ArrowRight className="w-4 h-4" />
            </Link>
          </section>

          {/* Lire aussi */}
          <section>
            <h2 className="text-xl font-medium tracking-tight text-black opacity-90 mb-6">Lire aussi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPages.map((page, i) => (
                <Link key={i} href={page.href} className="group bg-[#f5f5f7] rounded-2xl p-6 border border-black/[0.03] hover:border-black/[0.08] transition-all">
                  <span className="text-base font-medium text-black group-hover:text-[#96A982] transition-colors">{page.label}</span>
                  <ArrowRight className="w-4 h-4 text-black/30 mt-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
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
              <div className="md:col-span-5 grid grid-cols-3 gap-10 md:justify-items-end text-left">
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
                  <h4 className="text-sm font-bold text-black uppercase tracking-[0.2em]">Solutions</h4>
                  <ul className="space-y-5 text-[17px] text-black/40 font-medium">
                    <li><Link href="/data-room-virtuelle" className="hover:text-black transition-colors">Data Room</Link></li>
                    <li><Link href="/partage-dossier-securise" className="hover:text-black transition-colors">Partage Sécurisé</Link></li>
                    <li><Link href="/pour-avocats" className="hover:text-black transition-colors">Pour Avocats</Link></li>
                    <li><Link href="/alternative-google-drive-pro" className="hover:text-black transition-colors">Alternative Drive</Link></li>
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
                <a href="https://twitter.com/airlck" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors font-semibold">X (Twitter)</a>
              </div>
              <p className="text-black/20 text-[11px] font-bold uppercase tracking-[0.4em]">&copy; 2025 AIRLOCK TECHNOLOGIES</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
