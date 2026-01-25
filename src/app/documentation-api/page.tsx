"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ExternalLink, Copy, Check, AlertCircle } from "lucide-react";
import { CodeBlock } from "@/app/api-docs/components/CodeBlock";

type Section = "intro" | "getting-started" | "authentication" | "endpoints" | "scopes" | "errors" | "rate-limit" | "examples" | "faq";

const sections: { id: Section; label: string; icon: string }[] = [
  { id: "intro", label: "Introduction", icon: "📖" },
  { id: "getting-started", label: "Démarrage rapide", icon: "🚀" },
  { id: "authentication", label: "Authentification", icon: "🔐" },
  { id: "endpoints", label: "Endpoints", icon: "🔌" },
  { id: "scopes", label: "Permissions", icon: "🔑" },
  { id: "errors", label: "Erreurs", icon: "⚠️" },
  { id: "rate-limit", label: "Limites", icon: "⏱️" },
  { id: "examples", label: "Exemples", icon: "💻" },
  { id: "faq", label: "FAQ", icon: "❓" },
];

export default function APIDocumentationPage() {
  const [activeSection, setActiveSection] = useState<Section>("intro");

  const renderContent = () => {
    switch (activeSection) {
      case "intro":
        return <IntroSection />;
      case "getting-started":
        return <GettingStartedSection />;
      case "authentication":
        return <AuthenticationSection />;
      case "endpoints":
        return <EndpointsSection />;
      case "scopes":
        return <ScopesSection />;
      case "errors":
        return <ErrorsSection />;
      case "rate-limit":
        return <RateLimitSection />;
      case "examples":
        return <ExamplesSection />;
      case "faq":
        return <FAQSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="bg-gradient-to-b from-white to-black/2 border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">API Documentation</h1>
              <p className="text-black/50 text-sm md:text-base mt-1">Intégrez Airlock dans votre application</p>
            </div>
            <Link
              href="/dashboard/settings?tab=api"
              className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Créer une clé <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-black/5 bg-black/2">
          <div className="sticky top-24 space-y-2 p-6">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeSection === section.id
                    ? "bg-black text-white shadow-lg"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
                whileHover={{ x: 4 }}
              >
                <span className="text-lg mr-2">{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </motion.button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Mobile Section Selector */}
          <div className="lg:hidden px-4 sm:px-6 py-4 border-b border-black/5 overflow-x-auto">
            <div className="flex gap-2 min-w-min pb-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id ? "bg-black text-white" : "bg-black/5 text-black/60 hover:text-black"
                  }`}
                >
                  {section.icon} {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// Section Components
function IntroSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Bienvenue</h2>
        <p className="text-lg text-black/60 leading-relaxed mb-6">
          L'API Airlock vous permet d'intégrer facilement la gestion de fichiers, les partages sécurisés et les analytics
          directement dans votre application.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-black/2 p-6 rounded-2xl border border-black/5">
          <h3 className="font-semibold text-lg mb-3">🎯 Cas d'usage</h3>
          <ul className="space-y-2 text-black/60 text-sm">
            <li>✓ Upload et gestion de fichiers</li>
            <li>✓ Partages sécurisés avec tokens</li>
            <li>✓ Organisation en dossiers</li>
            <li>✓ Analytics et statistiques</li>
            <li>✓ Gestion des permissions</li>
          </ul>
        </div>

        <div className="bg-black/2 p-6 rounded-2xl border border-black/5">
          <h3 className="font-semibold text-lg mb-3">⚡ Caractéristiques</h3>
          <ul className="space-y-2 text-black/60 text-sm">
            <li>✓ API REST simple et intuitive</li>
            <li>✓ Authentification par clé API</li>
            <li>✓ Rate limiting configurable</li>
            <li>✓ Webhooks pour les événements</li>
            <li>✓ SDK JavaScript (bientôt)</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50/50 border border-yellow-100/50 rounded-2xl p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Avant de commencer</h4>
            <p className="text-sm text-yellow-700">Assurez-vous d'avoir une clé API valide. Vous pouvez en créer une dans vos paramètres.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GettingStartedSection() {
  const curlExample = `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://airlock.app/api/v1/folders`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Démarrage rapide</h2>
        <p className="text-lg text-black/60 mb-8">Créez votre première demande API en 5 minutes.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3">1️⃣ Créer une clé API</h3>
          <p className="text-black/60 mb-4">Allez dans Paramètres → API Connections → Créer une nouvelle clé</p>
          <div className="bg-black/2 p-4 rounded-xl border border-black/5 text-sm text-black/60">
            Vous recevrez une clé de 64 caractères. Gardez-la secrète!
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">2️⃣ Faire votre première requête</h3>
          <p className="text-black/60 mb-4">Testez votre clé avec cette commande simple:</p>
          <CodeBlock code={curlExample} language="bash" />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">3️⃣ Consulter les réponses</h3>
          <p className="text-black/60 mb-4">L'API retourne du JSON structuré:</p>
          <CodeBlock
            code={`{
  "folders": [
    {
      "id": "folder_123",
      "name": "Mon dossier",
      "parentId": null,
      "createdAt": "2025-01-25T10:30:00Z"
    }
  ],
  "total": 1
}`}
            language="json"
          />
        </div>
      </div>
    </div>
  );
}

