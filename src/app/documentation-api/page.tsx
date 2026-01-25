"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ExternalLink } from "lucide-react";
import { CodeBlock } from "@/app/api-docs/components/CodeBlock";

type Section = "debut" | "authentification" | "endpoints" | "permissions" | "erreurs" | "ratelimit" | "exemples" | "faq";

const sections: { id: Section; label: string }[] = [
  { id: "debut", label: "Guide de démarrage" },
  { id: "authentification", label: "Authentification" },
  { id: "endpoints", label: "Endpoints API" },
  { id: "permissions", label: "Permissions & Scopes" },
  { id: "erreurs", label: "Codes d'erreur" },
  { id: "ratelimit", label: "Taux de limite" },
  { id: "exemples", label: "Exemples d'intégration" },
  { id: "faq", label: "Questions fréquentes" },
];

export default function APIDocumentationPage() {
  const [activeSection, setActiveSection] = useState<Section>("debut");

  const renderContent = () => {
    switch (activeSection) {
      case "debut":
        return <GuideDeDemarrage />;
      case "authentification":
        return <Authentification />;
      case "endpoints":
        return <EndpointsAPI />;
      case "permissions":
        return <PermissionsScopes />;
      case "erreurs":
        return <CodesErreur />;
      case "ratelimit":
        return <TauxLimite />;
      case "exemples":
        return <ExemplesIntegration />;
      case "faq":
        return <FAQ />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      {/* Hero */}
      <div className="pt-32 pb-16 px-6 border-b border-black/[0.03]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-[64px] font-medium tracking-tight">
              Documentation API
            </h1>
            <p className="text-lg md:text-xl text-black/50 font-medium max-w-2xl">
              Intégrez Airlock dans votre site web pour gérer les fichiers et les partages par API
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-24 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-[16px] font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-[#96A982] text-white"
                    : "text-black/70 hover:bg-black/5"
                }`}
              >
                {section.label}
              </button>
            ))}

            <div className="pt-6 border-t border-black/[0.03] mt-6">
              <Link
                href="/dashboard/api"
                className="flex items-center gap-2 px-4 py-3 rounded-[16px] bg-black text-white font-medium hover:bg-black/90 transition-all"
              >
                Gérer les clés
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3 space-y-12"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}

function GuideDeDemarrage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Guide de démarrage</h2>
        <p className="text-lg text-black/50 font-medium">
          Tout ce dont vous avez besoin pour commencer à utiliser l'API Airlock
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-medium">Étape 1 : Créer une clé API</h3>
        <ol className="space-y-4 list-decimal list-inside">
          <li className="text-lg text-black/70 font-medium">
            Allez à
            <Link href="/dashboard/api" className="text-[#96A982] hover:underline mx-1">
              Dashboard → Clés API
            </Link>
          </li>
          <li className="text-lg text-black/70 font-medium">
            Cliquez sur "Créer une clé"
          </li>
          <li className="text-lg text-black/70 font-medium">
            Entrez un nom (ex: "Production API")
          </li>
          <li className="text-lg text-black/70 font-medium">
            Sélectionnez les permissions nécessaires
          </li>
          <li className="text-lg text-black/70 font-medium">
            Copiez la clé et conservez-la en sécurité (affichée une seule fois)
          </li>
        </ol>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-6 space-y-3">
        <h4 className="font-medium text-blue-900">💡 Conseil de sécurité</h4>
        <p className="text-sm font-medium text-blue-800">
          Traitez votre clé API comme un mot de passe. Ne la partagez jamais publiquement.
          Si vous pensez qu'elle a été compromise, révoqueze-la immédiatement.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-medium">Étape 2 : Faire votre première requête</h3>
        <CodeBlock
          code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://airlock.app/api/v1/folders`}
          language="bash"
          title="Commande curl"
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-medium">Prochaines étapes</h3>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-[#96A982] font-bold">→</span>
            <span className="text-lg font-medium">
              Consulter la section <strong>Authentification</strong> pour les détails
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#96A982] font-bold">→</span>
            <span className="text-lg font-medium">
              Explorer les <strong>Endpoints API</strong> disponibles
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-[#96A982] font-bold">→</span>
            <span className="text-lg font-medium">
              Voir les <strong>Exemples d'intégration</strong> en JavaScript et Python
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Authentification() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Authentification</h2>
        <p className="text-lg text-black/50 font-medium">
          Comment authentifier vos requêtes API
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-medium">Bearer Token</h3>
        <p className="text-lg text-black/70 font-medium">
          Toutes les requêtes doivent inclure un Bearer token dans l'en-tête <code className="bg-[#f5f5f7] px-2 py-1 rounded">Authorization</code>.
        </p>
        <CodeBlock
          code={`Authorization: Bearer YOUR_API_KEY`}
          language="bash"
          title="Format de l'en-tête"
        />
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-medium">Exemples d'authentification</h3>

        <div className="space-y-4">
          <h4 className="font-medium text-lg">curl</h4>
          <CodeBlock
            code={`curl -H "Authorization: Bearer sk_test_abc123def456" \\
  https://airlock.app/api/v1/folders`}
            language="bash"
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-lg">JavaScript (fetch)</h4>
          <CodeBlock
            code={`const response = await fetch('https://airlock.app/api/v1/folders', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();`}
            language="javascript"
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-lg">Python (requests)</h4>
          <CodeBlock
            code={`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get(
    'https://airlock.app/api/v1/folders',
    headers=headers
)

data = response.json()`}
            language="python"
          />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-medium">Erreurs d'authentification</h3>
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-4">
            <p className="font-medium text-red-900 mb-2">⚠️ 401 - Non autorisé</p>
            <p className="text-sm text-red-800">Vérifiez que votre clé API est correcte et active</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-4">
            <p className="font-medium text-red-900 mb-2">⚠️ 401 - Clé révoquée</p>
            <p className="text-sm text-red-800">Votre clé a été désactivée. Créez-en une nouvelle</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EndpointsAPI() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Endpoints API</h2>
        <p className="text-lg text-black/50 font-medium">
          Tous les endpoints disponibles
        </p>
      </div>

      <EndpointBox
        method="GET"
        path="/api/v1/folders"
        title="Lister les dossiers"
        description="Récupérez tous les dossiers de votre espace de travail"
        scope="folders:read"
        query={[
          { name: "parentId", required: false, description: "ID du dossier parent (optionnel)" },
          { name: "limit", required: false, description: "Max: 100, défaut: 20" },
          { name: "offset", required: false, description: "Pagination" },
        ]}
      />

      <EndpointBox
        method="POST"
        path="/api/v1/folders"
        title="Créer un dossier"
        description="Créez un nouveau dossier"
        scope="folders:write"
        body={{ name: "string (requis)", parentId: "string (optionnel)" }}
      />

      <EndpointBox
        method="GET"
        path="/api/v1/files"
        title="Lister les fichiers"
        description="Récupérez tous les fichiers d'un dossier"
        scope="files:read"
        query={[
          { name: "folderId", required: false, description: "Filtrer par dossier" },
          { name: "limit", required: false, description: "Max: 100, défaut: 20" },
          { name: "offset", required: false, description: "Pagination" },
        ]}
      />

      <EndpointBox
        method="POST"
        path="/api/v1/upload"
        title="Obtenir une URL d'upload"
        description="Obtenir une URL presigned pour uploader des fichiers"
        scope="files:write"
        body={{
          folderId: "string (requis)",
          name: "string (requis)",
          size: "number (requis)",
          mimeType: "string (requis)",
        }}
      />

      <EndpointBox
        method="GET"
        path="/api/v1/shares"
        title="Lister les partages"
        description="Récupérez tous vos liens de partage"
        scope="shares:read"
        query={[
          { name: "folderId", required: false, description: "Filtrer par dossier" },
          { name: "limit", required: false, description: "Max: 100, défaut: 20" },
        ]}
      />

      <EndpointBox
        method="POST"
        path="/api/v1/shares"
        title="Créer un lien de partage"
        description="Créez un nouveau lien de partage pour un dossier"
        scope="shares:write"
        body={{
          folderId: "string (requis)",
          expiresAt: "ISO date (optionnel)",
          password: "string (optionnel)",
          maxViews: "number (optionnel)",
          allowDownload: "boolean (défaut: true)",
          allowViewOnline: "boolean (défaut: true)",
        }}
      />

      <EndpointBox
        method="GET"
        path="/api/v1/analytics"
        title="Obtenir les analytics"
        description="Récupérez les statistiques de vos partages"
        scope="analytics:read"
        query={[
          { name: "days", required: false, description: "7, 30 ou 90 (défaut: 7)" },
          { name: "folderId", required: false, description: "Filtrer par dossier" },
        ]}
      />
    </div>
  );
}

function EndpointBox({
  method,
  path,
  title,
  description,
  scope,
  query,
  body,
}: {
  method: string;
  path: string;
  title: string;
  description: string;
  scope: string;
  query?: { name: string; required: boolean; description: string }[];
  body?: Record<string, string>;
}) {
  const methodColor =
    method === "GET"
      ? "bg-blue-100 text-blue-700"
      : method === "POST"
        ? "bg-green-100 text-green-700"
        : "bg-purple-100 text-purple-700";

  return (
    <div className="bg-[#f5f5f7] rounded-[24px] p-8 border border-black/[0.03] space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className={`${methodColor} px-3 py-1.5 rounded-lg font-mono font-bold text-sm`}>
            {method}
          </span>
          <code className="font-mono text-lg font-bold">{path}</code>
        </div>
        <h4 className="text-xl font-medium">{title}</h4>
        <p className="text-black/60">{description}</p>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-black/70">Permission requise :</p>
        <span className="inline-block bg-[#96A982]/10 text-[#96A982] px-3 py-1.5 rounded-lg text-sm font-bold">
          {scope}
        </span>
      </div>

      {query && (
        <div className="space-y-2">
          <p className="font-medium text-black/70">Paramètres de requête :</p>
          <div className="space-y-2">
            {query.map((q) => (
              <div key={q.name} className="bg-white rounded-[12px] p-3">
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-sm">{q.name}</code>
                  {!q.required && (
                    <span className="text-xs bg-black/5 px-2 py-0.5 rounded text-black/50">
                      optionnel
                    </span>
                  )}
                </div>
                <p className="text-sm text-black/60 mt-1">{q.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {body && (
        <div className="space-y-2">
          <p className="font-medium text-black/70">Corps de la requête :</p>
          <CodeBlock
            code={JSON.stringify(
              Object.fromEntries(Object.entries(body).slice(0, 2)),
              null,
              2
            )}
            language="json"
          />
        </div>
      )}
    </div>
  );
}

function PermissionsScopes() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Permissions & Scopes</h2>
        <p className="text-lg text-black/50 font-medium">
          Contrôlez précisément ce que peut faire chaque clé API
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-medium">Scopes disponibles</h3>
        <div className="space-y-3">
          {[
            { scope: "files:read", desc: "Lire les informations sur les fichiers" },
            { scope: "files:write", desc: "Uploader et modifier les fichiers" },
            { scope: "folders:read", desc: "Lister les dossiers" },
            { scope: "folders:write", desc: "Créer et modifier les dossiers" },
            { scope: "shares:read", desc: "Lister les liens de partage" },
            { scope: "shares:write", desc: "Créer et modifier les liens de partage" },
            { scope: "analytics:read", desc: "Accéder aux données d'analytics" },
          ].map((item) => (
            <div key={item.scope} className="bg-white border border-black/[0.03] rounded-[16px] p-4 space-y-2">
              <code className="font-mono font-bold text-[#96A982]">{item.scope}</code>
              <p className="text-sm text-black/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-[24px] p-6 space-y-3">
        <h4 className="font-medium text-blue-900">💡 Principe du moindre privilège</h4>
        <p className="text-sm font-medium text-blue-800">
          N'attribuez que les scopes nécessaires à chaque clé. Par exemple, si vous avez besoin de lire les fichiers,
          n'ajoutez pas la permission d'écriture.
        </p>
      </div>
    </div>
  );
}

function CodesErreur() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Codes d'erreur</h2>
        <p className="text-lg text-black/50 font-medium">
          Comprendre les réponses d'erreur de l'API
        </p>
      </div>

      <div className="overflow-x-auto bg-[#f5f5f7] rounded-[24px] p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.05]">
              <th className="text-left py-3 px-4 font-medium text-black/70">Code</th>
              <th className="text-left py-3 px-4 font-medium text-black/70">Status</th>
              <th className="text-left py-3 px-4 font-medium text-black/70">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {[
              ["AUTH_MISSING", "401", "En-tête Authorization manquant"],
              ["AUTH_INVALID", "401", "Clé API invalide"],
              ["AUTH_REVOKED", "401", "Clé API révoquée ou désactivée"],
              ["AUTH_EXPIRED", "401", "Clé API expirée"],
              ["INSUFFICIENT_SCOPE", "403", "Permissions insuffisantes"],
              ["RATE_LIMIT_EXCEEDED", "429", "Trop de requêtes"],
              ["RESOURCE_NOT_FOUND", "404", "Ressource non trouvée"],
              ["VALIDATION_ERROR", "400", "Données invalides"],
              ["STORAGE_QUOTA_EXCEEDED", "402", "Quota de stockage dépassé"],
            ].map(([code, status, desc]) => (
              <tr key={code}>
                <td className="py-3 px-4">
                  <code className="font-mono text-sm font-bold text-[#96A982]">{code}</code>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-bold text-red-600">{status}</span>
                </td>
                <td className="py-3 px-4 text-sm text-black/60">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-medium">Format des erreurs</h3>
        <CodeBlock
          code={`{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Vous avez dépassé le taux de limite pour cette clé API",
    "details": {
      "limit": 60,
      "window": "minute",
      "retryAfter": 45
    }
  }
}`}
          language="json"
        />
      </div>
    </div>
  );
}

function TauxLimite() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Taux de limite</h2>
        <p className="text-lg text-black/50 font-medium">
          Limites de requêtes par clé API
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Par minute", limit: "60 requêtes" },
          { label: "Par heure", limit: "1 000 requêtes" },
          { label: "Par jour", limit: "10 000 requêtes" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#f5f5f7] rounded-[24px] p-6 border border-black/[0.03] text-center space-y-3"
          >
            <p className="font-medium text-black/70">{item.label}</p>
            <p className="text-3xl font-bold">{item.limit}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-medium">Gestion du taux de limite</h3>
        <p className="text-lg text-black/70 font-medium">
          Quand vous atteignez la limite, l'API retourne un code 429 avec l'en-tête <code className="bg-[#f5f5f7] px-2 py-1 rounded">Retry-After</code>.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-medium">Exemple de réponse 429</h3>
        <CodeBlock
          code={`HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Vous avez dépassé le taux de limite",
    "details": {
      "retryAfter": 45
    }
  }
}`}
          language="bash"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-[24px] p-6 space-y-3">
        <h4 className="font-medium text-yellow-900">💡 Conseil</h4>
        <p className="text-sm font-medium text-yellow-800">
          Implémentez une logique de retry exponentielle avec backoff pour gérer les taux de limite gracieusement.
        </p>
      </div>
    </div>
  );
}

function ExemplesIntegration() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Exemples d'intégration</h2>
        <p className="text-lg text-black/50 font-medium">
          Code réel pour intégrer l'API dans votre application
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-medium">Lister les dossiers</h3>
          <CodeBlock
            code={`const apiKey = 'sk_test_abc123def456';

async function listFolders() {
  const response = await fetch(
    'https://airlock.app/api/v1/folders?limit=20',
    {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('Erreur:', error);
    return;
  }

  const { folders, total } = await response.json();
  console.log(\`Trouvé \${total} dossiers\`);

  folders.forEach(folder => {
    console.log(\`- \${folder.name}\`);
  });
}

listFolders();`}
            language="javascript"
            title="JavaScript - Lister les dossiers"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-medium">Créer un dossier</h3>
          <CodeBlock
            code={`import requests

api_key = 'sk_test_abc123def456'

def create_folder(name, parent_id=None):
    headers = {
        'Authorization': f'Bearer {api_key}'
    }

    data = {
        'name': name,
        'parentId': parent_id
    }

    response = requests.post(
        'https://airlock.app/api/v1/folders',
        headers=headers,
        json=data
    )

    if response.status_code == 201:
        folder = response.json()
        print(f"Dossier créé: {folder['id']}")
        return folder
    else:
        error = response.json()
        print(f"Erreur: {error}")
        return None

# Créer un dossier
create_folder('Mes Documents')`}
            language="python"
            title="Python - Créer un dossier"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-medium">Créer un lien de partage</h3>
          <CodeBlock
            code={`const apiKey = 'sk_test_abc123def456';

async function createShareLink(folderId, options = {}) {
  const body = {
    folderId,
    allowDownload: options.allowDownload ?? true,
    allowViewOnline: options.allowViewOnline ?? true,
    maxViews: options.maxViews || null,
    ...options
  };

  const response = await fetch(
    'https://airlock.app/api/v1/shares',
    {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  const share = await response.json();
  console.log(\`Lien de partage: \${share.shareUrl}\`);
  return share;
}

// Créer un partage
createShareLink('folder_abc123', {
  allowDownload: true,
  maxViews: 100
});`}
            language="javascript"
            title="JavaScript - Créer un lien de partage"
          />
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h2 className="text-3xl font-medium">Questions fréquentes</h2>
        <p className="text-lg text-black/50 font-medium">
          Réponses aux questions courantes sur l'API
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            q: "Puis-je révoquer une clé API ?",
            a: "Oui. Allez à Dashboard → Clés API et cliquez sur l'icône corbeille. La clé sera immédiatement désactivée.",
          },
          {
            q: "Que se passe-t-il si j'atteins mon taux de limite ?",
            a: "L'API retournera un code 429. Attendez le délai indiqué par l'en-tête Retry-After avant de réessayer.",
          },
          {
            q: "Comment uploader des fichiers via l'API ?",
            a: "Utilisez POST /api/v1/upload pour obtenir une URL presigned, puis uploadez directement vers R2.",
          },
          {
            q: "Puis-je utiliser une clé API sur plusieurs domaines ?",
            a: "Oui, les clés API ne sont pas liées à un domaine spécifique. Utilisez-les librement.",
          },
          {
            q: "Mes données sont-elles chiffrées ?",
            a: "Oui. Toutes les données sont chiffrées en transit (HTTPS) et au repos dans notre base de données.",
          },
          {
            q: "Comment puis-je tracker les appels API ?",
            a: "Consultez Dashboard → Clés API pour voir le nombre total de requêtes et la date de dernière utilisation.",
          },
        ].map((item, i) => (
          <details
            key={i}
            className="group bg-[#f5f5f7] border border-black/[0.03] rounded-[16px] p-4 cursor-pointer"
          >
            <summary className="flex items-center justify-between font-medium text-lg">
              {item.q}
              <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-4 text-black/60 font-medium border-t border-black/[0.03] pt-4">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
