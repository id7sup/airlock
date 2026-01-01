#!/bin/bash

# Script pour corriger les erreurs 404 des chunks JavaScript

set -e

echo "🔧 Correction des erreurs 404 des chunks JavaScript..."

cd /var/www/airlock || exit 1

# 1. Vérifier que le build existe
if [ ! -d ".next" ]; then
    echo "❌ Le dossier .next n'existe pas. Build nécessaire."
    echo "🔨 Construction de l'application..."
    npm run build
fi

# 2. Vérifier que les chunks existent
echo "🔍 Vérification des chunks..."
if [ -d ".next/static/chunks" ]; then
    CHUNK_COUNT=$(find .next/static/chunks -name "*.js" | wc -l)
    echo "✅ $CHUNK_COUNT chunks trouvés"
else
    echo "❌ Aucun chunk trouvé. Rebuild nécessaire."
    rm -rf .next
    npm run build
fi

# 3. Vérifier les permissions
echo "🔍 Vérification des permissions..."
chown -R airlock:airlock .next 2>/dev/null || chown -R www-data:www-data .next 2>/dev/null || true
chmod -R 755 .next

# 4. Vérifier la configuration nginx
echo "🔍 Vérification de la configuration nginx..."
if [ -f "/etc/nginx/sites-enabled/airlock" ] || [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "✅ Configuration nginx trouvée"
    echo "📋 Vérification de la syntaxe..."
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Configuration nginx valide"
        echo "🔄 Rechargement de nginx..."
        sudo systemctl reload nginx
    else
        echo "❌ Erreur dans la configuration nginx"
        echo "Vérifiez la configuration avec: sudo nginx -t"
    fi
else
    echo "⚠️  Configuration nginx non trouvée"
    echo "Assurez-vous que nginx est configuré pour servir /_next/static"
fi

# 5. Redémarrer l'application Next.js
echo "🔄 Redémarrage de l'application..."
if command -v pm2 &> /dev/null; then
    pm2 restart airlock
    sleep 3
    pm2 logs airlock --lines 20 --nostream
else
    pkill -f "next start" || true
    sleep 2
    nohup npm start > /var/log/airlock.log 2>&1 &
    sleep 3
    tail -20 /var/log/airlock.log
fi

# 6. Vérifier que l'application répond
echo "🔍 Vérification de l'application..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Application accessible"
else
    echo "⚠️  Application retourne le code HTTP: $HTTP_CODE"
fi

# 7. Tester un chunk spécifique
echo "🔍 Test d'un chunk..."
CHUNK_FILE=$(find .next/static/chunks -name "*.js" | head -1)
if [ -n "$CHUNK_FILE" ]; then
    CHUNK_NAME=$(basename "$CHUNK_FILE")
    echo "Test du chunk: $CHUNK_NAME"
    curl -s -o /dev/null -w "Code HTTP: %{http_code}\n" "http://localhost:3000/_next/static/chunks/$CHUNK_NAME" || true
fi

echo ""
echo "✅ Correction terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)"
echo "2. Vérifiez la console du navigateur pour d'autres erreurs"
echo "3. Si le problème persiste, vérifiez les logs: pm2 logs airlock"

