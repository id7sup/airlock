# 🚀 Guide de déploiement

## Déploiement depuis votre Mac (recommandé)

### 1. Configuration initiale (une seule fois)

```bash
./deploy-config.sh
source .deploy-config
```

### 2. Déployer automatiquement

```bash
./deploy-auto.sh "Description des modifications"
```

Le script fait automatiquement :
- ✅ Commit vos modifications
- ✅ Push vers GitHub
- ✅ Déploiement sur le serveur
- ✅ Redémarrage de l'application

## Déploiement sur le serveur (manuel)

Si vous êtes directement sur le serveur :

```bash
cd /var/www/airlock
./deploy-simple.sh
```

## Scripts disponibles

- **`deploy-auto.sh`** - Déploiement automatique depuis Mac (commit + push + deploy)
- **`deploy-simple.sh`** - Déploiement simple sur le serveur (une commande)
- **`fix-all-issues.sh`** - Correction complète des problèmes sur le serveur
- **`kill-port-3000.sh`** - Libérer le port 3000 si bloqué
- **`update-server.sh`** - Mise à jour simple du serveur

## Configuration nginx

Voir `nginx-config-example.conf` pour la configuration nginx recommandée.

