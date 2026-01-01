# Guide de déploiement automatique

Ce guide explique comment utiliser les scripts de déploiement automatique pour mettre à jour votre application sur le serveur.

## 🚀 Déploiement en une commande

### Première utilisation

1. **Configurer les informations du serveur** (une seule fois) :
   ```bash
   chmod +x deploy-config.sh
   ./deploy-config.sh
   ```
   
   Le script vous demandera :
   - L'adresse du serveur (ex: `root@airlck.com`)
   - Le chemin sur le serveur (défaut: `/var/www/airlock`)
   - La branche Git (défaut: `main`)

2. **Exporter les variables** (ou ajouter dans votre `~/.bashrc` ou `~/.zshrc`) :
   ```bash
   source .deploy-config
   ```

### Déploiement automatique

Une fois configuré, déployez simplement avec :

```bash
chmod +x deploy-auto.sh
./deploy-auto.sh "Votre message de commit"
```

Ou sans message (un message par défaut sera généré) :
```bash
./deploy-auto.sh
```

## 📋 Ce que fait le script

Le script `deploy-auto.sh` automatise tout le processus :

1. ✅ **Vérifie les modifications locales**
   - Détecte les fichiers modifiés
   - Propose de les committer automatiquement

2. ✅ **Commit et push vers GitHub**
   - Commit les modifications avec votre message
   - Push vers la branche configurée (par défaut `main`)

3. ✅ **Déploie sur le serveur**
   - Se connecte au serveur via SSH
   - Récupère la dernière version depuis GitHub
   - Installe/met à jour les dépendances
   - Rebuild l'application
   - Arrête l'ancienne version
   - Démarre la nouvelle version avec PM2
   - Vérifie que tout fonctionne

## 🔧 Configuration manuelle

Si vous préférez configurer manuellement, exportez ces variables :

```bash
export SERVER_USER="root"
export SERVER_HOST="airlck.com"
export SERVER_PATH="/var/www/airlock"
export GIT_BRANCH="main"
```

Puis exécutez :
```bash
./deploy-auto.sh
```

## 📝 Exemples d'utilisation

### Déploiement avec message personnalisé
```bash
./deploy-auto.sh "Correction du bug d'affichage des chunks"
```

### Déploiement rapide
```bash
./deploy-auto.sh
```

### Déploiement d'une branche spécifique
```bash
export GIT_BRANCH="develop"
./deploy-auto.sh "Déploiement de la branche develop"
```

## 🛠️ Dépannage

### Erreur: "Ce n'est pas un dépôt Git"
Assurez-vous d'être dans le dossier du projet.

### Erreur: "Connexion SSH échouée"
- Vérifiez que vous avez accès SSH au serveur
- Vérifiez que votre clé SSH est configurée
- Testez la connexion : `ssh $SERVER_USER@$SERVER_HOST`

### Erreur: "Le port 3000 est toujours utilisé"
Le script essaie automatiquement de libérer le port. Si cela échoue :
```bash
ssh $SERVER_USER@$SERVER_HOST
cd $SERVER_PATH
./kill-port-3000.sh
./fix-all-issues.sh
```

### Erreur lors du build
Vérifiez les logs sur le serveur :
```bash
ssh $SERVER_USER@$SERVER_HOST "cd $SERVER_PATH && npm run build"
```

## 🔐 Sécurité

- Le fichier `.deploy-config` est dans `.gitignore` et ne sera pas commité
- Les informations sensibles restent locales
- Utilisez des clés SSH pour l'authentification

## 📚 Scripts disponibles

- **`deploy-auto.sh`** : Script principal de déploiement automatique
- **`deploy-config.sh`** : Configuration initiale du serveur
- **`fix-all-issues.sh`** : Correction complète des problèmes sur le serveur
- **`kill-port-3000.sh`** : Libération du port 3000
- **`restart-server.sh`** : Redémarrage propre du serveur

## 💡 Astuces

1. **Alias pour plus de rapidité** :
   ```bash
   alias deploy='./deploy-auto.sh'
   ```
   Puis utilisez simplement : `deploy "Message"`

2. **Déploiement depuis n'importe où** :
   Ajoutez le chemin complet dans votre alias :
   ```bash
   alias deploy='cd /chemin/vers/airlock && ./deploy-auto.sh'
   ```

3. **Vérification après déploiement** :
   ```bash
   ssh $SERVER_USER@$SERVER_HOST "pm2 logs airlock --lines 50"
   ```

## ✅ Checklist de déploiement

- [ ] Modifications testées en local
- [ ] Configuration serveur définie (première fois)
- [ ] Connexion SSH testée
- [ ] Script exécuté : `./deploy-auto.sh "Message"`
- [ ] Application testée sur le serveur
- [ ] Logs vérifiés si problème

