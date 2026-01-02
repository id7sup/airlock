#!/bin/bash

# Script pour redémarrer l'application et tester les logs

set -e

cd /var/www/airlock || exit 1

echo "🔄 Redémarrage de l'application..."

# 1. Récupérer les dernières modifications
echo "📥 Récupération depuis GitHub..."
git pull origin main

# 2. Rebuild si nécessaire
echo "🔨 Build de l'application..."
npm run build

# 3. Redémarrer PM2
echo "🔄 Redémarrage PM2..."
pm2 restart airlock

# 4. Attendre que l'application démarre
echo "⏳ Attente du démarrage..."
sleep 5

# 5. Vérifier le statut
echo "📊 Statut PM2:"
pm2 status

# 6. Vérifier que l'application répond
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Application accessible sur http://localhost:3000"
else
    echo "⚠️  Code HTTP: $HTTP_CODE"
fi

echo ""
echo "✅ Redémarrage terminé !"
echo ""
echo "📋 Pour voir les logs en temps réel :"
echo "   pm2 logs airlock --lines 0"
echo ""
echo "📋 Pour voir les logs après avoir testé un lien :"
echo "   pm2 logs airlock --lines 100 --nostream --err | grep -E '\[SHARE_PAGE\]|\[VALIDATE_SHARE\]'"
echo ""
echo "🌐 Testez maintenant un lien de partage sur https://airlck.com/share/[token]"

