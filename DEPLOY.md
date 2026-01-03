# Guide de déploiement

## Scripts disponibles

### `deploy.sh` - Script de déploiement principal
Script unique et propre pour déployer l'application.

**Usage:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Ce que fait le script:**
1. Récupère les dernières modifications depuis GitHub
2. Installe les dépendances
3. Build l'application
4. Arrête proprement l'application actuelle
5. Libère le port 3000
6. Démarre l'application avec PM2
7. Vérifie que tout fonctionne

### `kill-port.sh` - Libérer le port 3000
Script simple pour libérer le port 3000 si nécessaire.

**Usage:**
```bash
chmod +x kill-port.sh
./kill-port.sh
```

**Quand l'utiliser:**
- Si le port 3000 est bloqué
- Avant de redémarrer manuellement l'application
- En cas d'erreur `EADDRINUSE`

## Commandes PM2 utiles

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs airlock

# Redémarrer
pm2 restart airlock

# Arrêter
pm2 stop airlock

# Supprimer
pm2 delete airlock
```

## Dépannage

### Le port 3000 est toujours occupé
```bash
./kill-port.sh
# Attendre quelques secondes
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

### Erreur "Cannot execute binary file"
Cette erreur était causée par `--interpreter bash` dans l'ancien script. Le nouveau script utilise directement Node.js via PM2.