function AuthenticationSection() {
  const authExample = `curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://airlock.app/api/v1/files`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Authentification</h2>
        <p className="text-lg text-black/60">Tous les appels API nécessitent un Bearer token.</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Bearer Token</h3>
        <p className="text-black/60 mb-4">Incluez votre clé API dans l'en-tête Authorization:</p>
        <CodeBlock code={authExample} language="bash" />
      </div>

      <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Sécurité</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ne partagez jamais votre clé API</li>
              <li>• Utilisez HTTPS pour toutes les requêtes</li>
              <li>• Révoquez les clés compromise immédiatement</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Erreurs d'authentification</h3>
        <div className="space-y-3">
          <div className="p-4 bg-black/2 rounded-xl border border-black/5">
            <p className="font-mono text-sm text-red-600 mb-2">401 AUTH_MISSING</p>
            <p className="text-sm text-black/60">En-tête Authorization manquant</p>
          </div>
          <div className="p-4 bg-black/2 rounded-xl border border-black/5">
            <p className="font-mono text-sm text-red-600 mb-2">401 AUTH_INVALID</p>
            <p className="text-sm text-black/60">Clé API invalide ou format incorrect</p>
          </div>
          <div className="p-4 bg-black/2 rounded-xl border border-black/5">
            <p className="font-mono text-sm text-red-600 mb-2">401 AUTH_REVOKED</p>
            <p className="text-sm text-black/60">Clé API a été révoquée</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EndpointsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Endpoints API</h2>
        <p className="text-lg text-black/60">Toutes les ressources disponibles.</p>
      </div>

      <div className="space-y-6">
        {/* Folders */}
        <div className="border border-black/5 rounded-2xl overflow-hidden">
          <div className="bg-black/2 p-4 border-b border-black/5">
            <h3 className="font-semibold text-lg">📁 Dossiers</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-sm bg-black text-white px-3 py-2 rounded-lg w-fit">GET /api/v1/folders</p>
              <p className="text-sm text-black/60">Lister les dossiers (Scope: folders:read)</p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-sm bg-black text-white px-3 py-2 rounded-lg w-fit">POST /api/v1/folders</p>
              <p className="text-sm text-black/60">Créer un nouveau dossier (Scope: folders:write)</p>
            </div>
          </div>
        </div>

        {/* Files */}
        <div className="border border-black/5 rounded-2xl overflow-hidden">
          <div className="bg-black/2 p-4 border-b border-black/5">
            <h3 className="font-semibold text-lg">📄 Fichiers</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-sm bg-black text-white px-3 py-2 rounded-lg w-fit">GET /api/v1/files</p>
              <p className="text-sm text-black/60">Lister les fichiers (Scope: files:read)</p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-sm bg-black text-white px-3 py-2 rounded-lg w-fit">POST /api/v1/upload</p>
              <p className="text-sm text-black/60">Obtenir une URL de téléchargement presignée (Scope: files:write)</p>
            </div>
          </div>
        </div>

        {/* Shares */}
        <div className="border border-black/5 rounded-2xl overflow-hidden">
          <div className="bg-black/2 p-4 border-b border-black/5">
            <h3 className="font-semibold text-lg">🔗 Partages</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-sm bg-black text-white px-3 py-2 rounded-lg w-fit">GET /api/v1/shares</p>
              <p className="text-sm text-black/60">Lister les liens de partage (Scope: shares:read)</p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-sm bg-black text-white px-3 py-2 rounded-lg w-fit">POST /api/v1/shares</p>
              <p className="text-sm text-black/60">Créer un nouveau lien de partage (Scope: shares:write)</p>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="border border-black/5 rounded-2xl overflow-hidden">
          <div className="bg-black/2 p-4 border-b border-black/5">
            <h3 className="font-semibold text-lg">📊 Analytics</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <p className="font-mono text-sm bg-black text-white px-3 py-2 rounded-lg w-fit">GET /api/v1/analytics</p>
              <p className="text-sm text-black/60">Obtenir les données analytics (Scope: analytics:read)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScopesSection() {
  const scopes = [
    { id: "files:read", description: "Lire les métadonnées des fichiers" },
    { id: "files:write", description: "Uploader et créer des fichiers" },
    { id: "folders:read", description: "Lister et consulter les dossiers" },
    { id: "folders:write", description: "Créer et modifier les dossiers" },
    { id: "shares:read", description: "Consulter les liens de partage" },
    { id: "shares:write", description: "Créer et gérer les partages" },
    { id: "analytics:read", description: "Accéder aux données analytics" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Permissions & Scopes</h2>
        <p className="text-lg text-black/60">Contrôlez précisément les accès de vos clés API.</p>
      </div>

      <div className="space-y-3">
        {scopes.map((scope) => (
          <div key={scope.id} className="p-4 bg-black/2 rounded-xl border border-black/5">
            <p className="font-mono text-sm font-semibold text-black mb-2">{scope.id}</p>
            <p className="text-sm text-black/60">{scope.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-green-50/50 border border-green-100/50 rounded-2xl p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 mb-2">Principe du moindre privilège</h4>
            <p className="text-sm text-green-700">Accordez uniquement les permissions nécessaires à chaque clé API.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorsSection() {
  const errors = [
    { code: "400", name: "VALIDATION_ERROR", message: "Données d'entrée invalides" },
    { code: "401", name: "AUTH_INVALID", message: "Clé API invalide ou manquante" },
    { code: "403", name: "INSUFFICIENT_SCOPE", message: "Permissions insuffisantes" },
    { code: "404", name: "RESOURCE_NOT_FOUND", message: "Ressource introuvable" },
    { code: "429", name: "RATE_LIMIT_EXCEEDED", message: "Trop de requêtes" },
    { code: "402", name: "STORAGE_QUOTA_EXCEEDED", message: "Quota de stockage dépassé" },
    { code: "500", name: "INTERNAL_ERROR", message: "Erreur serveur" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Gestion des erreurs</h2>
        <p className="text-lg text-black/60">Format uniforme pour tous les codes d'erreur.</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Format des erreurs</h3>
        <CodeBlock
          code={`{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Vous avez dépassé le taux limite",
    "details": {
      "retryAfter": 60
    }
  }
}`}
          language="json"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left p-3 font-semibold">Code HTTP</th>
              <th className="text-left p-3 font-semibold">Erreur</th>
              <th className="text-left p-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error) => (
              <tr key={error.code} className="border-b border-black/5 hover:bg-black/2">
                <td className="p-3 font-mono text-sm text-black/60">{error.code}</td>
                <td className="p-3 font-mono text-sm text-black/60">{error.name}</td>
                <td className="p-3 text-sm text-black/60">{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RateLimitSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Limites de taux</h2>
        <p className="text-lg text-black/60">Limites par défaut pour toutes les clés API.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10">
              <th className="text-left p-3 font-semibold">Période</th>
              <th className="text-left p-3 font-semibold">Limite</th>
              <th className="text-left p-3 font-semibold">Réinitialisation</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black/5 hover:bg-black/2">
              <td className="p-3 font-medium">Par minute</td>
              <td className="p-3">60 requêtes</td>
              <td className="p-3 text-black/60">Toutes les minutes</td>
            </tr>
            <tr className="border-b border-black/5 hover:bg-black/2">
              <td className="p-3 font-medium">Par heure</td>
              <td className="p-3">1 000 requêtes</td>
              <td className="p-3 text-black/60">Toutes les heures</td>
            </tr>
            <tr className="border-b border-black/5 hover:bg-black/2">
              <td className="p-3 font-medium">Par jour</td>
              <td className="p-3">10 000 requêtes</td>
              <td className="p-3 text-black/60">Tous les jours</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">En cas de dépassement</h3>
        <p className="text-black/60 mb-4">Quand vous atteignez la limite, l'API retourne:</p>
        <CodeBlock
          code={`HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Vous avez dépassé le taux limite",
    "details": {
      "retryAfter": 60
    }
  }
}`}
          language="bash"
        />
      </div>

      <div className="bg-yellow-50/50 border border-yellow-100/50 rounded-2xl p-6">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-2">Besoin de limites plus élevées?</h4>
            <p className="text-sm text-yellow-700">Contactez notre support pour une augmentation sur mesure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamplesSection() {
  const curlUpload = `curl -X POST https://airlock.app/api/v1/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "folderId": "folder_123",
    "name": "document.pdf",
    "size": 1024000,
    "mimeType": "application/pdf"
  }'`;

  const jsExample = `const uploadFile = async () => {
  const response = await fetch('https://airlock.app/api/v1/upload', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer YOUR_API_KEY\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      folderId: 'folder_123',
      name: 'document.pdf',
      size: 1024000,
      mimeType: 'application/pdf',
    })
  });

  const data = await response.json();
  // Utilisez data.uploadUrl pour uploader le fichier
};`;

  const pythonExample = `import requests

api_key = 'YOUR_API_KEY'
headers = {'Authorization': f'Bearer {api_key}'}

# Créer un dossier
response = requests.post(
    'https://airlock.app/api/v1/folders',
    headers=headers,
    json={'name': 'Mon dossier'}
)

folder = response.json()
print(f"Dossier créé: {folder['id']}")`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Exemples d'intégration</h2>
        <p className="text-lg text-black/60">Cas d'usage courants et solutions.</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">📤 Upload de fichiers</h3>
        <CodeBlock code={curlUpload} language="bash" />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">📱 Exemple JavaScript</h3>
        <CodeBlock code={jsExample} language="javascript" />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">🐍 Exemple Python</h3>
        <CodeBlock code={pythonExample} language="python" />
      </div>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "Combien de clés API puis-je créer?",
      a: "Vous pouvez créer autant de clés que nécessaire. Chacune peut avoir des permissions différentes.",
    },
    {
      q: "Que se passe-t-il si ma clé est compromise?",
      a: "Allez dans Paramètres → API Connections et révoquez immédiatement la clé. Les anciennes clés ne fonctionneront plus.",
    },
    {
      q: "Puis-je faire des requêtes depuis le navigateur?",
      a: "Non, pour la sécurité. Utilisez un backend serveur ou un proxy pour protéger votre clé API.",
    },
    {
      q: "Quel est le délai avant déconnexion?",
      a: "Les clés API ne s'expire pas automatiquement. Vous pouvez définir une date d'expiration lors de la création.",
    },
    {
      q: "Y a-t-il un SLA de disponibilité?",
      a: "Oui, nous garantissons 99.9% de disponibilité. Contactez le support pour plus de détails.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-semibold mb-4">Questions fréquentes</h2>
        <p className="text-lg text-black/60">Réponses aux questions courantes.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details key={index} className="group cursor-pointer">
            <summary className="flex items-center justify-between p-4 bg-black/2 rounded-xl border border-black/5 hover:bg-black/5 transition-colors">
              <span className="font-semibold text-black">{faq.q}</span>
              <ChevronRight className="w-5 h-5 text-black/40 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="p-4 text-black/60 bg-white border-l-4 border-black/10">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
