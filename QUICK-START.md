# 🚀 Démarrage rapide - Déploiement automatique

## Sur votre machine locale (Mac)

### 1. Configuration initiale (une seule fois)

```bash
cd ~/Desktop/airlock

# Configurer les informations du serveur
./deploy-config.sh
```

Vous devrez entrer :
- Adresse du serveur : `root@airlck.com` (ou votre adresse IP)
- Chemin sur le serveur : `/var/www/airlock`
- Branche Git : `main`

### 2. Exporter les variables

```bash
source .deploy-config
```

### 3. Déployer automatiquement

```bash
./deploy-auto.sh "Votre message de commit"
```

## Sur le serveur (première fois)

Les scripts doivent d'abord être récupérés depuis GitHub :

```bash
cd /var/www/airlock

# Récupérer les nouveaux scripts
git pull origin main

# Maintenant les scripts sont disponibles
chmod +x deploy-auto.sh deploy-config.sh fix-all-issues.sh

# Utiliser le script de correction si nécessaire
./fix-all-issues.sh
```

## Workflow normal

### Sur votre Mac (local)

1. Faire vos modifications dans le code
2. Exécuter :
   ```bash
   ./deploy-auto.sh "Description des changements"
   ```

Le script va automatiquement :
- ✅ Committer vos changements
- ✅ Les pousser sur GitHub
- ✅ Les déployer sur le serveur
- ✅ Redémarrer l'application

### Sur le serveur

Les scripts sont déjà là après le premier `git pull`. Vous pouvez les utiliser directement :

```bash
# Redémarrer l'application
./fix-all-issues.sh

# Ou utiliser les scripts individuels
./kill-port-3000.sh
./restart-server.sh
```

## ⚠️ Important

Les scripts `deploy-auto.sh` et `deploy-config.sh` sont à utiliser **sur votre machine locale (Mac)**, pas sur le serveur.

Sur le serveur, utilisez plutôt :
- `fix-all-issues.sh` - Correction complète
- `restart-server.sh` - Redémarrage propre
- `kill-port-3000.sh` - Libérer le port 3000

