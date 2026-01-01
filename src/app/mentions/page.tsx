import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Mentions Légales | Airlock",
  description: "Mentions légales d'Airlock - Informations légales et conditions d'utilisation",
};

export default function MentionsPage() {
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
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-black mb-8">Mentions Légales</h1>
          <p className="text-lg text-black/40 font-medium mb-12">Dernière mise à jour : 1er janvier 2025</p>

          <div className="space-y-12 text-black/60 font-medium leading-relaxed">
            <section>
              <h2 className="text-3xl font-medium text-black mb-6">1. Éditeur du site</h2>
              <div className="space-y-2">
                <p><strong>Raison sociale :</strong> Airlock Technologies</p>
                <p><strong>Forme juridique :</strong> Société</p>
                <p><strong>Adresse :</strong> [À compléter]</p>
                <p><strong>Email :</strong> <a href="mailto:contact@airlck.com" className="text-[#96A982] hover:underline">contact@airlck.com</a></p>
                <p><strong>Directeur de publication :</strong> [À compléter]</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">2. Hébergement</h2>
              <div className="space-y-2">
                <p>Le site est hébergé par :</p>
                <p><strong>Hébergeur :</strong> [À compléter]</p>
                <p><strong>Adresse :</strong> [À compléter]</p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">3. Propriété intellectuelle</h2>
              <p>
                L'ensemble des éléments du site Airlock (textes, images, logos, icônes, graphismes, etc.) sont la propriété exclusive d'Airlock Technologies, sauf mention contraire.
              </p>
              <p className="mt-4">
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable d'Airlock Technologies.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">4. Conditions d'utilisation</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-black mb-3">4.1 Accès au service</h3>
                  <p>
                    L'utilisation du service Airlock implique l'acceptation pleine et entière des conditions générales d'utilisation. Le service est accessible aux utilisateurs ayant créé un compte.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-black mb-3">4.2 Utilisation du service</h3>
                  <p>L'utilisateur s'engage à :</p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                    <li>Utiliser le service conformément à sa destination</li>
                    <li>Ne pas utiliser le service à des fins illégales ou frauduleuses</li>
                    <li>Ne pas perturber le fonctionnement du service</li>
                    <li>Respecter les droits de propriété intellectuelle</li>
                    <li>Ne pas partager de contenu illicite, diffamatoire ou portant atteinte aux droits de tiers</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">5. Responsabilité</h2>
              <div className="space-y-4">
                <p>
                  Airlock Technologies s'efforce d'assurer la disponibilité et le bon fonctionnement du service. Cependant, nous ne pouvons garantir une disponibilité ininterrompue du service.
                </p>
                <p>
                  L'utilisateur est seul responsable du contenu qu'il partage via le service. Airlock Technologies ne peut être tenu responsable du contenu partagé par les utilisateurs.
                </p>
                <p>
                  En aucun cas Airlock Technologies ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">6. Protection des données</h2>
              <p>
                Le traitement de vos données personnelles est régi par notre <Link href="/confidentialite" className="text-[#96A982] hover:underline">Politique de Confidentialité</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">7. Liens externes</h2>
              <p>
                Le site peut contenir des liens vers des sites externes. Airlock Technologies n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur politique de confidentialité.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">8. Modification des conditions</h2>
              <p>
                Airlock Technologies se réserve le droit de modifier à tout moment les présentes mentions légales. Les utilisateurs sont invités à les consulter régulièrement.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">9. Droit applicable et juridiction</h2>
              <p>
                Les présentes mentions légales sont régies par le droit français. En cas de litige, et à défaut d'accord amiable, le litige sera porté devant les tribunaux compétents.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">10. Contact</h2>
              <p>
                Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter à :
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email :</strong> <a href="mailto:contact@airlck.com" className="text-[#96A982] hover:underline">contact@airlck.com</a></p>
                <p><strong>Airlock Technologies</strong></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

