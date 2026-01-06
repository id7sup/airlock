# Variables d'environnement

Documentation complète des variables d'environnement nécessaires pour Airlock.

## 🔴 Variables obligatoires

### Firebase (Base de données)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Où trouver :** Firebase Console > Project Settings > General > Your apps

### Clerk (Authentification)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

**Où trouver :** Clerk Dashboard > API Keys

**Note :** Les URLs de redirection sont configurées pour utiliser les pages d'authentification personnalisées (`/login` et `/register`).

### S3/Storage (Stockage de fichiers)
```bash
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1
```

**Note :** Compatible avec S3-compatible storage (DigitalOcean Spaces, etc.)

### Mapbox (Globe de suivi)
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...
```

**Où trouver :** Mapbox Account > Access Tokens

## 🟡 Variables optionnelles

### Analytics
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics (optionnel)
```

### URLs
```bash
NEXT_PUBLIC_APP_URL=https://airlck.com  # URL de production
```

## 📝 Configuration en développement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
# Éditer .env.local avec vos valeurs
```

## 📝 Configuration en production

### Sur le serveur

1. Connectez-vous au serveur
```bash
ssh root@votre-serveur.com
cd /var/www/airlock
```

2. Créez `.env.production`
```bash
nano .env.production
```

3. Ajoutez toutes les variables
4. Redémarrez l'application
```bash
./deploy.sh
```

### Vérification

Vérifiez que les variables sont chargées :
```bash
pm2 logs airlock | grep -i "error\|config"
```

## ⚠️ Sécurité

- **NE COMMITTEZ JAMAIS** `.env.local` ou `.env.production`
- Utilisez des tokens différents pour dev/prod
- Régénérez les clés si elles sont compromises
- Utilisez des secrets managers en production (AWS Secrets Manager, etc.)

## 🔍 Dépannage

### Erreur "Token Mapbox non configuré"
→ Vérifiez que `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` est défini

### Erreur Firebase
→ Vérifiez que toutes les variables `NEXT_PUBLIC_FIREBASE_*` sont définies
→ Vérifiez que `FIREBASE_PRIVATE_KEY` est correctement formaté (avec `\n`)

### Erreur S3
→ Vérifiez les credentials S3
→ Vérifiez que le bucket existe et est accessible

