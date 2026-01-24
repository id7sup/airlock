# 🔒 Airlock - Partage de Fichiers Sécurisé

Plateforme de partage de fichiers sécurisée avec authentification, gestion de dossiers, analytics et suivi géographique.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Déploiement](#-déploiement)
- [Architecture](#-architecture)
- [Documentation](#-documentation)

## ✨ Fonctionnalités

### 🔐 Authentification & Sécurité
- Authentification via Clerk
- Gestion des permissions (OWNER, EDITOR, VIEWER)
- Partage sécurisé avec tokens uniques
- Liens expirables avec dates de fin
- Protection par mot de passe optionnelle
- Quota de vues configurable

### 📁 Gestion de Fichiers
- Upload de fichiers multiples
- Organisation en dossiers et sous-dossiers
- Drag & drop pour réorganiser
- Prévisualisation de fichiers (PDF, images)
- Téléchargement sécurisé
- Watermarking automatique

### 📊 Analytics & Suivi
- Statistiques de vues et téléchargements
- Suivi géographique avec globe interactif (Mapbox)
- Graphiques de performance (Recharts)
- Historique des accès
- Notifications en temps réel

### 🎨 Interface
- Design moderne inspiré d'Apple
- Responsive (mobile, tablette, desktop)
- Animations fluides (Framer Motion)
- Mode sombre/clair
- Accessibilité optimisée

## 🛠 Technologies

### Frontend
- **Next.js 16** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend & Services
- **Firebase Admin** - Base de données (Firestore)
- **Clerk** - Authentification
- **Cloudflare R2** - Stockage de fichiers (via API compatible S3)
- **Mapbox** - Cartographie et globe
- **PM2** - Gestion de processus

### Bibliothèques principales
- `@dnd-kit` - Drag & drop
- `recharts` - Graphiques
- `three.js` + `react-globe.gl` - Globe 3D
- `sharp` - Traitement d'images
- `pdfjs-dist` - Prévisualisation PDF

## 📦 Installation

### Prérequis
- Node.js 20+
- npm ou yarn
- Compte Firebase
- Compte Clerk
- Compte Cloudflare R2

### Étapes

1. **Cloner le dépôt**
```bash
git clone https://github.com/id7sup/airlock.git
cd airlock
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
# Éditer .env.local avec vos credentials
```

4. **Lancer en développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## ⚙️ Configuration

### Variables d'environnement requises

Voir [ENV.md](./ENV.md) pour la liste complète des variables.

**Minimum requis :**
- `NEXT_PUBLIC_FIREBASE_*` - Configuration Firebase
- `CLERK_SECRET_KEY` - Clé secrète Clerk
- `S3_*` - Configuration Cloudflare R2 (API compatible S3)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Token Mapbox (pour le globe)

## 🚀 Déploiement

### Déploiement sur serveur

Voir [DEPLOY.md](./DEPLOY.md) pour les instructions complètes.

**Résumé :**
```bash
cd /var/www/airlock
git pull origin main
./deploy.sh
```

### Scripts disponibles
- `deploy.sh` - Déploiement complet
- `kill-port.sh` - Libérer le port 3000

## 🏗 Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour une explication détaillée de l'architecture.

### Structure des dossiers
```
src/
├── app/              # Pages Next.js (App Router)
│   ├── api/         # Routes API
│   ├── dashboard/   # Interface utilisateur
│   └── share/       # Pages de partage publiques
├── components/      # Composants React
│   ├── dashboard/   # Composants dashboard
│   └── shared/      # Composants partagés
├── lib/             # Utilitaires et helpers
│   ├── actions/     # Server Actions
│   └── services/    # Services métier
└── proxy.ts         # Proxy d'authentification (Next.js 16+)
```

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- [DEPLOY.md](./DEPLOY.md) - Guide de déploiement
- [ENV.md](./ENV.md) - Variables d'environnement

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est privé et propriétaire.

## 👤 Auteur

**Joseph Michaut**
- Email: joseph.michaut@hotmail.com

---

**Airlock** - Souveraineté Numérique 🔒

