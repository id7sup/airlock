# Configuration des variables d'environnement en production

## ⚠️ Important

Le fichier `.env.production` est dans `.gitignore`, donc il **ne sera pas déployé automatiquement** sur le serveur.

## Solution : Ajouter manuellement sur le serveur

### 1. Connectez-vous à votre serveur
```bash
ssh root@votre-serveur.com
# ou
ssh votre-utilisateur@votre-serveur.com
```

### 2. Allez dans le dossier du projet
```bash
cd /var/www/airlock
```

### 3. Créez ou modifiez `.env.production`
```bash
nano .env.production
```

### 4. Ajoutez toutes les variables nécessaires :
```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiaWQ3c3VwIiwiYSI6ImNtanhjdnlwZDAwMjIzZHNlZGU5c2Q5NjAifQ.do66guUWEHb9HjJ_BXIKsg

# Ajoutez aussi toutes vos autres variables d'environnement :
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# etc.
```

### 5. Redémarrez l'application
```bash
pm2 restart airlock
# ou
./deploy-simple.sh
```

## Alternative : Variables d'environnement système

Vous pouvez aussi définir les variables directement dans PM2 ou dans votre shell :

```bash
# Dans PM2
pm2 start npm --name "airlock" -- start --update-env
pm2 save

# Ou exporter dans le shell avant de démarrer
export NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="pk.eyJ1IjoiaWQ3c3VwIiwiYSI6ImNtanhjdnlwZDAwMjIzZHNlZGU5c2Q5NjAifQ.do66guUWEHb9HjJ_BXIKsg"
```

## Vérification

Après le redémarrage, vérifiez que la variable est bien chargée :
```bash
pm2 logs airlock | grep -i mapbox
```

Si vous voyez encore l'erreur "Token Mapbox non configuré", c'est que la variable n'est pas chargée correctement.

