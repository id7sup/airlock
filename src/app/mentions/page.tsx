import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { legalMetadata, breadcrumbSchema } from "@/lib/seo";
import { StructuredData } from "@/components/shared/StructuredData";

export const metadata: Metadata = legalMetadata;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://airlck.com";

const breadcrumbData = breadcrumbSchema([
  { name: "Accueil", url: siteUrl },
  { name: "Mentions Légales", url: `${siteUrl}/mentions` },
]);

export default function MentionsPage() {
  return (
    <>
      <StructuredData />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
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
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-black mb-8 opacity-90">Mentions Légales</h1>
          <p className="text-lg text-black/40 font-medium mb-12">Dernière mise à jour : 24 janvier 2026</p>

          <div className="space-y-12 text-black/60 font-medium leading-relaxed">
            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">1. Éditeur du site</h2>
              <div className="space-y-2">
                <p><strong>Nom :</strong> Joseph Michaut</p>
                <p><strong>Adresse :</strong> 1 rue Saint-Laud, 49100 Angers, France</p>
                <p><strong>Email :</strong> <a href="mailto:contact@airlck.com" className="text-[#96A982] hover:underline">contact@airlck.com</a></p>
                <p><strong>Directeur de publication :</strong> Joseph Michaut</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">2. Hébergement</h2>
              <div className="space-y-2">
                <p>Le site est hébergé par :</p>
                <p><strong>IONOS SE</strong></p>
                <p>7 place de la Gare</p>
                <p>57200 Sarreguemines</p>
                <p>France</p>
                <p className="mt-4">La plateforme est hébergée sur un serveur VPS IONOS.</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">3. Propriété intellectuelle</h2>
              <p>
                L'ensemble des éléments du site Airlock (textes, images, logos, icônes, graphismes, code, etc.) est protégé par le droit de la propriété intellectuelle.
              </p>
              <p className="mt-4">
                Sauf mention contraire, ces éléments sont la propriété exclusive de Joseph Michaut.
              </p>
              <p className="mt-4">
                Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation préalable écrite, est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">4. Accès et utilisation du service</h2>
              <p className="mb-4">
                L'accès à la plateforme Airlock est réservé aux utilisateurs disposant d'un compte.
              </p>
              <p className="mb-4">
                L'utilisateur s'engage à utiliser le service de manière conforme à la loi et à sa finalité, et notamment à ne pas :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>utiliser le service à des fins illégales ou frauduleuses ;</li>
                <li>porter atteinte aux droits de tiers ;</li>
                <li>perturber le bon fonctionnement de la plateforme ;</li>
                <li>partager des contenus illicites ou contraires à la réglementation en vigueur.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">5. Responsabilité</h2>
              <div className="space-y-4">
                <p>
                  Le service est fourni « en l'état ». Des interruptions temporaires peuvent survenir, notamment pour des raisons de maintenance ou de mise à jour.
                </p>
                <p>
                  L'utilisateur reste seul responsable des contenus qu'il partage via la plateforme.
                </p>
                <p>
                  L'éditeur ne saurait être tenu responsable des dommages résultant de l'utilisation du service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">6. Données personnelles</h2>
              <p>
                Le traitement des données personnelles est régi par la <Link href="/confidentialite" className="text-[#96A982] hover:underline">Politique de Confidentialité</Link> accessible sur le site.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">7. Liens externes</h2>
              <p>
                La plateforme peut contenir des liens vers des sites tiers.
              </p>
              <p className="mt-4">
                L'éditeur n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">8. Modification des mentions légales</h2>
              <p>
                Les présentes mentions légales peuvent être modifiées à tout moment.
              </p>
              <p className="mt-4">
                Les utilisateurs sont invités à les consulter régulièrement.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">9. Droit applicable</h2>
              <p>
                Les présentes mentions légales sont soumises au droit français.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6 opacity-90">10. Contact</h2>
              <p>
                Pour toute question concernant la plateforme ou les présentes mentions légales :
              </p>
              <div className="mt-4">
                <p><a href="mailto:contact@airlck.com" className="text-[#96A982] hover:underline">contact@airlck.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

