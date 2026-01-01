#!/bin/bash

# Script de déploiement automatique complet
# Usage: ./deploy-auto.sh [message de commit]

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (à adapter selon votre serveur)
SERVER_USER="${SERVER_USER:-root}"
SERVER_HOST="${SERVER_HOST:-votre-serveur.com}"
SERVER_PATH="${SERVER_PATH:-/var/www/airlock}"
GIT_BRANCH="${GIT_BRANCH:-main}"

echo -e "${BLUE}🚀 Déploiement automatique d'Airlock${NC}"
echo ""

# ============================================
# ÉTAPE 1: Vérifications locales
# ============================================
echo -e "${YELLOW}📋 Étape 1: Vérifications locales...${NC}"

# Vérifier que nous sommes dans un dépôt Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Erreur: Ce n'est pas un dépôt Git${NC}"
    exit 1
fi

# Vérifier la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}✓ Branche actuelle: $CURRENT_BRANCH${NC}"

# Vérifier les modifications
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Modifications non commitées détectées${NC}"
    
    # Demander si on veut les committer
    read -p "Voulez-vous committer ces modifications? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Message de commit
        if [ -z "$1" ]; then
            read -p "Message de commit: " commit_message
        else
            commit_message="$1"
        fi
        
        if [ -z "$commit_message" ]; then
            commit_message="Mise à jour automatique $(date +%Y-%m-%d\ %H:%M:%S)"
        fi
        
        echo -e "${YELLOW}📝 Commit des modifications...${NC}"
        git add .
        git commit -m "$commit_message"
        echo -e "${GREEN}✓ Modifications commitées${NC}"
    else
        echo -e "${YELLOW}⚠️  Les modifications non commitées ne seront pas déployées${NC}"
    fi
fi

# ============================================
# ÉTAPE 2: Push vers GitHub
# ============================================
echo ""
echo -e "${YELLOW}📤 Étape 2: Push vers GitHub...${NC}"

# Vérifier si on est à jour avec origin
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")

if [ -z "$REMOTE" ]; then
    echo -e "${YELLOW}⚠️  Pas de remote 'origin' configuré${NC}"
    read -p "Voulez-vous continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo -e "${YELLOW}⚠️  La branche locale n'est pas à jour avec origin${NC}"
        echo "Pulling les dernières modifications..."
        git pull origin "$GIT_BRANCH" --no-rebase || {
            echo -e "${RED}❌ Erreur lors du pull. Résolvez les conflits et réessayez.${NC}"
            exit 1
        }
    fi
fi

# Push vers GitHub
echo -e "${YELLOW}📤 Push vers origin/$GIT_BRANCH...${NC}"
if git push origin "$GIT_BRANCH"; then
    echo -e "${GREEN}✓ Code poussé vers GitHub${NC}"
else
    echo -e "${RED}❌ Erreur lors du push vers GitHub${NC}"
    exit 1
fi

# ============================================
# ÉTAPE 3: Déploiement sur le serveur
# ============================================
echo ""
echo -e "${YELLOW}🖥️  Étape 3: Déploiement sur le serveur...${NC}"

# Vérifier si les variables de serveur sont configurées
if [ "$SERVER_HOST" = "votre-serveur.com" ]; then
    echo -e "${YELLOW}⚠️  Configuration du serveur non définie${NC}"
    read -p "Voulez-vous configurer maintenant? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Adresse du serveur (ex: root@192.168.1.100): " server_input
        SERVER_USER=$(echo "$server_input" | cut -d@ -f1)
        SERVER_HOST=$(echo "$server_input" | cut -d@ -f2)
        read -p "Chemin sur le serveur (défaut: /var/www/airlock): " server_path
        SERVER_PATH="${server_path:-/var/www/airlock}"
    else
        echo -e "${YELLOW}⚠️  Déploiement sur serveur ignoré${NC}"
        echo -e "${GREEN}✅ Déploiement local terminé!${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}Connexion à $SERVER_USER@$SERVER_HOST...${NC}"

# Exécuter les commandes sur le serveur
ssh "$SERVER_USER@$SERVER_HOST" << ENDSSH
set -e

echo "📥 Récupération des modifications depuis GitHub..."
cd $SERVER_PATH || exit 1

# Sauvegarder les modifications locales si nécessaire
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Modifications locales détectées, sauvegarde..."
    git stash
fi

# Récupérer la dernière version
git fetch origin
git reset --hard origin/$GIT_BRANCH

echo "📦 Installation/mise à jour des dépendances..."
npm ci --production=false

echo "🔨 Build de l'application..."
rm -rf .next
npm run build

echo "🛑 Arrêt de l'application..."
# Tuer tous les processus sur le port 3000
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next start" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 3

# Arrêter PM2
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true

# Attendre que le port soit libre
for i in {1..10}; do
    if ! ss -tlnp 2>/dev/null | grep -q ":3000"; then
        break
    fi
    echo "Attente de la libération du port 3000... ($i/10)"
    sleep 1
done

if ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "❌ Le port 3000 est toujours utilisé!"
    ss -tlnp | grep ":3000"
    exit 1
fi

echo "🚀 Démarrage de l'application..."
# S'assurer que PM2 est installé
npm install -g pm2 2>/dev/null || true

# Démarrer avec PM2
pm2 start npm --name "airlock" -- start
pm2 save

# Attendre que l'application démarre
sleep 5

echo "🔍 Vérification..."
# Vérifier le statut
pm2 status

# Vérifier que l'application répond
HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "\$HTTP_CODE" = "200" ]; then
    echo "✅ Application démarrée avec succès!"
else
    echo "⚠️  Application retourne le code HTTP: \$HTTP_CODE"
    echo "📋 Logs:"
    pm2 logs airlock --lines 20 --nostream
fi

echo "✅ Déploiement sur serveur terminé!"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Déploiement complet réussi!${NC}"
    echo ""
    echo -e "${BLUE}📋 Prochaines étapes:${NC}"
    echo "1. Videz le cache de votre navigateur (Ctrl+Shift+R)"
    echo "2. Testez l'application sur https://airlck.com"
    echo "3. Vérifiez les logs si nécessaire: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs airlock'"
else
    echo -e "${RED}❌ Erreur lors du déploiement sur le serveur${NC}"
    exit 1
fi

