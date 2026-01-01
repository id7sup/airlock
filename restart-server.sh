#!/bin/bash

# Script pour redémarrer proprement l'application sur le serveur

echo "🛑 Arrêt de tous les processus Next.js..."

# Arrêter tous les processus Next.js
pkill -f "next-server" || true
pkill -f "next start" || true
pkill -f "node.*next" || true

# Attendre que les processus se terminent
sleep 3

# Vérifier qu'il n'y a plus de processus
echo "🔍 Vérification des processus restants..."
REMAINING=$(ps aux | grep -E "next|node.*start" | grep -v grep | wc -l)
if [ "$REMAINING" -gt 0 ]; then
    echo "⚠️  Il reste des processus, arrêt forcé..."
    ps aux | grep -E "next|node.*start" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Vérifier que le port 3000 est libre
echo "🔍 Vérification du port 3000..."
if ss -tlnp | grep -q ":3000"; then
    echo "⚠️  Le port 3000 est encore utilisé, attente..."
    sleep 5
fi

echo "✅ Tous les processus sont arrêtés"

# Aller dans le dossier de l'application
cd /var/www/airlock || exit 1

# Vérifier la version Git
echo ""
echo "📦 Version Git actuelle:"
git log --oneline -1

# Vérifier que le build est à jour
echo ""
echo "🔨 Vérification du build..."
if [ ! -d ".next" ] || [ ".next" -ot "package.json" ]; then
    echo "⚠️  Le build semble obsolète, reconstruction..."
    rm -rf .next
    npm run build
else
    echo "✅ Le build est à jour"
fi

# Démarrer avec PM2 si disponible, sinon avec nohup
echo ""
echo "🚀 Démarrage de l'application..."

if command -v pm2 &> /dev/null; then
    echo "📦 Utilisation de PM2..."
    pm2 delete airlock 2>/dev/null || true
    pm2 start npm --name "airlock" -- start
    pm2 save
    echo ""
    echo "✅ Application démarrée avec PM2"
    echo "📊 Statut:"
    pm2 status
    echo ""
    echo "📋 Logs (dernières 20 lignes):"
    pm2 logs airlock --lines 20 --nostream
else
    echo "📦 Utilisation de nohup..."
    nohup npm start > /var/log/airlock.log 2>&1 &
    sleep 3
    echo ""
    echo "✅ Application démarrée avec nohup"
    echo "📋 Logs (dernières 20 lignes):"
    tail -20 /var/log/airlock.log
fi

# Vérifier que l'application répond
echo ""
echo "🔍 Vérification de l'application..."
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Application accessible sur http://localhost:3000"
else
    echo "⚠️  L'application ne répond pas correctement"
    echo "Vérifiez les logs avec: pm2 logs airlock (si PM2) ou tail -f /var/log/airlock.log"
fi

echo ""
echo "✅ Redémarrage terminé!"

