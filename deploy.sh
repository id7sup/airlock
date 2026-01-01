
#!/bin/bash

# Script de déploiement pour Airlock
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement d'Airlock..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (à adapter selon votre serveur)
SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-votre-serveur.com}"
SERVER_PATH="${SERVER_PATH:-/var/www/airlock}"
GIT_REPO="${GIT_REPO:-https://github.com/votre-username/airlock.git}"

echo -e "${YELLOW}📦 Étape 1: Vérification de Git...${NC}"
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Erreur: Ce n'est pas un dépôt Git${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dépôt Git détecté${NC}"

echo -e "${YELLOW}📦 Étape 2: Vérification des modifications non commitées...${NC}"
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Attention: Vous avez des modifications non commitées${NC}"
    read -p "Voulez-vous les committer avant de déployer? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Message de commit: " commit_message
        git commit -m "$commit_message"
    fi
fi

echo -e "${YELLOW}📦 Étape 3: Push vers GitHub...${NC}"
current_branch=$(git branch --show-current)
echo "Branche actuelle: $current_branch"
git push origin "$current_branch"

echo -e "${GREEN}✓ Code poussé vers GitHub${NC}"

echo -e "${YELLOW}📦 Étape 4: Connexion au serveur et déploiement...${NC}"
echo "Connexion à $SERVER_USER@$SERVER_HOST..."

ssh "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
set -e

cd /var/www/airlock || exit 1

echo "📥 Récupération de la dernière version..."
git fetch origin
git reset --hard origin/main || git reset --hard origin/master

echo "📦 Installation des dépendances..."
npm ci --production=false

echo "🔨 Build de l'application..."
npm run build

echo "🔄 Redémarrage de l'application..."
# Si vous utilisez PM2:
# pm2 restart airlock
# Si vous utilisez systemd:
# sudo systemctl restart airlock
# Si vous utilisez directement Next.js:
# pkill -f "next start" || true
# nohup npm start > /var/log/airlock.log 2>&1 &

echo "✅ Déploiement terminé!"
ENDSSH

echo -e "${GREEN}✅ Déploiement réussi!${NC}"

