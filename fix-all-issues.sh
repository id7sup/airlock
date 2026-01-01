#!/bin/bash

# Script complet pour corriger tous les problèmes de déploiement

set -e

echo "🔧 Correction complète des problèmes de déploiement..."

cd /var/www/airlock || exit 1

# 1. Arrêter TOUS les processus Next.js/Node
echo "🛑 Étape 1: Arrêt de tous les processus..."
pkill -f "next-server" || true
pkill -f "next start" || true
pkill -f "node.*next" || true
pkill -f "node.*airlock" || true

# Arrêter PM2 si l'application tourne
pm2 delete airlock 2>/dev/null || true
pm2 kill 2>/dev/null || true

# Attendre que les processus se terminent
sleep 5

# Tuer de force les processus restants
ps aux | grep -E "next|node.*start|node.*3000" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 3

# Vérifier que le port 3000 est libre
if ss -tlnp | grep -q ":3000"; then
    echo "⚠️  Le port 3000 est encore utilisé, identification du processus..."
    ss -tlnp | grep ":3000"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 3
fi

echo "✅ Tous les processus sont arrêtés"

# 2. Vérifier et rebuilder si nécessaire
echo ""
echo "🔨 Étape 2: Vérification du build..."
if [ ! -d ".next" ] || [ ".next" -ot "package.json" ]; then
    echo "⚠️  Build obsolète ou manquant, reconstruction..."
    rm -rf .next
    npm run build
else
    echo "✅ Build à jour"
fi

# 3. Vérifier les permissions
echo ""
echo "🔍 Étape 3: Vérification des permissions..."
chown -R root:root .next 2>/dev/null || chown -R www-data:www-data .next 2>/dev/null || true
chmod -R 755 .next

# 4. Configurer nginx
echo ""
echo "🔧 Étape 4: Configuration de nginx..."

NGINX_CONFIG="/etc/nginx/sites-available/airlock"
NGINX_ENABLED="/etc/nginx/sites-enabled/airlock"

# Vérifier si la configuration existe
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "📝 Création de la configuration nginx..."
    
    # Obtenir le nom de domaine depuis la configuration existante ou utiliser airlck.com
    DOMAIN=$(grep -r "server_name" /etc/nginx/sites-enabled/* 2>/dev/null | grep -v "#" | head -1 | awk '{print $2}' | sed 's/;//' || echo "airlck.com")
    
    sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Taille maximale des uploads
    client_max_body_size 100M;

    # Proxy vers Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Servir les fichiers statiques Next.js (IMPORTANT pour éviter les 404)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_cache_valid 200 60m;
        proxy_cache_valid 404 1m;
        add_header Cache-Control "public, immutable";
    }

    # Webpack HMR (pour le développement)
    location /_next/webpack-hmr {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Fichiers publics
    location /assets {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

    # Créer le lien symbolique
    sudo ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED" 2>/dev/null || true
    
    echo "✅ Configuration nginx créée"
else
    echo "✅ Configuration nginx existe déjà"
    
    # Vérifier qu'elle contient la section _next/static
    if ! grep -q "_next/static" "$NGINX_CONFIG"; then
        echo "⚠️  Ajout de la section _next/static..."
        # Ajouter la section avant le dernier }
        sudo sed -i '/location \/ {/a\
    # Servir les fichiers statiques Next.js\
    location /_next/static {\
        proxy_pass http://localhost:3000;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        add_header Cache-Control "public, immutable";\
    }' "$NGINX_CONFIG"
    fi
fi

# Désactiver la configuration par défaut si elle existe
if [ -f "/etc/nginx/sites-enabled/default" ] && [ -L "/etc/nginx/sites-enabled/default" ]; then
    echo "⚠️  Désactivation de la configuration par défaut..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Tester la configuration nginx
echo "🔍 Test de la configuration nginx..."
if sudo nginx -t; then
    echo "✅ Configuration nginx valide"
    echo "🔄 Rechargement de nginx..."
    sudo systemctl reload nginx
else
    echo "❌ Erreur dans la configuration nginx"
    exit 1
fi

# 5. Démarrer l'application avec PM2
echo ""
echo "🚀 Étape 5: Démarrage de l'application..."

# S'assurer que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installation de PM2..."
    npm install -g pm2
fi

# Démarrer l'application
pm2 start npm --name "airlock" -- start
pm2 save

# Attendre que l'application démarre
sleep 5

# Vérifier le statut
echo ""
echo "📊 Statut PM2:"
pm2 status

# 6. Vérifications finales
echo ""
echo "🔍 Étape 6: Vérifications finales..."

# Vérifier que l'application répond
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Application accessible sur http://localhost:3000"
else
    echo "⚠️  Application retourne le code HTTP: $HTTP_CODE"
    echo "📋 Logs:"
    pm2 logs airlock --lines 20 --nostream
fi

# Vérifier qu'un chunk est accessible
CHUNK_FILE=$(find .next/static/chunks -name "*.js" | head -1)
if [ -n "$CHUNK_FILE" ]; then
    CHUNK_NAME=$(basename "$CHUNK_FILE")
    CHUNK_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/_next/static/chunks/$CHUNK_NAME" || echo "000")
    if [ "$CHUNK_CODE" = "200" ]; then
        echo "✅ Chunks accessibles"
    else
        echo "⚠️  Chunk retourne le code: $CHUNK_CODE"
    fi
fi

echo ""
echo "✅ Correction terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Videz le cache de votre navigateur (Ctrl+Shift+R ou Cmd+Shift+R)"
echo "2. Testez l'application sur https://airlck.com"
echo "3. Vérifiez les logs si nécessaire: pm2 logs airlock"

