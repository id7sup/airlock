#!/bin/bash

# Script simple pour mettre à jour le serveur

set -e

echo "🔄 Mise à jour du serveur..."

cd /var/www/airlock || exit 1

# 1. Sauvegarder les modifications locales
echo "📦 Sauvegarde des modifications locales..."
git stash

# 2. Récupérer la dernière version
echo "📥 Récupération depuis GitHub..."
git pull origin main

# 3. Rendre les scripts exécutables
echo "🔧 Configuration des scripts..."
chmod +x *.sh

# 4. Installer les dépendances si nécessaire
echo "📦 Vérification des dépendances..."
npm install

# 5. Rebuild
echo "🔨 Build de l'application..."
rm -rf .next
npm run build

# 6. Redémarrer l'application
echo "🚀 Redémarrage de l'application..."
if [ -f "fix-all-issues.sh" ]; then
    ./fix-all-issues.sh
else
    echo "⚠️  Script fix-all-issues.sh non trouvé, redémarrage manuel..."
    pm2 restart airlock || {
        pkill -9 -f "next" || true
        sleep 3
        pm2 start npm --name "airlock" -- start
        pm2 save
    }
fi

echo "✅ Mise à jour terminée!"

