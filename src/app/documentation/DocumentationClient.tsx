"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import {
  Search, Shield, Server, HardDrive, KeyRound, Share2,
  BarChart3, Globe2, Fingerprint, Scale, Lock, RefreshCw,
  AlertTriangle, Mail, Menu, X, ChevronRight, ArrowLeft, ArrowRight, ChevronDown
} from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────

interface SubSection {
  id: string;
  title: string;
}

interface PageDef {
  id: string;
  label: string;
  icon: React.ElementType;
  subSections: SubSection[];
  content: () => ReactNode;
  searchText: string;
}

interface Category {
  title: string;
  pages: PageDef[];
}

// ─── Contenu de chaque page ──────────────────────────────────────

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[17px] font-semibold text-black mb-3 tracking-tight">{children}</h3>
  );
}

function InfoCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#f8f8fa] rounded-2xl p-6 border border-black/[0.04] ${className}`}>
      {children}
    </div>
  );
}

function TipCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-[#96A982]/[0.06] rounded-2xl p-6 border border-[#96A982]/[0.12]">
      <p className="text-[13px] font-bold text-[#96A982] mb-2 tracking-wide">{title}</p>
      {children}
    </div>
  );
}

function StatGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-black/30 text-[11px] uppercase tracking-wider font-semibold mb-1.5">{label}</p>
          <p className="text-black font-semibold leading-snug">{value}</p>
        </div>
      ))}
    </div>
  );
}

function PresentationContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Présentation d'Airlock</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Dernière mise à jour : 14 février 2026</p>

      <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-8">
        <strong className="text-black/90">Airlock</strong> est une plateforme de partage de fichiers sécurisé conçue pour les professionnels qui exigent un contrôle total sur leurs données. La plateforme permet d'uploader des fichiers, de les organiser en dossiers, et de les partager via des liens sécurisés avec des contrôles d'accès avancés.
      </p>

      <div id="presentation-societe" className="scroll-mt-24 mb-10">
        <InfoCard>
          <h4 className="text-[11px] font-bold text-black/50 uppercase tracking-[0.12em] mb-5">Informations sur la société</h4>
          <StatGrid items={[
            ["Fondateur & Éditeur", "Joseph Michaut"],
            ["Siège social", "1 rue Saint-Laud, 49100 Angers, France"],
            ["Contact", "contact@airlck.com"],
            ["Fondation", "2025"],
          ]} />
        </InfoCard>
      </div>

      <div id="presentation-cible" className="scroll-mt-24 mb-10">
        <SectionHeading>À qui s'adresse Airlock ?</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Airlock s'adresse en particulier aux avocats, cabinets de conseil, fonds d'investissement, startups et toute organisation manipulant des documents sensibles nécessitant un partage contrôlé et traçable.
        </p>
      </div>

      <div id="presentation-fonctionnement" className="scroll-mt-24">
        <SectionHeading>Fonctionnement général</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          La plateforme fonctionne comme une <strong className="text-black/90">data room virtuelle simplifiée</strong> : vous créez des dossiers, y déposez vos fichiers, puis générez des liens de partage avec des règles d'accès précises (expiration, mot de passe, quota de vues, révocation instantanée, restriction de domaine, watermarking).
        </p>
      </div>
    </>
  );
}

function InfrastructureContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Infrastructure & Hébergement</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Architecture distribuée, hébergement européen</p>

      <div id="infra-serveur" className="scroll-mt-24 mb-10">
        <SectionHeading>Serveur applicatif</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-5">
          L'application Airlock est hébergée sur un <strong className="text-black/90">serveur VPS IONOS</strong>, situé en France (Sarreguemines). Ce serveur est géré par IONOS SE, un hébergeur européen reconnu, filiale de United Internet AG.
        </p>
        <InfoCard>
          <StatGrid items={[
            ["Hébergeur", "IONOS SE"],
            ["Localisation", "France (Europe)"],
            ["Type", "VPS (Virtual Private Server)"],
            ["Adresse hébergeur", "7 place de la Gare, 57200 Sarreguemines"],
          ]} />
        </InfoCard>
      </div>

      <div id="infra-architecture" className="scroll-mt-24 mb-10">
        <SectionHeading>Architecture technique</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">Le serveur exécute la pile technique suivante :</p>
        <div className="space-y-3">
          {[
            ["Next.js 16", "(App Router) — framework React full-stack avec Server Components par défaut"],
            ["React 19", "— bibliothèque d'interface utilisateur"],
            ["PM2", "— gestionnaire de processus Node.js (redémarrage automatique, monitoring)"],
            ["Nginx", "— reverse proxy, terminaison SSL, mise en cache statique"],
            ["TypeScript", "— typage statique pour la fiabilité du code"],
          ].map(([name, desc]) => (
            <div key={name} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{name}</strong> {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="infra-r2" className="scroll-mt-24 mb-10">
        <SectionHeading>Stockage fichiers (Cloudflare R2)</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Les fichiers uploadés par les utilisateurs ne sont <strong className="text-black/90">pas stockés sur le serveur IONOS</strong>. Ils sont stockés sur <strong className="text-black/90">Cloudflare R2</strong>, un service de stockage objet distribué mondialement, compatible avec l'API S3 d'Amazon. Cloudflare R2 garantit une réplication automatique des données sur plusieurs régions pour une durabilité maximale.
        </p>
      </div>

      <div id="infra-firestore" className="scroll-mt-24 mb-10">
        <SectionHeading>Base de données (Firestore)</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Les métadonnées (informations sur les dossiers, fichiers, liens de partage, permissions, analytics) sont stockées dans <strong className="text-black/90">Google Cloud Firestore</strong>, une base de données NoSQL gérée par Google. Firestore offre des sauvegardes automatiques, une réplication multi-région, et une haute disponibilité (SLA 99.999%).
        </p>
      </div>

      <div id="infra-clerk" className="scroll-mt-24 mb-10">
        <SectionHeading>Authentification (Clerk)</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          La gestion de l'authentification est déléguée à <strong className="text-black/90">Clerk</strong>, un service spécialisé dans l'authentification sécurisée. Clerk gère les sessions, le SSO Google, la protection des comptes, et respecte les standards de sécurité (SOC 2 Type II).
        </p>
      </div>

      <TipCard title="En résumé">
        <p className="text-[13px] text-black/60 font-medium leading-[1.7]">
          Aucune donnée utilisateur n'est stockée directement sur le serveur IONOS. Le serveur sert uniquement à exécuter l'application. Les fichiers sont sur Cloudflare R2, les métadonnées sur Google Firestore, et l'authentification sur Clerk. Cette séparation des responsabilités renforce la sécurité et la résilience.
        </p>
      </TipCard>
    </>
  );
}

function StockageContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Stockage des fichiers</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Chiffrement, accès éphémères, organisation</p>

      <div id="stockage-r2" className="scroll-mt-24 mb-10">
        <SectionHeading>Cloudflare R2</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Cloudflare R2 est un service de stockage objet compatible S3 qui offre une durabilité de <strong className="text-black/90">99.999999999% (11 neufs)</strong>. Les fichiers sont automatiquement répliqués sur plusieurs centres de données pour garantir leur disponibilité, même en cas de panne d'un datacenter.
        </p>
      </div>

      <div id="stockage-chiffrement" className="scroll-mt-24 mb-10">
        <SectionHeading>Chiffrement</SectionHeading>
        <div className="space-y-3">
          {[
            ["Chiffrement au repos (at-rest)", "Tous les fichiers stockés sur R2 sont chiffrés avec l'algorithme AES-256, le standard utilisé par les gouvernements et les institutions financières."],
            ["Chiffrement en transit (in-transit)", "Toutes les communications entre votre navigateur et nos serveurs, et entre nos serveurs et R2, sont protégées par TLS 1.3, la version la plus récente et la plus sécurisée du protocole."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="stockage-acces" className="scroll-mt-24 mb-10">
        <SectionHeading>Accès aux fichiers</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-5">
          Les fichiers stockés sur R2 ne sont <strong className="text-black/90">jamais accessibles directement via une URL publique</strong>. L'accès se fait exclusivement via des <strong className="text-black/90">URLs présignées éphémères</strong> (presigned URLs), générées à la demande par le serveur.
        </p>
        <InfoCard>
          <h4 className="text-[13px] font-bold text-black/80 mb-4">Comment fonctionnent les URLs présignées ?</h4>
          <div className="space-y-3">
            {[
              "L'utilisateur clique sur \"Télécharger\" ou \"Visualiser\".",
              "Le serveur vérifie les permissions (authentification, token de partage, mot de passe, quota, expiration).",
              "Si autorisé, le serveur génère une URL temporaire valide 1 heure maximum (3600 secondes).",
              "L'utilisateur accède au fichier via cette URL temporaire.",
              "Après expiration, l'URL devient inutilisable, même si elle est interceptée.",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3.5 text-[13px]">
                <span className="w-5 h-5 rounded-full bg-[#96A982]/10 text-[#96A982] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-black/60 font-medium leading-[1.65]">{step}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      <div id="stockage-organisation" className="scroll-mt-24 mb-10">
        <SectionHeading>Organisation du stockage</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Les fichiers sont organisés dans R2 selon une structure hiérarchique : <code className="bg-[#f5f5f7] px-2 py-0.5 rounded-md text-[13px] text-black/70 font-mono">{"{workspaceId}/{folderId}/{fileId}-{filename}"}</code>. Cette structure garantit l'isolation entre les workspaces et empêche tout accès croisé entre les comptes utilisateurs.
        </p>
      </div>

      <div id="stockage-upload" className="scroll-mt-24">
        <SectionHeading>Flux d'upload</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">
          L'upload des fichiers est <strong className="text-black/90">direct vers Cloudflare R2</strong> (pas de transit par le serveur IONOS) :
        </p>
        <div className="space-y-3">
          {[
            "L'utilisateur sélectionne un fichier à uploader.",
            "Le serveur génère une URL présignée d'upload vers R2.",
            "Le fichier est envoyé directement du navigateur vers R2 (bypass serveur, meilleure bande passante).",
            "Une fois l'upload confirmé, les métadonnées sont enregistrées dans Firestore.",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3.5 text-[15px]">
              <span className="w-5 h-5 rounded-full bg-black/[0.06] text-black/40 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-black/60 font-medium leading-[1.75]">{step}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[15px] text-black/60 font-medium leading-[1.75]">
          Ce processus évite que le fichier transite par notre serveur, réduisant ainsi les risques de fuite et améliorant les performances.
        </p>
      </div>
    </>
  );
}

function AuthentificationContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Authentification & Comptes</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Sessions sécurisées, SSO, isolation des données</p>

      <div id="auth-clerk" className="scroll-mt-24 mb-10">
        <SectionHeading>Clerk</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">
          L'authentification est entièrement gérée par <strong className="text-black/90">Clerk</strong>, un fournisseur d'authentification tiers certifié <strong className="text-black/90">SOC 2 Type II</strong>. Cela signifie que :
        </p>
        <div className="space-y-3">
          {[
            ["Aucun mot de passe stocké", "Airlock ne stocke aucun mot de passe dans sa base de données."],
            ["Sessions JWT sécurisées", "Les sessions sont gérées par des tokens JWT sécurisés."],
            ["SSO Google", "La connexion via SSO Google est disponible (OAuth 2.0)."],
            ["Protection anti-brute-force", "Clerk gère la protection contre le brute-force, le rate limiting, et la détection de bots."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="auth-routes" className="scroll-mt-24 mb-10">
        <SectionHeading>Protection des routes</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Toutes les routes de l'application sont protégées par défaut. Seules les pages publiques (page d'accueil, tarifs, sécurité, FAQ, pages légales, pages de partage) sont accessibles sans authentification. Chaque requête vers une route protégée vérifie la validité de la session Clerk.
        </p>
      </div>

      <div id="auth-isolation" className="scroll-mt-24">
        <SectionHeading>Isolation des données</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Chaque utilisateur est identifié par un <code className="bg-[#f5f5f7] px-2 py-0.5 rounded-md text-[13px] text-black/70 font-mono">userId</code> unique. Toutes les opérations vérifient systématiquement que l'utilisateur a les permissions nécessaires. Un utilisateur ne peut <strong className="text-black/90">jamais</strong> accéder aux dossiers ou fichiers d'un autre utilisateur, sauf via un lien de partage explicitement créé.
        </p>
      </div>
    </>
  );
}

function PartageContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Partage de fichiers & Contrôle d'accès</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Tokens sécurisés, liens indépendants, permissions granulaires</p>

      <div id="partage-tokens" className="scroll-mt-24 mb-10">
        <SectionHeading>Tokens de partage</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Chaque lien de partage est associé à un <strong className="text-black/90">token unique de 64 caractères hexadécimaux</strong> (256 bits d'entropie), généré de manière cryptographiquement sécurisée. Ce token est <strong className="text-black/90">hashé avec SHA-256</strong> avant d'être stocké en base de données. Même en cas de compromission de la base de données, les tokens originaux ne peuvent pas être retrouvés.
        </p>
      </div>

      <div id="partage-independance" className="scroll-mt-24 mb-10">
        <SectionHeading>Indépendance des liens</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Chaque lien de partage est <strong className="text-black/90">totalement indépendant</strong>. Un dossier peut avoir plusieurs liens de partage actifs simultanément, chacun avec ses propres règles. Modifier ou révoquer un lien n'affecte jamais les autres liens pointant vers le même dossier.
        </p>
      </div>

      <div id="partage-controles" className="scroll-mt-24 mb-10">
        <SectionHeading>Contrôles disponibles</SectionHeading>
        <InfoCard>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-[13px]">
            {[
              ["Date d'expiration", "Le lien cesse de fonctionner automatiquement après la date choisie."],
              ["Mot de passe", "Hashé avec bcrypt, le visiteur doit le saisir pour accéder aux fichiers."],
              ["Quota de vues", "Limitez le nombre total d'ouvertures du lien. Dès que le quota est atteint, le lien se désactive."],
              ["Révocation instantanée", "Désactivez un lien en un clic. L'effet est immédiat et irréversible pour les visiteurs."],
              ["Restriction de domaine", "Restreignez l'accès à certains domaines email pour cibler précisément qui peut consulter vos fichiers."],
              ["Blocage VPN", "Bloquez les accès depuis des VPN ou proxys anonymes pour renforcer la traçabilité."],
              ["Watermarking", "Ajoutez un filigrane aux documents consultés en lecture seule pour dissuader la copie."],
              ["Permissions granulaires", "Contrôlez précisément : téléchargement autorisé, visualisation en ligne, accès aux sous-dossiers."],
            ].map(([title, desc]) => (
              <div key={title}>
                <p className="font-bold text-black/80 mb-1">{title}</p>
                <p className="text-black/45 leading-[1.6] font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      <div id="partage-permissions" className="scroll-mt-24">
        <SectionHeading>Permissions internes</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">
          En plus des liens de partage, Airlock gère des permissions internes entre utilisateurs avec trois niveaux de rôles :
        </p>
        <div className="space-y-3">
          {[
            ["OWNER", "Contrôle total (création, modification, suppression, partage)."],
            ["EDITOR", "Peut ajouter et modifier des fichiers, mais ne peut pas supprimer le dossier ou gérer les partages."],
            ["VIEWER", "Accès en lecture seule, avec option de téléchargement contrôlée par le propriétaire."],
          ].map(([role, desc]) => (
            <div key={role} className="flex items-start gap-3 text-[15px]">
              <code className="bg-[#f5f5f7] px-2 py-0.5 rounded-md text-[12px] text-black/70 font-mono font-bold shrink-0 mt-0.5">{role}</code>
              <p className="text-black/60 font-medium leading-[1.75]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function SecuriteContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Sécurité technique</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Chiffrement, protection applicative, détection de menaces</p>

      <div id="secu-chiffrement" className="scroll-mt-24 mb-10">
        <SectionHeading>Chiffrement</SectionHeading>
        <div className="space-y-3">
          {[
            ["HTTPS forcé (TLS 1.3)", "Toutes les communications sont chiffrées. Les protocoles inférieurs à TLS 1.2 sont refusés."],
            ["Certificat SSL", "Géré et renouvelé automatiquement."],
            ["Chiffrement au repos (AES-256)", "Tous les fichiers stockés sur Cloudflare R2 sont chiffrés."],
            ["Tokens hashés (SHA-256)", "Les tokens de partage sont stockés sous forme de hash irréversible."],
            ["Mots de passe hashés (bcrypt)", "Les mots de passe de protection des liens sont hashés avec bcrypt."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="secu-applicative" className="scroll-mt-24 mb-10">
        <SectionHeading>Protection applicative</SectionHeading>
        <div className="space-y-3">
          {[
            ["Protection CSRF", "Validation des requêtes via les mécanismes intégrés de Next.js (Server Actions avec tokens)."],
            ["Protection XSS", "React échappe automatiquement les valeurs injectées dans le DOM."],
            ["Protection injection", "Firestore empêche nativement les injections SQL/NoSQL. Les entrées utilisateur sont validées côté serveur."],
            ["Validation côté serveur", "Toutes les mutations passent par des Server Actions qui vérifient systématiquement les permissions."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="secu-cles" className="scroll-mt-24 mb-10">
        <SectionHeading>Clés API et secrets</SectionHeading>
        <div className="space-y-3">
          {[
            "Les clés Firebase Admin, Clerk, et S3 (R2) ne sont jamais exposées côté client.",
            "Seules les clés publiques (préfixées NEXT_PUBLIC_) sont accessibles côté navigateur.",
            "Les secrets sont stockés en variables d'environnement sur le serveur, jamais dans le code source.",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="secu-menaces" className="scroll-mt-24">
        <SectionHeading>Détection de menaces</SectionHeading>
        <div className="space-y-3">
          {[
            ["Détection de bots", "Analyse du User-Agent pour identifier les bots de prévisualisation, crawlers et scanners."],
            ["Détection VPN/Proxy", "Identification des ISP connus (NordVPN, ExpressVPN, etc.) et des datacenters (AWS, Google Cloud, etc.)."],
            ["Détection d'anomalies", "Suivi des changements d'IP et de device brusques dans une même session."],
            ["Cache géo-IP", "Les résultats de géolocalisation sont mis en cache 24h en mémoire pour limiter les appels API."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AnalyticsContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Suivi & Analytics des partages</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Événements, données collectées, transparence</p>

      <div id="analytics-events" className="scroll-mt-24 mb-10">
        <SectionHeading>Événements trackés</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-5">Lorsqu'un visiteur ouvre un lien de partage, Airlock enregistre un événement d'analytics :</p>
        <InfoCard>
          <div className="space-y-3.5">
            {[
              ["OPEN_SHARE", "Ouverture d'un lien de partage (première page)."],
              ["VIEW_FILE", "Visualisation d'un fichier dans le navigateur."],
              ["VIEW_FILE_WATERMARKED", "Visualisation d'un fichier avec watermark (mode lecture seule)."],
              ["DOWNLOAD_FILE", "Téléchargement d'un fichier individuel."],
              ["DOWNLOAD_FOLDER", "Téléchargement d'un dossier complet (archive ZIP)."],
              ["OPEN_FOLDER", "Navigation dans un sous-dossier."],
              ["ACCESS_DENIED", "Tentative d'accès refusée (mauvais mot de passe, lien expiré, quota dépassé, VPN bloqué)."],
              ["LINK_PREVIEW", "Prévisualisation automatique par un bot (WhatsApp, Slack, iMessage, etc.)."],
            ].map(([code, desc]) => (
              <div key={code} className="flex items-start gap-3.5">
                <code className="bg-white border border-black/[0.06] px-2 py-0.5 rounded-md text-[11px] font-mono font-bold text-black/60 shrink-0 mt-0.5">{code}</code>
                <p className="text-[13px] text-black/50 font-medium leading-[1.6]">{desc}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      <div id="analytics-donnees" className="scroll-mt-24 mb-10">
        <SectionHeading>Données collectées par événement</SectionHeading>
        <div className="space-y-3">
          {[
            ["Géolocalisation approximative", "Ville, région et pays (dérivés de l'IP, jamais l'adresse exacte)."],
            ["Type de réseau", "Résidentiel, datacenter, VPN ou proxy anonyme."],
            ["Referer catégorisé", "D'où vient le visiteur (WhatsApp, LinkedIn, email, direct, etc.)."],
            ["User-Agent", "Navigateur et système d'exploitation."],
            ["Identifiant anonyme", "Hash SHA-256 de l'IP + User-Agent (voir section Identification)."],
            ["Score de confiance", "Probabilité que le visiteur soit un humain réel (vs. bot)."],
            ["Horodatage", "Date, heure et minute de l'événement."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="analytics-pas-collecte" className="scroll-mt-24">
        <TipCard title="Ce que nous ne collectons PAS">
          <div className="space-y-2">
            {[
              "L'adresse IP n'est jamais stockée — elle est utilisée uniquement pour la géolocalisation puis immédiatement jetée.",
              "Aucun cookie de tracking ou pixel espion.",
              "Aucune donnée comportementale (mouvements de souris, temps passé par page, etc.).",
              "Aucune intégration avec des régies publicitaires.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-[13px]">
                <div className="w-1 h-1 rounded-full bg-[#96A982]/50 mt-2 shrink-0" />
                <p className="text-black/55 font-medium leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
        </TipCard>
      </div>
    </>
  );
}

function LiveTrackingContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Suivi en direct (Live Tracking)</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Globe interactif, précision, détection de bots</p>

      <div id="live-globe" className="scroll-mt-24 mb-10">
        <SectionHeading>Globe en direct</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Airlock offre une fonctionnalité de <strong className="text-black/90">suivi en temps réel</strong> via un globe interactif (Mapbox GL). Cette fonctionnalité permet au propriétaire des liens de voir en un coup d'œil qui consulte ses fichiers partagés à un instant donné.
        </p>
      </div>

      <div id="live-fenetre" className="scroll-mt-24 mb-10">
        <SectionHeading>Fenêtre temporelle</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Le suivi en direct n'affiche que les <strong className="text-black/90">événements des 5 dernières minutes</strong>. Les événements plus anciens ne sont pas affichés sur le globe. La requête est limitée à 200 résultats maximum pour des raisons de performance.
        </p>
      </div>

      <div id="live-precision" className="scroll-mt-24 mb-10">
        <SectionHeading>Précision de la localisation</SectionHeading>
        <InfoCard>
          <p className="text-[13px] font-bold text-black/80 mb-5">La localisation affichée n'est JAMAIS l'adresse exacte du visiteur</p>
          <div className="space-y-5 text-[13px]">
            <div>
              <p className="font-semibold text-black/70 mb-1.5">Comment les coordonnées sont-elles déterminées ?</p>
              <p className="text-black/45 font-medium leading-[1.65]">
                L'adresse IP du visiteur est utilisée pour identifier la ville la plus proche via un service de géolocalisation (ipapi.co ou ip-api.com). Les coordonnées affichées sur le globe correspondent au <strong className="text-black/80">centre géographique de la ville identifiée</strong> (via GeoNames), pas à la position réelle du visiteur.
              </p>
            </div>
            <div>
              <p className="font-semibold text-black/70 mb-3">Précision selon le type de réseau</p>
              <div className="space-y-2.5">
                {[
                  ["Résidentiel / Mobile", "~5 km", "bg-[#96A982]/15 text-[#96A982]"],
                  ["VPN / Proxy anonyme", "~50 km", "bg-amber-500/10 text-amber-600"],
                  ["Datacenter / Hosting", "~100 km", "bg-red-500/10 text-red-500"],
                ].map(([type, radius, cls]) => (
                  <div key={type} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-black/[0.04]">
                    <span className="text-black/55 font-medium">{type}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cls}`}>{radius}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-black/70 mb-1.5">Aucune position GPS</p>
              <p className="text-black/45 font-medium leading-[1.65]">Airlock n'utilise aucune API de géolocalisation GPS du navigateur. La localisation est entièrement basée sur l'adresse IP et représente une approximation au niveau de la ville.</p>
            </div>
          </div>
        </InfoCard>
      </div>

      <div id="live-bots" className="scroll-mt-24 mb-10">
        <SectionHeading>Détection des bots</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Le système distingue automatiquement les visiteurs humains des <strong className="text-black/90">bots de prévisualisation</strong> (WhatsApp, Slack, iMessage, LinkedIn, Twitter, etc.) et des scanners antivirus. Les bots sont identifiés par leur User-Agent, marqués comme <code className="bg-[#f5f5f7] px-2 py-0.5 rounded-md text-[12px] text-black/70 font-mono">LINK_PREVIEW</code>, et filtrés dans les analytics.
        </p>
      </div>

      <div id="live-confiance" className="scroll-mt-24">
        <SectionHeading>Score de confiance visiteur</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">Chaque visiteur reçoit un <strong className="text-black/90">score de confiance de 0 à 100</strong> :</p>
        <div className="space-y-2.5">
          {[
            ["+40 pts", "JavaScript exécuté (beacon envoyé par le navigateur)", "text-[#96A982] bg-[#96A982]/10"],
            ["+20 pts", "Headers HTTP cohérents avec un navigateur moderne", "text-[#96A982] bg-[#96A982]/10"],
            ["-50 pts", "User-Agent correspond à un bot connu", "text-red-500 bg-red-500/10"],
            ["-10 pts", "IP provient d'un datacenter", "text-amber-600 bg-amber-500/10"],
          ].map(([points, desc, cls]) => (
            <div key={desc} className="flex items-start gap-3.5 text-[15px]">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 mt-0.5 ${cls}`}>{points}</span>
              <p className="text-black/60 font-medium leading-[1.75]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function IdentificationContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Identification des visiteurs</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Anonyme, sans cookies, respectueux de la vie privée</p>

      <div id="id-fingerprinting" className="scroll-mt-24 mb-10">
        <SectionHeading>Fingerprinting anonyme</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-5">
          Pour regrouper les événements d'un même visiteur sans utiliser de cookies, Airlock génère un <strong className="text-black/90">identifiant anonyme</strong> basé sur un hash SHA-256 de l'adresse IP et du User-Agent.
        </p>
        <InfoCard>
          <h4 className="text-[13px] font-bold text-black/80 mb-5">Deux types d'identifiants</h4>
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
              <p className="font-bold text-black/80 text-[13px] mb-1.5">visitorId <span className="font-medium text-black/30">(rotatif)</span></p>
              <p className="text-[13px] text-black/45 font-medium leading-[1.65]">
                Généré avec un sel qui <strong className="text-black/70">change chaque jour</strong>. Formule : <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[11px] text-black/60 font-mono">SHA-256(IP + UserAgent + sel_quotidien)</code>. Permet de regrouper les événements d'un même visiteur sur une journée, mais devient inutilisable le lendemain.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-black/[0.04]">
              <p className="font-bold text-black/80 text-[13px] mb-1.5">visitorIdStable <span className="font-medium text-black/30">(permanent)</span></p>
              <p className="text-[13px] text-black/45 font-medium leading-[1.65]">
                Généré avec un sel fixe. Formule : <code className="bg-[#f5f5f7] px-1.5 py-0.5 rounded text-[11px] text-black/60 font-mono">SHA-256(IP + UserAgent + sel_fixe)</code>. Permet de regrouper les événements d'un même visiteur sur plusieurs jours.
              </p>
            </div>
          </div>
        </InfoCard>
      </div>

      <div id="id-pourquoi" className="scroll-mt-24 mb-10">
        <SectionHeading>Pourquoi ce système ?</SectionHeading>
        <div className="space-y-3">
          {[
            ["Aucun cookie", "Pas besoin de bannière de cookies, conforme ePrivacy."],
            ["Aucun pixel espion", "Pas de pixel de tracking invisible."],
            ["IP jamais stockée", "Seul le hash est conservé, rendant impossible la reconstitution de l'IP originale."],
            ["Hash tronqué", "Le hash de l'IP (ipHash) est tronqué à 16 caractères pour réduire les risques de corrélation."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="id-limites" className="scroll-mt-24">
        <SectionHeading>Limites</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">
          Si un visiteur change d'adresse IP (ex: changement de réseau WiFi, passage en 4G) ou de navigateur, il sera considéré comme un nouveau visiteur. C'est un compromis délibéré : nous préférons sous-estimer le nombre de visiteurs uniques plutôt que de risquer de regrouper des personnes différentes.
        </p>
      </div>
    </>
  );
}

function RgpdContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Protection des données & RGPD</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Conformité, droits, sous-traitants</p>

      <div id="rgpd-conformite" className="scroll-mt-24 mb-10">
        <SectionHeading>Conformité RGPD</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">Airlock est conçu dès sa conception pour respecter le <strong className="text-black/90">RGPD</strong> :</p>
        <div className="space-y-3">
          {[
            ["Minimisation des données", "Nous ne collectons que les données strictement nécessaires."],
            ["Pas de vente de données", "Vos données ne sont jamais vendues, louées ou partagées à des fins commerciales."],
            ["Pas de tracking publicitaire", "Aucune régie publicitaire, aucun cookie tiers, aucun pixel de tracking."],
            ["Hébergement européen", "Le serveur est en France, les données sont hébergées en Europe."],
            ["Privacy by design", "La protection de la vie privée est intégrée dès la conception."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="rgpd-droits" className="scroll-mt-24 mb-10">
        <SectionHeading>Vos droits</SectionHeading>
        <InfoCard>
          <div className="space-y-4">
            {[
              ["Droit d'accès", "Demander une copie de toutes les données que nous détenons sur vous."],
              ["Droit de rectification", "Corriger des données inexactes ou incomplètes."],
              ["Droit à l'effacement", "Demander la suppression de vos données (sous 30 jours)."],
              ["Droit d'opposition", "Vous opposer au traitement de vos données."],
              ["Droit à la portabilité", "Récupérer vos données dans un format structuré et lisible."],
            ].map(([t, d]) => (
              <div key={t} className="flex items-start gap-3.5">
                <span className="text-[13px] font-bold text-black/75 shrink-0 min-w-[140px]">{t}</span>
                <p className="text-[13px] text-black/45 font-medium leading-[1.6]">{d}</p>
              </div>
            ))}
          </div>
        </InfoCard>
        <p className="mt-4 text-[15px] text-black/60 font-medium">Pour exercer ces droits : <a href="mailto:contact@airlck.com" className="text-[#96A982] hover:underline font-semibold">contact@airlck.com</a></p>
      </div>

      <div id="rgpd-base-legale" className="scroll-mt-24 mb-10">
        <SectionHeading>Base légale du traitement</SectionHeading>
        <div className="space-y-3">
          {[
            ["Exécution du contrat", "Stockage de vos fichiers, gestion de votre compte, partage de liens."],
            ["Intérêt légitime", "Analytics de partage, sécurité et détection de bots."],
            ["Obligation légale", "Conservation de certaines données imposée par la loi."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="rgpd-conservation" className="scroll-mt-24 mb-10">
        <SectionHeading>Durée de conservation</SectionHeading>
        <div className="space-y-3">
          {[
            ["Fichiers", "Conservés tant que le compte est actif. Supprimés sous 30 jours après la clôture."],
            ["Analytics", "Conservés pour la durée de vie du lien, consultables jusqu'à 30 jours."],
            ["Données de compte", "Supprimées sous 30 jours après demande."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="rgpd-sous-traitants" className="scroll-mt-24">
        <SectionHeading>Sous-traitants</SectionHeading>
        <InfoCard>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="text-left font-bold text-black/60 pb-3 pr-6">Sous-traitant</th>
                  <th className="text-left font-bold text-black/60 pb-3 pr-6">Rôle</th>
                  <th className="text-left font-bold text-black/60 pb-3">Localisation</th>
                </tr>
              </thead>
              <tbody className="text-black/50">
                {[
                  ["IONOS SE", "Hébergement serveur", "France / Allemagne"],
                  ["Cloudflare", "Stockage fichiers (R2)", "Réseau mondial (EU inclus)"],
                  ["Google Cloud", "Base de données (Firestore)", "Europe"],
                  ["Clerk", "Authentification", "USA (SOC 2 Type II)"],
                  ["Mapbox", "Visualisation globe", "USA"],
                ].map(([n, r, l]) => (
                  <tr key={n} className="border-b border-black/[0.03] last:border-0">
                    <td className="py-3 pr-6 font-semibold text-black/70">{n}</td>
                    <td className="py-3 pr-6 font-medium">{r}</td>
                    <td className="py-3 font-medium">{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoCard>
      </div>
    </>
  );
}

function ContinuiteContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Continuité de service & Perte de données</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Résilience, backups, procédures de reprise</p>

      <div id="continuite-panne" className="scroll-mt-24 mb-10">
        <SectionHeading>Que se passe-t-il si le serveur tombe en panne ?</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">En cas de panne du serveur IONOS, <strong className="text-black/90">aucune donnée n'est perdue</strong> car :</p>
        <div className="space-y-3">
          {[
            "Les fichiers sont sur Cloudflare R2 (indépendant du serveur).",
            "Les métadonnées sont sur Google Firestore (indépendant du serveur).",
            "L'authentification est sur Clerk (indépendant du serveur).",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]">{item}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[15px] text-black/60 font-medium leading-[1.75]">Le serveur peut être restauré ou remplacé rapidement, et toutes les données seront immédiatement accessibles.</p>
      </div>

      <div id="continuite-stockage" className="scroll-mt-24 mb-10">
        <SectionHeading>Résilience du stockage fichiers</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">Cloudflare R2 offre une <strong className="text-black/90">durabilité de 99.999999999%</strong> (11 neufs) grâce à la réplication automatique sur plusieurs centres de données.</p>
      </div>

      <div id="continuite-bdd" className="scroll-mt-24 mb-10">
        <SectionHeading>Résilience de la base de données</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75]">Google Cloud Firestore effectue des <strong className="text-black/90">sauvegardes automatiques continues</strong> avec une réplication multi-région et un SLA de 99.999%.</p>
      </div>

      <div id="continuite-monitoring" className="scroll-mt-24 mb-10">
        <SectionHeading>Monitoring et redémarrage automatique</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">L'application est gérée par <strong className="text-black/90">PM2</strong> :</p>
        <div className="space-y-3">
          {[
            "Redémarrage automatique en cas de crash.",
            "Surveillance CPU et mémoire.",
            "Logs pour le diagnostic.",
            "Disponibilité continue (uptime).",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="continuite-arret" className="scroll-mt-24">
        <SectionHeading>En cas d'arrêt définitif du service</SectionHeading>
        <div className="space-y-3">
          {[
            "Les utilisateurs seraient prévenus au minimum 90 jours à l'avance.",
            "Une période de téléchargement complet serait offerte.",
            "Les données seraient ensuite définitivement supprimées de tous les systèmes.",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function IncidentsContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">En cas de piratage ou de faille</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Architecture défensive, réponse aux incidents</p>

      <div id="incidents-defense" className="scroll-mt-24 mb-10">
        <SectionHeading>Architecture défensive</SectionHeading>
        <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-4">Airlock est conçu pour <strong className="text-black/90">minimiser l'impact d'une éventuelle intrusion</strong> :</p>
        <div className="space-y-3">
          {[
            ["Tokens hashés", "Même si un attaquant accède à Firestore, il ne peut pas reconstruire les tokens de partage originaux."],
            ["URLs présignées temporaires", "Même si une URL est interceptée, elle expire sous 1 heure maximum."],
            ["Pas de stockage d'IP", "Même en cas de fuite de la base analytics, les IP des visiteurs ne sont pas récupérables."],
            ["Secrets non exposés", "Les clés API critiques ne sont jamais présentes dans le code côté client."],
            ["Isolation des services", "Compromettre un service ne donne pas accès aux autres."],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3 text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#96A982] mt-2.5 shrink-0" />
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="incidents-procedure" className="scroll-mt-24 mb-10">
        <SectionHeading>Procédure de réponse aux incidents</SectionHeading>
        <div className="space-y-3">
          {[
            ["Identification et isolation", "Identification immédiate de la faille, isolation du système concerné."],
            ["Rotation des secrets", "Changement immédiat de toutes les clés API concernées."],
            ["Révocation", "Révocation de tous les liens de partage potentiellement compromis."],
            ["Notification", "Information des utilisateurs affectés dans les 72 heures conformément au RGPD."],
            ["Analyse post-incident", "Audit complet, correction de la faille."],
            ["Déclaration CNIL", "Si des données personnelles sont concernées, déclaration dans les 72 heures."],
          ].map(([title, desc], i) => (
            <div key={title} className="flex items-start gap-3.5 text-[15px]">
              <span className="w-5 h-5 rounded-full bg-black/[0.06] text-black/40 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-black/60 font-medium leading-[1.75]"><strong className="text-black/90">{title}</strong> — {desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="incidents-signalement" className="scroll-mt-24">
        <SectionHeading>Signalement d'une vulnérabilité</SectionHeading>
        <TipCard title="Responsible Disclosure">
          <p className="text-[13px] text-black/55 font-medium leading-[1.65]">
            Envoyez un email à <a href="mailto:contact@airlck.com" className="text-[#96A982] hover:underline font-semibold">contact@airlck.com</a> avec le sujet <strong className="text-black/80">"Vulnérabilité de sécurité"</strong>. Décrivez la faille, les étapes pour la reproduire, et l'impact potentiel. Nous nous engageons à répondre sous 48 heures.
          </p>
        </TipCard>
      </div>
    </>
  );
}

function ContactContent() {
  return (
    <>
      <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-black mb-2 leading-tight">Contact & Informations légales</h1>
      <p className="text-black/35 text-[13px] font-medium mb-10">Coordonnées et pages associées</p>

      <p className="text-[15px] text-black/60 font-medium leading-[1.75] mb-6">Pour toute question concernant cette documentation, la sécurité de vos données, ou le fonctionnement de la plateforme :</p>

      <InfoCard className="mb-8">
        <StatGrid items={[
          ["Email", "contact@airlck.com"],
          ["Éditeur", "Joseph Michaut"],
          ["Adresse", "1 rue Saint-Laud, 49100 Angers, France"],
          ["Site web", "airlck.com"],
        ]} />
      </InfoCard>

      <div>
        <SectionHeading>Autres pages légales</SectionHeading>
        <div className="space-y-3">
          {[
            ["/confidentialite", "Politique de Confidentialité", "Traitement des données personnelles et droits RGPD."],
            ["/mentions", "Mentions Légales", "Informations sur l'éditeur, conditions d'utilisation."],
            ["/security", "Page Sécurité", "Présentation de notre architecture de sécurité."],
          ].map(([href, label, desc]) => (
            <Link key={href} href={href} className="flex items-center gap-3 p-3.5 rounded-xl border border-black/[0.05] hover:border-[#96A982]/20 hover:bg-[#96A982]/[0.03] transition-all group">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-black/80 group-hover:text-[#96A982] transition-colors">{label}</p>
                <p className="text-[12px] text-black/40 font-medium mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-black/20 group-hover:text-[#96A982] transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Registre des pages ──────────────────────────────────────────

const categories: Category[] = [
  {
    title: "Général",
    pages: [
      { id: "presentation", label: "Présentation d'Airlock", icon: Shield, content: PresentationContent,
        subSections: [
          { id: "presentation-societe", title: "Informations société" },
          { id: "presentation-cible", title: "À qui s'adresse Airlock" },
          { id: "presentation-fonctionnement", title: "Fonctionnement général" },
        ],
        searchText: "présentation airlock société joseph michaut angers data room virtuelle avocats cabinets conseil fonds investissement startups documents sensibles partage contrôlé traçable fondateur éditeur" },
    ],
  },
  {
    title: "Infrastructure",
    pages: [
      { id: "infrastructure", label: "Hébergement", icon: Server, content: InfrastructureContent,
        subSections: [
          { id: "infra-serveur", title: "Serveur applicatif" },
          { id: "infra-architecture", title: "Architecture technique" },
          { id: "infra-r2", title: "Stockage fichiers (R2)" },
          { id: "infra-firestore", title: "Base de données" },
          { id: "infra-clerk", title: "Authentification" },
        ],
        searchText: "hébergement infrastructure ionos serveur vps france sarreguemines next.js react pm2 nginx typescript cloudflare r2 stockage objet s3 firestore google cloud base données clerk authentification soc2 architecture technique" },
      { id: "stockage", label: "Stockage des fichiers", icon: HardDrive, content: StockageContent,
        subSections: [
          { id: "stockage-r2", title: "Cloudflare R2" },
          { id: "stockage-chiffrement", title: "Chiffrement" },
          { id: "stockage-acces", title: "Accès aux fichiers" },
          { id: "stockage-organisation", title: "Organisation" },
          { id: "stockage-upload", title: "Flux d'upload" },
        ],
        searchText: "stockage fichiers cloudflare r2 chiffrement aes-256 tls 1.3 repos transit urls présignées éphémères presigned upload direct organisation workspace folder" },
      { id: "authentification", label: "Authentification", icon: KeyRound, content: AuthentificationContent,
        subSections: [
          { id: "auth-clerk", title: "Clerk" },
          { id: "auth-routes", title: "Protection des routes" },
          { id: "auth-isolation", title: "Isolation des données" },
        ],
        searchText: "authentification clerk soc2 mot de passe jwt sso google oauth brute-force rate limiting routes protégées isolation données userId permissions" },
    ],
  },
  {
    title: "Partage & Sécurité",
    pages: [
      { id: "partage", label: "Contrôle d'accès", icon: Share2, content: PartageContent,
        subSections: [
          { id: "partage-tokens", title: "Tokens de partage" },
          { id: "partage-independance", title: "Indépendance des liens" },
          { id: "partage-controles", title: "Contrôles disponibles" },
          { id: "partage-permissions", title: "Permissions internes" },
        ],
        searchText: "partage contrôle accès tokens sha-256 hexadécimaux liens indépendants expiration mot de passe quota vues révocation restriction domaine blocage vpn watermarking filigrane permissions owner editor viewer" },
      { id: "securite", label: "Sécurité technique", icon: Lock, content: SecuriteContent,
        subSections: [
          { id: "secu-chiffrement", title: "Chiffrement" },
          { id: "secu-applicative", title: "Protection applicative" },
          { id: "secu-cles", title: "Clés API et secrets" },
          { id: "secu-menaces", title: "Détection de menaces" },
        ],
        searchText: "sécurité technique https tls chiffrement aes-256 sha-256 bcrypt csrf xss injection sql nosql firestore clés api secrets next_public détection bots vpn proxy anomalies cache géo-ip" },
    ],
  },
  {
    title: "Analytics & Tracking",
    pages: [
      { id: "analytics", label: "Suivi des partages", icon: BarChart3, content: AnalyticsContent,
        subSections: [
          { id: "analytics-events", title: "Événements trackés" },
          { id: "analytics-donnees", title: "Données collectées" },
          { id: "analytics-pas-collecte", title: "Ce que nous ne collectons pas" },
        ],
        searchText: "suivi analytics partages événements open_share view_file download_file access_denied link_preview géolocalisation ville région pays réseau referer user-agent identifiant anonyme score confiance horodatage ip cookie pixel publicitaire" },
      { id: "live-tracking", label: "Suivi en direct", icon: Globe2, content: LiveTrackingContent,
        subSections: [
          { id: "live-globe", title: "Globe en direct" },
          { id: "live-fenetre", title: "Fenêtre temporelle" },
          { id: "live-precision", title: "Précision de la localisation" },
          { id: "live-bots", title: "Détection des bots" },
          { id: "live-confiance", title: "Score de confiance" },
        ],
        searchText: "suivi direct live tracking globe mapbox temps réel 5 minutes fenêtre temporelle précision localisation ville gps coordonnées geonames résidentiel mobile vpn datacenter bots prévisualisation whatsapp slack imessage score confiance javascript" },
      { id: "identification", label: "Identification visiteurs", icon: Fingerprint, content: IdentificationContent,
        subSections: [
          { id: "id-fingerprinting", title: "Fingerprinting anonyme" },
          { id: "id-pourquoi", title: "Pourquoi ce système" },
          { id: "id-limites", title: "Limites" },
        ],
        searchText: "identification visiteurs fingerprinting anonyme sha-256 visitorid rotatif stable sel quotidien fixe cookie pixel ip hash tronqué eprivacy limites changement adresse navigateur" },
    ],
  },
  {
    title: "Conformité & Légal",
    pages: [
      { id: "rgpd", label: "RGPD & Données", icon: Scale, content: RgpdContent,
        subSections: [
          { id: "rgpd-conformite", title: "Conformité RGPD" },
          { id: "rgpd-droits", title: "Vos droits" },
          { id: "rgpd-base-legale", title: "Base légale" },
          { id: "rgpd-conservation", title: "Durée de conservation" },
          { id: "rgpd-sous-traitants", title: "Sous-traitants" },
        ],
        searchText: "rgpd données protection conformité minimisation vente tracking publicitaire hébergement européen privacy design droits accès rectification effacement opposition portabilité base légale contrat intérêt légitime conservation fichiers analytics sous-traitants ionos cloudflare google clerk mapbox" },
      { id: "continuite", label: "Continuité de service", icon: RefreshCw, content: ContinuiteContent,
        subSections: [
          { id: "continuite-panne", title: "En cas de panne" },
          { id: "continuite-stockage", title: "Résilience stockage" },
          { id: "continuite-bdd", title: "Résilience base de données" },
          { id: "continuite-monitoring", title: "Monitoring" },
          { id: "continuite-arret", title: "Arrêt définitif" },
        ],
        searchText: "continuité service perte données panne serveur résilience stockage durabilité 99.999999999% réplication backup sauvegarde firestore pm2 monitoring redémarrage crash arrêt définitif 90 jours téléchargement suppression" },
      { id: "incidents", label: "Piratage & Failles", icon: AlertTriangle, content: IncidentsContent,
        subSections: [
          { id: "incidents-defense", title: "Architecture défensive" },
          { id: "incidents-procedure", title: "Procédure de réponse" },
          { id: "incidents-signalement", title: "Signalement" },
        ],
        searchText: "piratage faille sécurité intrusion architecture défensive tokens hashés urls présignées ip secrets isolation services procédure réponse incidents rotation révocation notification 72 heures cnil analyse audit vulnérabilité signalement" },
      { id: "contact", label: "Contact", icon: Mail, content: ContactContent,
        subSections: [],
        searchText: "contact email airlck.com joseph michaut angers france confidentialité mentions légales sécurité" },
    ],
  },
];

const allPages = categories.flatMap(c => c.pages);

// ─── Composant principal ─────────────────────────────────────────

export default function DocumentationClient() {
  const [activePage, setActivePage] = useState("presentation");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [mobileToC, setMobileToC] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentPage = useMemo(() => allPages.find(p => p.id === activePage) || allPages[0], [activePage]);

  // Find previous / next pages
  const currentIndex = useMemo(() => allPages.findIndex(p => p.id === activePage), [activePage]);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  // Current category
  const currentCategory = useMemo(
    () => categories.find(c => c.pages.some(p => p.id === activePage))?.title || "",
    [activePage]
  );

  // Résultats de recherche full-text
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allPages.filter(p =>
      p.label.toLowerCase().includes(q) ||
      p.searchText.toLowerCase().includes(q) ||
      p.subSections.some(s => s.title.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Reset search index when results change
  useEffect(() => {
    setSearchIndex(-1);
  }, [searchResults]);

  const navigateTo = useCallback((pageId: string) => {
    setActivePage(pageId);
    setSearchQuery("");
    setSearchFocused(false);
    setMobileMenuOpen(false);
    setSearchIndex(-1);
    setMobileToC(false);
    setTransitionKey(k => k + 1);
    // Scroll content area to top
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Fermer la dropdown de recherche quand on clique en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === "Escape") {
        setSearchFocused(false);
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Keyboard navigation in search results
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!searchFocused || searchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchIndex(i => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && searchIndex >= 0) {
      e.preventDefault();
      navigateTo(searchResults[searchIndex].id);
    }
  }, [searchFocused, searchResults, searchIndex, navigateTo]);

  // IntersectionObserver for active sub-section tracking
  useEffect(() => {
    if (currentPage.subSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSubSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    // Small delay to let DOM render
    const timeout = setTimeout(() => {
      for (const sub of currentPage.subSections) {
        const el = document.getElementById(sub.id);
        if (el) observer.observe(el);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [currentPage]);

  // Find matching search text snippet
  const getSearchSnippet = useCallback((page: PageDef): string | null => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const text = page.searchText.toLowerCase();
    const idx = text.indexOf(q);
    if (idx === -1) return null;
    const start = Math.max(0, idx - 20);
    const end = Math.min(text.length, idx + q.length + 30);
    const snippet = page.searchText.slice(start, end);
    return (start > 0 ? "..." : "") + snippet + (end < text.length ? "..." : "");
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header fixe ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="grid grid-cols-[1fr_minmax(0,480px)_1fr] items-center h-14 px-4 lg:px-6 gap-4">
          {/* Left: Logo + label */}
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity shrink-0">
              <Logo className="w-7 h-7" />
              <span className="text-[17px] font-semibold tracking-tighter hidden sm:block">Airlock</span>
            </Link>
            <div className="hidden sm:block w-px h-5 bg-black/[0.08] ml-0.5" />
            <span className="hidden sm:block text-[13px] font-medium text-black/30">Documentation</span>
          </div>

          {/* Center: Search bar */}
          <div ref={searchRef} className="relative w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Rechercher dans la documentation..."
                className="w-full pl-10 pr-16 py-2 rounded-xl bg-[#f5f5f7] border border-transparent text-[13px] font-medium text-black placeholder:text-black/25 focus:outline-none focus:ring-2 focus:ring-[#96A982]/20 focus:border-[#96A982]/20 focus:bg-white transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-semibold text-black/20 bg-white border border-black/[0.08] rounded-md px-1.5 py-0.5">
                <span className="text-[11px]">⌘</span>K
              </kbd>
            </div>

            {/* Dropdown résultats de recherche */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-black/[0.08] shadow-2xl shadow-black/[0.08] overflow-hidden z-50">
                <div className="p-2">
                  <p className="text-[10px] font-bold text-black/25 uppercase tracking-[0.15em] px-3 py-2">
                    {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""}
                  </p>
                  {searchResults.map((p, i) => {
                    const snippet = getSearchSnippet(p);
                    return (
                      <button
                        key={p.id}
                        onClick={() => navigateTo(p.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                          i === searchIndex ? "bg-[#96A982]/10" : "hover:bg-[#f5f5f7]"
                        }`}
                      >
                        <p.icon className={`w-4 h-4 shrink-0 ${i === searchIndex ? "text-[#96A982]" : "text-black/20"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-black/80 truncate">{p.label}</p>
                          {snippet ? (
                            <p className="text-[11px] text-black/30 font-medium truncate mt-0.5">{snippet}</p>
                          ) : (
                            <p className="text-[11px] text-black/30 font-medium mt-0.5">
                              {categories.find(c => c.pages.some(pg => pg.id === p.id))?.title}
                            </p>
                          )}
                        </div>
                        {i === searchIndex && (
                          <span className="text-[10px] text-[#96A982] font-semibold shrink-0">Enter ↵</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {searchFocused && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-black/[0.08] shadow-2xl shadow-black/[0.08] overflow-hidden z-50">
                <div className="p-6 text-center">
                  <p className="text-[13px] text-black/30 font-medium">Aucun résultat pour &ldquo;{searchQuery}&rdquo;</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Mobile menu toggle */}
          <div className="flex justify-end">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/[0.04] transition-colors shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-black/50" /> : <Menu className="w-5 h-5 text-black/50" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1440px] mx-auto">
        {/* ─── Sidebar gauche ─── */}
        <aside
          className={`${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky top-14 left-0 z-40 w-[260px] h-[calc(100vh-3.5rem)] border-r border-black/[0.04] bg-white/95 backdrop-blur-xl lg:bg-white overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] lg:transition-none shrink-0`}
        >
          <nav className="p-3 py-5">
            {categories.map((cat, catIdx) => (
              <div key={cat.title} className={catIdx > 0 ? "mt-6" : ""}>
                <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.18em] mb-2 px-3">
                  {cat.title}
                </p>
                <div className="space-y-px">
                  {cat.pages.map((page) => {
                    const isActive = activePage === page.id;
                    return (
                      <button
                        key={page.id}
                        onClick={() => navigateTo(page.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-200 text-left group ${
                          isActive
                            ? "bg-[#96A982]/[0.08] text-[#6b8560]"
                            : "text-black/40 hover:text-black/70 hover:bg-black/[0.025]"
                        }`}
                      >
                        <page.icon className={`w-[14px] h-[14px] shrink-0 transition-colors duration-200 ${
                          isActive ? "text-[#96A982]" : "text-black/20 group-hover:text-black/30"
                        }`} />
                        <span className="truncate">{page.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1 h-1 rounded-full bg-[#96A982]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Overlay mobile */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* ─── Contenu principal ─── */}
        <main ref={contentRef} className="flex-1 min-w-0 px-5 sm:px-8 lg:px-12 py-8 lg:py-10">
          <div className="max-w-[680px]">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-6 text-[12px] font-medium text-black/25">
              <span>Documentation</span>
              <ChevronRight className="w-3 h-3" />
              <span>{currentCategory}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-black/50">{currentPage.label}</span>
            </div>

            {/* Mobile: Sur cette page (collapsible) */}
            {currentPage.subSections.length > 0 && (
              <div className="xl:hidden mb-8">
                <button
                  onClick={() => setMobileToC(!mobileToC)}
                  className="flex items-center gap-2 text-[12px] font-semibold text-black/30 hover:text-black/50 transition-colors"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileToC ? "rotate-180" : ""}`} />
                  Sur cette page ({currentPage.subSections.length})
                </button>
                {mobileToC && (
                  <nav className="mt-3 pl-1 space-y-1 border-l-2 border-black/[0.05]">
                    {currentPage.subSections.map((sub) => (
                      <a
                        key={sub.id}
                        href={`#${sub.id}`}
                        onClick={() => setMobileToC(false)}
                        className={`block pl-4 py-1 text-[12px] font-medium transition-colors ${
                          activeSubSection === sub.id ? "text-[#96A982]" : "text-black/35 hover:text-black/60"
                        }`}
                      >
                        {sub.title}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            )}

            {/* Page content with fade transition */}
            <div key={transitionKey} className="animate-[fadeIn_0.2s_ease-out]">
              <currentPage.content />
            </div>

            {/* ─── Previous / Next navigation ─── */}
            <div className="mt-16 pt-8 border-t border-black/[0.05] flex items-stretch gap-4">
              {prevPage ? (
                <button
                  onClick={() => navigateTo(prevPage.id)}
                  className="flex-1 group text-left p-4 rounded-2xl border border-black/[0.05] hover:border-[#96A982]/20 hover:bg-[#96A982]/[0.02] transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <ArrowLeft className="w-3 h-3 text-black/20 group-hover:text-[#96A982] transition-colors" />
                    <span className="text-[11px] font-semibold text-black/25 uppercase tracking-wider">Précédent</span>
                  </div>
                  <p className="text-[14px] font-semibold text-black/60 group-hover:text-[#6b8560] transition-colors">{prevPage.label}</p>
                </button>
              ) : <div className="flex-1" />}

              {nextPage ? (
                <button
                  onClick={() => navigateTo(nextPage.id)}
                  className="flex-1 group text-right p-4 rounded-2xl border border-black/[0.05] hover:border-[#96A982]/20 hover:bg-[#96A982]/[0.02] transition-all"
                >
                  <div className="flex items-center justify-end gap-1.5 mb-2">
                    <span className="text-[11px] font-semibold text-black/25 uppercase tracking-wider">Suivant</span>
                    <ArrowRight className="w-3 h-3 text-black/20 group-hover:text-[#96A982] transition-colors" />
                  </div>
                  <p className="text-[14px] font-semibold text-black/60 group-hover:text-[#6b8560] transition-colors">{nextPage.label}</p>
                </button>
              ) : <div className="flex-1" />}
            </div>
          </div>
        </main>

        {/* ─── Sidebar droite : Sur cette page ─── */}
        {currentPage.subSections.length > 0 && (
          <aside className="hidden xl:block w-52 shrink-0">
            <div className="sticky top-20 py-10 pr-4">
              <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.18em] mb-3 px-1">Sur cette page</p>
              <nav className="space-y-px border-l-2 border-black/[0.05]">
                {currentPage.subSections.map((sub) => {
                  const isActive = activeSubSection === sub.id;
                  return (
                    <a
                      key={sub.id}
                      href={`#${sub.id}`}
                      className={`block pl-4 py-1.5 text-[12px] font-medium transition-all duration-200 relative ${
                        isActive
                          ? "text-[#96A982]"
                          : "text-black/30 hover:text-black/55"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-[-2px] top-1 bottom-1 w-[2px] bg-[#96A982] rounded-full" />
                      )}
                      {sub.title}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* CSS animation for page transitions */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
