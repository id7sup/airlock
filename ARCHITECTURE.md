# Architecture d'Airlock

Documentation technique de l'architecture et de la structure du projet.

## 🏗 Vue d'ensemble

Airlock est une application Next.js 16 utilisant l'App Router, avec une architecture modulaire et scalable.

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dashboard  │  │  Share Page  │  │   Public     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js App Router (Server)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  API Routes  │  │    Proxy     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Firebase    │    │ Cloudflare   │    │   Clerk      │
│  (Firestore) │    │  R2 Storage  │    │  (Auth)      │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 📁 Structure des dossiers

```
airlock/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Routes API
│   │   │   ├── analytics/      # Analytics & tracking
│   │   │   ├── public/         # API publiques (partage)
│   │   │   └── share/          # API de partage
│   │   ├── dashboard/          # Interface utilisateur
│   │   │   ├── folder/[id]/    # Vue dossier
│   │   │   ├── settings/       # Paramètres
│   │   │   └── sharing/        # Gestion partages
│   │   ├── share/              # Pages de partage publiques
│   │   │   └── [token]/        # Lien de partage
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Page d'accueil
│   ├── components/             # Composants React
│   │   ├── dashboard/          # Composants dashboard
│   │   └── shared/             # Composants partagés
│   ├── lib/                    # Utilitaires
│   │   ├── actions/            # Server Actions
│   │   │   ├── files.ts        # Actions fichiers
│   │   │   ├── folders.ts      # Actions dossiers
│   │   │   ├── sharing.ts      # Actions partage
│   │   │   └── notifications.ts # Actions notifications
│   │   ├── firebase.ts         # Configuration Firebase
│   │   ├── seo.ts              # SEO & metadata
│   │   └── geolocation.ts      # Géolocalisation
│   ├── services/               # Services métier
│   │   ├── analytics.ts        # Analytics
│   │   ├── sharing.ts          # Partage
│   │   ├── storage.ts          # Stockage R2 (S3-compatible)
│   │   └── notifications.ts    # Notifications
│   └── proxy.ts                # Proxy d'authentification (Next.js 16+)
├── public/                     # Fichiers statiques
├── deploy.sh                   # Script déploiement
└── kill-port.sh                # Script utilitaire
```

## 🔄 Flux de données

### Authentification
```
User → Clerk → Proxy → Protected Routes
```

### Partage de fichiers
```
1. User crée un lien de partage
   → Server Action (sharing.ts)
   → Firebase (shareLinks collection)
   → Génère token unique

2. Visiteur accède au lien
   → /share/[token] page
   → validateShareLink()
   → Vérifie expiration, quota, mot de passe
   → Affiche fichiers

3. Téléchargement
   → API route /api/public/download
   → Vérifie token
   → Génère URL R2 signée (S3-compatible)
   → Redirige vers fichier
```

### Upload de fichiers
```
1. User upload fichier
   → Server Action (files.ts)
   → Génère URL R2 presignée (S3-compatible)
   → Client upload directement vers R2
   → Callback → Crée entrée Firestore
```

## 🗄 Base de données (Firestore)

### Collections principales

#### `folders`
```typescript
{
  id: string
  name: string
  parentId: string | null
  workspaceId: string
  isFavorite: boolean
  isDeleted: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `files`
```typescript
{
  id: string
  name: string
  size: number
  mimeType: string
  folderId: string
  workspaceId: string
  s3Key: string           // Clé R2 (API compatible S3)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### `shareLinks`
```typescript
{
  id: string
  token: string
  tokenHash: string
  folderId: string
  creatorId: string
  expiresAt: Timestamp | null
  passwordHash: string | null
  maxViews: number | null
  viewCount: number
  downloadCount: number
  isRevoked: boolean
  allowDownload: boolean
  createdAt: Timestamp
}
```

#### `permissions`
```typescript
{
  id: string
  folderId: string
  userId: string
  role: "OWNER" | "EDITOR" | "VIEWER"
  canDownload: boolean
  createdAt: Timestamp
}
```

## 🔐 Sécurité

### Authentification
- **Clerk** pour l'authentification utilisateur
- **Middleware** protège les routes `/dashboard/*`
- Routes publiques : `/`, `/share/*`, `/api/public/*`

### Partage
- Tokens uniques hashés (SHA-256)
- Validation côté serveur uniquement
- Expiration automatique
- Quota de vues
- Protection par mot de passe optionnelle

### Stockage
- URLs R2 presignées (S3-compatible, expiration limitée)
- Validation des permissions avant accès
- Watermarking automatique pour certains fichiers

## 🎨 Composants clés

### Server Components
- `app/dashboard/page.tsx` - Page principale dashboard
- `app/share/[token]/page.tsx` - Page de partage publique
- `app/api/*` - Routes API

### Client Components
- `components/dashboard/DashboardClient.tsx` - Interface dashboard
- `components/shared/FileListClient.tsx` - Liste de fichiers
- `components/dashboard/MapboxGlobe.tsx` - Globe interactif

### Server Actions
- `lib/actions/files.ts` - CRUD fichiers
- `lib/actions/folders.ts` - CRUD dossiers
- `lib/actions/sharing.ts` - Gestion partages

## 🔧 Services

### `services/sharing.ts`
- `validateShareLink()` - Valide un lien de partage
- `createShareLink()` - Crée un nouveau lien

### `services/analytics.ts`
- `trackLinkActivity()` - Enregistre une activité
- `getLinkAnalytics()` - Récupère les stats

### `services/storage.ts`
- `getUploadUrl()` - Génère URL upload R2 (S3-compatible)
- `getDownloadUrl()` - Génère URL download R2 (S3-compatible)

## 🚀 Performance

### Optimisations
- **Static Generation** pour les pages publiques
- **Server Components** pour réduire le JS client
- **Image Optimization** avec Next.js Image
- **Code Splitting** automatique
- **Caching** des données Firebase

### Monitoring
- PM2 pour la gestion des processus
- Logs structurés avec console.error
- Analytics intégrés

## 🔄 Déploiement

Voir [DEPLOY.md](./DEPLOY.md) pour les détails.

**Résumé :**
1. Build : `npm run build`
2. Start : `pm2 start npm --name "airlock" -- start`
3. Nginx reverse proxy vers port 3000

## 📝 Bonnes pratiques

1. **Server Components par défaut** - Utiliser Client Components seulement si nécessaire
2. **Validation côté serveur** - Toujours valider les données
3. **Gestion d'erreurs** - Try/catch partout
4. **Types TypeScript** - Typage strict
5. **Commentaires** - Documenter le code complexe

## 🔍 Debugging

### Logs
```bash
pm2 logs airlock --lines 50
```

### Erreurs communes
- **Timestamps Firestore** - Convertir en ISO strings pour Client Components
- **Port 3000 occupé** - Utiliser `./kill-port.sh`
- **Variables d'environnement** - Vérifier `.env.production`

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clerk Documentation](https://clerk.com/docs)

