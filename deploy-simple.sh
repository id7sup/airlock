#!/bin/bash

# Script ULTRA-SIMPLE pour déployer sur le serveur
# Usage: ./deploy-simple.sh

set -e

echo "🚀 Déploiement simple - Mise à jour complète"
echo ""

cd /var/www/airlock || exit 1

# 1. Sauvegarder et récupérer
echo "📥 Récupération depuis GitHub..."
git stash 2>/dev/null || true
git pull origin main

# 2. Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# 3. NETTOYER et REBUILD
echo "🔨 Nettoyage et rebuild complet..."
rm -rf .next
npm run build

# 4. TUER TOUS les processus
echo "🛑 Arrêt de tous les processus..."
pm2 delete airlock 2>/dev/null || true
pm2 kill 2>/dev/null || true
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 5

# Vérifier que le port est libre
for i in {1..10}; do
    if ! ss -tlnp 2>/dev/null | grep -q ":3000"; then
        break
    fi
    echo "Attente... ($i/10)"
    sleep 1
done

# 5. DÉMARRER avec PM2
echo "🚀 Démarrage de l'application..."
npm install -g pm2 2>/dev/null || true
pm2 start npm --name "airlock" -- start
pm2 save

# 6. Attendre et vérifier
echo "⏳ Attente du démarrage..."
sleep 5

# Vérifier
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅ ✅ ✅ SUCCÈS ! Application démarrée !"
    echo ""
    pm2 status
else
    echo "⚠️  Code HTTP: $HTTP_CODE"
    pm2 logs airlock --lines 20 --nostream
fi

echo ""
echo "✅ Déploiement terminé !"
echo "🌐 Testez sur https://airlck.com (videz le cache: Ctrl+Shift+R)"

