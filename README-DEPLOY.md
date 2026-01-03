# 🚀 Guide de déploiement

## Déploiement sur le serveur

### Déploiement simple (recommandé)

```bash
cd /var/www/airlock
chmod +x deploy.sh
./deploy.sh
```

Le script fait automatiquement :
- ✅ Récupération depuis GitHub
- ✅ Installation des dépendances
- ✅ Build de l'application
- ✅ Arrêt propre de l'ancienne version
- ✅ Libération du port 3000
- ✅ Démarrage avec PM2
- ✅ Vérification du démarrage

## Scripts disponibles

- **`deploy.sh`** - Script de déploiement principal (unique et propre)
- **`kill-port.sh`** - Libérer le port 3000 si bloqué

## Dépannage

### Le port 3000 est bloqué
```bash
./kill-port.sh
```

### L'application ne démarre pas
```bash
pm2 logs airlock --lines 50
```

## Configuration nginx

Voir `nginx-config-example.conf` pour la configuration nginx recommandée.

