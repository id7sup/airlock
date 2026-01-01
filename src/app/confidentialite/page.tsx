import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Politique de Confidentialité | Airlock",
  description: "Politique de confidentialité d'Airlock - Protection de vos données personnelles",
};

export default function ConfidentialitePage() {
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
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-black mb-8">Politique de Confidentialité</h1>
          <p className="text-lg text-black/40 font-medium mb-12">Dernière mise à jour : 1er janvier 2025</p>

          <div className="space-y-12 text-black/60 font-medium leading-relaxed">
            <section>
              <h2 className="text-3xl font-medium text-black mb-6">1. Introduction</h2>
              <p>
                Airlock Technologies ("nous", "notre", "nos") s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles lorsque vous utilisez notre service de partage de fichiers sécurisé.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">2. Informations que nous collectons</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-black mb-3">2.1 Informations de compte</h3>
                  <p>Lors de la création de votre compte, nous collectons :</p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                    <li>Votre adresse e-mail</li>
                    <li>Votre nom (si fourni)</li>
                    <li>Les informations d'authentification via Clerk</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-black mb-3">2.2 Données d'utilisation</h3>
                  <p>Nous collectons automatiquement des informations sur votre utilisation du service :</p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                    <li>Les fichiers que vous uploadez et partagez</li>
                    <li>Les liens de partage que vous créez</li>
                    <li>Les interactions avec les fichiers partagés (vues, téléchargements)</li>
                    <li>Les logs d'accès et les métadonnées techniques</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">3. Comment nous utilisons vos informations</h2>
              <p>Nous utilisons vos informations pour :</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                <li>Fournir et améliorer notre service de partage de fichiers</li>
                <li>Gérer votre compte et vos préférences</li>
                <li>Assurer la sécurité et prévenir les abus</li>
                <li>Vous envoyer des notifications importantes concernant votre compte</li>
                <li>Analyser l'utilisation du service pour améliorer l'expérience utilisateur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">4. Stockage et sécurité</h2>
              <div className="space-y-4">
                <p>
                  Vos fichiers sont stockés de manière sécurisée sur des serveurs S3 compatibles. Nous utilisons des technologies de chiffrement pour protéger vos données en transit et au repos.
                </p>
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre tout accès non autorisé, perte, destruction ou altération.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">5. Partage de vos informations</h2>
              <p>
                Nous ne vendons, ne louons ni ne partageons vos informations personnelles avec des tiers, sauf dans les cas suivants :
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                <li>Avec votre consentement explicite</li>
                <li>Pour se conformer à des obligations légales</li>
                <li>Pour protéger nos droits et notre sécurité</li>
                <li>Avec nos prestataires de services (hébergement, authentification) sous contrat de confidentialité</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">6. Vos droits</h2>
              <p>Conformément au RGPD et aux lois applicables, vous avez le droit de :</p>
              <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                <li>Accéder à vos données personnelles</li>
                <li>Rectifier vos données personnelles</li>
                <li>Demander la suppression de vos données</li>
                <li>Vous opposer au traitement de vos données</li>
                <li>Demander la portabilité de vos données</li>
                <li>Retirer votre consentement à tout moment</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@airlck.com" className="text-[#96A982] hover:underline">privacy@airlck.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">7. Conservation des données</h2>
              <p>
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir le service et respecter nos obligations légales. Lorsque vous supprimez votre compte, nous supprimons vos données personnelles dans un délai de 30 jours, sauf obligation légale de conservation.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">8. Cookies et technologies similaires</h2>
              <p>
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience, analyser l'utilisation du service et assurer la sécurité. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">9. Modifications de cette politique</h2>
              <p>
                Nous pouvons modifier cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement important par e-mail ou via une notification dans le service. La date de dernière mise à jour est indiquée en haut de cette page.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-medium text-black mb-6">10. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles, contactez-nous à :
              </p>
              <div className="mt-4 space-y-2">
                <p><strong>Email :</strong> <a href="mailto:privacy@airlck.com" className="text-[#96A982] hover:underline">privacy@airlck.com</a></p>
                <p><strong>Airlock Technologies</strong></p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

