# Guide de déploiement

Guide complet pour déployer Airlock en production.

## 📋 Prérequis

- Serveur Ubuntu/Debian
- Node.js 20+ installé
- PM2 installé (`npm install -g pm2`)
- Nginx configuré (optionnel mais recommandé)
- Accès SSH au serveur

## 🚀 Déploiement rapide

### 1. Sur le serveur

```bash
cd /var/www/airlock
git pull origin main
./deploy.sh
```

C'est tout ! Le script fait :
- ✅ Pull des dernières modifications
- ✅ Installation des dépendances
- ✅ Build de l'application
- ✅ Arrêt de l'ancienne version
- ✅ Libération du port 3000
- ✅ Démarrage avec PM2
- ✅ Vérification du démarrage

## 📝 Déploiement manuel

### 1. Préparer le serveur

```bash
# Créer le dossier
sudo mkdir -p /var/www/airlock
sudo chown -R $USER:$USER /var/www/airlock

# Cloner le repo
cd /var/www
git clone https://github.com/id7sup/airlock.git
cd airlock
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
nano .env.production
# Ajouter toutes les variables (voir ENV.md)
```

### 4. Build

```bash
npm run build
```

### 5. Démarrer avec PM2

```bash
pm2 start npm --name "airlock" -- start
pm2 save
pm2 startup  # Pour démarrer au boot
```

## 🔧 Scripts disponibles

### `deploy.sh`
Script principal de déploiement. À utiliser pour chaque mise à jour.

```bash
./deploy.sh
```

### `kill-port.sh`
Libère le port 3000 si bloqué.

```bash
./kill-port.sh
```

**Quand l'utiliser :**
- Si le port 3000 est occupé
- Avant de redémarrer manuellement
- En cas d'erreur `EADDRINUSE`

## 🔍 Commandes PM2 utiles

```bash
pm2 status              # Voir le statut
pm2 logs airlock        # Voir les logs
pm2 logs airlock --lines 50  # 50 dernières lignes
pm2 restart airlock     # Redémarrer
pm2 stop airlock        # Arrêter
pm2 delete airlock      # Supprimer
```

## 🌐 Configuration Nginx

Exemple de configuration (voir `nginx-config-example.conf`) :

```nginx
server {
    listen 80;
    server_name airlck.com www.airlck.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Dépannage

### Le port 3000 est bloqué

```bash
./kill-port.sh
./deploy.sh
```

### L'application ne démarre pas

```bash
# Voir les logs
pm2 logs airlock --lines 50

# Vérifier les variables d'environnement
cat .env.production

# Redémarrer depuis zéro
pm2 delete airlock
./deploy.sh
```

### Erreur "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erreur de build

```bash
# Nettoyer et rebuilder
rm -rf .next
npm run build
```

## 📊 Monitoring

### Vérifier que l'application fonctionne

```bash
# Statut PM2
pm2 status

# Logs en temps réel
pm2 logs airlock

# Vérifier le port
ss -tlnp | grep 3000

# Test HTTP
curl http://localhost:3000
```

### Redémarrage automatique

PM2 redémarre automatiquement l'application en cas de crash. Pour configurer :

```bash
pm2 set airlock:max_restarts 10
pm2 set airlock:min_uptime 10000
pm2 save
```

## 🔄 Mise à jour

Pour mettre à jour l'application :

```bash
cd /var/www/airlock
git pull origin main
./deploy.sh
```

Le script gère automatiquement :
- L'arrêt propre de l'ancienne version
- Le build de la nouvelle version
- Le redémarrage

## ⚠️ Bonnes pratiques

1. **Toujours tester en local** avant de déployer
2. **Faire un backup** avant les mises à jour majeures
3. **Vérifier les logs** après chaque déploiement
4. **Monitorer les performances** avec PM2
5. **Utiliser HTTPS** en production (Let's Encrypt)

## 📞 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs airlock`
2. Vérifier les variables d'environnement
3. Vérifier que le port 3000 est libre
4. Consulter la documentation

