#!/bin/bash

# Script de déploiement SIMPLIFIÉ
set -e

cd /var/www/airlock || exit 1

echo "🚀 Déploiement..."

# 1. Git pull
echo "📥 Mise à jour..."
git pull origin main

# 2. Install
echo "📦 Installation..."
npm install

# 3. Build
echo "🔨 Build..."
rm -rf .next
npm run build

# 4. KILL PORT 3000 - FORCER
echo "🔪 Libération du port 3000..."
./kill-port.sh || true
sleep 3

# Vérifier que le port est libre
if command -v ss &> /dev/null && ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "❌ ERREUR: Le port 3000 est toujours occupé!"
    echo "Exécutez manuellement: ./kill-port.sh"
    exit 1
fi

# 5. Démarrer
echo "🚀 Démarrage..."
pm2 start npm --name "airlock" -- start
pm2 save

# 6. Vérifier
sleep 5
if pm2 jlist 2>/dev/null | grep -q '"status":"online"'; then
    echo "✅ Démarré!"
    pm2 status
else
    echo "❌ Erreur au démarrage"
    pm2 logs airlock --lines 10 --nostream
    exit 1
fi

