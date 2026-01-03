# Déploiement

## Sur le serveur

```bash
cd /var/www/airlock
./deploy.sh
```

## Si le port 3000 est bloqué

```bash
./kill-port.sh
./deploy.sh
```

## Commandes PM2

```bash
pm2 status          # Voir le statut
pm2 logs airlock    # Voir les logs
pm2 restart airlock # Redémarrer
```
