# Guide de déploiement - Airlock

## Déploiement manuel sur le serveur

### Prérequis
- Accès SSH au serveur
- Git installé sur le serveur
- Node.js et npm installés
- Variables d'environnement configurées

### Étapes de déploiement

#### 1. Sur votre machine locale

```bash
# Vérifier que tout est commité
git status

# Committer les changements si nécessaire
git add .
git commit -m "Votre message de commit"
git push origin main  # ou master selon votre branche
```

#### 2. Sur le serveur (via SSH)

```bash
# Se connecter au serveur
ssh votre-utilisateur@votre-serveur.com

# Aller dans le dossier de l'application
cd /var/www/airlock

# Récupérer la dernière version
git fetch origin
git pull origin main  # ou master

# Vérifier que vous êtes sur la bonne branche
git branch

# Si vous avez des modifications locales qui posent problème, forcer la mise à jour:
git reset --hard origin/main  # ATTENTION: cela supprime les modifications locales
```

#### 3. Installer les dépendances

```bash
# Nettoyer et réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# OU si vous voulez une installation propre:
npm ci
```

#### 4. Vérifier les variables d'environnement

```bash
# Vérifier que .env.production existe
ls -la .env.production

# Vérifier le contenu (sans exposer les clés)
cat .env.production | grep -v "KEY"
```

Assurez-vous que `.env.production` contient:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...` (vraie clé complète)
- `CLERK_SECRET_KEY=sk_live_...` (vraie clé complète)
- Toutes les autres variables nécessaires (S3, Firebase, etc.)

#### 5. Build de l'application

```bash
# Build de production
npm run build
```

Si vous avez des erreurs lors du build:
```bash
# Vérifier la version de Node.js (doit être >= 18)
node --version

# Nettoyer le cache Next.js
rm -rf .next

# Réessayer le build
npm run build
```

#### 6. Redémarrer l'application

**Option A: Si vous utilisez PM2**
```bash
pm2 restart airlock
# ou
pm2 reload airlock
```

**Option B: Si vous utilisez systemd**
```bash
sudo systemctl restart airlock
# Vérifier le statut
sudo systemctl status airlock
```

**Option C: Si vous lancez directement Next.js**
```bash
# Arrêter le processus actuel
pkill -f "next start"

# Relancer en arrière-plan
nohup npm start > /var/log/airlock.log 2>&1 &
```

**Option D: Si vous utilisez un reverse proxy (nginx)**
```bash
# Juste redémarrer Next.js, nginx n'a pas besoin de redémarrage
# Mais vous pouvez vérifier la config nginx si nécessaire
sudo nginx -t
sudo systemctl reload nginx
```

## Résolution des problèmes courants

### Erreur: "Cannot find module"
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install
```

### Erreur: "Port already in use"
```bash
# Trouver le processus qui utilise le port
lsof -i :3000  # ou le port que vous utilisez

# Tuer le processus
kill -9 <PID>
```

### Erreur: "Git pull failed"
```bash
# Sauvegarder vos modifications locales si nécessaire
git stash

# Forcer la mise à jour
git fetch origin
git reset --hard origin/main
```

### Erreur: "Build failed"
```bash
# Vérifier les logs
npm run build 2>&1 | tee build.log

# Nettoyer et réessayer
rm -rf .next
npm run build
```

### Variables d'environnement non chargées
```bash
# Vérifier que le fichier existe
ls -la .env.production

# Vérifier le format (pas d'espaces autour du =)
cat .env.production

# Redémarrer l'application après modification
```

## Script de déploiement automatique

Vous pouvez utiliser le script `deploy.sh` fourni:

1. Modifier les variables dans le script selon votre configuration
2. Rendre le script exécutable:
   ```bash
   chmod +x deploy.sh
   ```
3. L'exécuter:
   ```bash
   ./deploy.sh
   ```

## Vérification post-déploiement

1. Vérifier que l'application répond:
   ```bash
   curl http://localhost:3000
   ```

2. Vérifier les logs:
   ```bash
   # PM2
   pm2 logs airlock
   
   # systemd
   sudo journalctl -u airlock -f
   
   # Direct
   tail -f /var/log/airlock.log
   ```

3. Tester l'application dans le navigateur

## Notes importantes

- Toujours faire un backup avant de déployer
- Tester en local avant de déployer
- Vérifier les variables d'environnement après chaque déploiement
- Garder les logs pour le débogage

