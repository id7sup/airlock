#!/bin/bash

# Script de déploiement unique et propre
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement Airlock"
echo ""

cd /var/www/airlock || exit 1

# 1. Récupération depuis GitHub
echo "📥 Récupération depuis GitHub..."
git stash 2>/dev/null || true
git pull origin main

# 2. Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# 3. Build
echo "🔨 Build de l'application..."
rm -rf .next
npm run build

# 4. Arrêt propre de l'application
echo "🛑 Arrêt de l'application..."
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
sleep 2

# 5. Libération du port 3000
echo "🔍 Libération du port 3000..."
pkill -9 -f "next-server" 2>/dev/null || true
sleep 1

# Utiliser lsof si disponible
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$PIDS" ]; then
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Utiliser ss si disponible
if command -v ss &> /dev/null; then
    SS_PIDS=$(ss -tlnp 2>/dev/null | grep ":3000" | grep -oP 'pid=\K[0-9]+' || true)
    if [ ! -z "$SS_PIDS" ]; then
        echo "$SS_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Vérification finale
if command -v ss &> /dev/null && ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "⚠️  Le port 3000 est encore occupé, mais on continue..."
else
    echo "✅ Port 3000 libéré"
fi

# 6. Démarrage avec PM2
echo "🚀 Démarrage avec PM2..."
pm2 start npm --name "airlock" -- start

# 7. Sauvegarde PM2
pm2 save

# 8. Vérification
echo "⏳ Attente du démarrage..."
sleep 5

PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "unknown")
if [ "$PM2_STATUS" = "online" ]; then
    echo "✅ Application démarrée avec succès!"
    pm2 status
else
    echo "⚠️  Statut: $PM2_STATUS"
    echo "📋 Logs:"
    pm2 logs airlock --lines 20 --nostream
fi

echo ""
echo "✅ Déploiement terminé!"
echo "🌐 Testez sur https://airlck.com"

