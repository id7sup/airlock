#!/bin/bash

# Script ULTRA-SIMPLE pour déployer sur le serveur
# Usage: ./deploy-simple.sh

set -e

echo "🚀 Déploiement simple - Mise à jour complète"
echo ""

cd /var/www/airlock || exit 1

# 1. Sauvegarder et récupérer
echo "📥 Récupération depuis GitHub..."
# Supprimer les fichiers générés qui peuvent causer des conflits
rm -f next-env.d.ts 2>/dev/null || true
git stash 2>/dev/null || true
# Forcer la suppression des fichiers ignorés qui pourraient être trackés
git clean -fd 2>/dev/null || true
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
pm2 stop all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Tuer tous les processus Node/Next qui utilisent le port 3000
echo "🔍 Libération du port 3000..."
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
pkill -9 -f "node.*start" 2>/dev/null || true

# Libérer le port 3000 avec différentes méthodes
if command -v lsof &> /dev/null; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
fi
if command -v ss &> /dev/null; then
    ss -K dport = 3000 2>/dev/null || true
fi

# Attendre que tout soit arrêté
sleep 3

# Vérifier que le port est libre
echo "⏳ Vérification que le port 3000 est libre..."
for i in {1..15}; do
    if command -v ss &> /dev/null; then
        if ! ss -tlnp 2>/dev/null | grep -q ":3000"; then
            echo "✅ Port 3000 libéré"
            break
        fi
    elif command -v netstat &> /dev/null; then
        if ! netstat -tlnp 2>/dev/null | grep -q ":3000"; then
            echo "✅ Port 3000 libéré"
            break
        fi
    else
        # Si ni ss ni netstat ne sont disponibles, on attend un peu plus
        if [ $i -eq 5 ]; then
            echo "⚠️  Impossible de vérifier le port, continuation..."
            break
        fi
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Le port 3000 est toujours occupé après 15 tentatives"
        echo "🔍 Processus utilisant le port 3000:"
        if command -v lsof &> /dev/null; then
            lsof -i:3000 2>/dev/null || true
        elif command -v ss &> /dev/null; then
            ss -tlnp | grep ":3000" || true
        fi
        echo "💡 Essayez manuellement: sudo kill -9 \$(lsof -ti:3000)"
        exit 1
    fi
    echo "   Attente... ($i/15)"
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

