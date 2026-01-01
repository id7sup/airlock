#!/bin/bash

# Configuration rapide du déploiement

echo "🔧 Configuration du déploiement"
echo ""

read -p "Adresse du serveur (ex: root@airlck.com): " server_input
SERVER_USER=$(echo "$server_input" | cut -d@ -f1)
SERVER_HOST=$(echo "$server_input" | cut -d@ -f2)

read -p "Chemin sur le serveur [/var/www/airlock]: " server_path
SERVER_PATH="${server_path:-/var/www/airlock}"

# Créer le fichier de configuration
cat > .deploy-config << EOF
export SERVER_USER="$SERVER_USER"
export SERVER_HOST="$SERVER_HOST"
export SERVER_PATH="$SERVER_PATH"
export GIT_BRANCH="main"
EOF

echo ""
echo "✅ Configuration sauvegardée !"
echo ""
echo "Pour l'utiliser: source .deploy-config"
echo "Puis: ./deploy-auto.sh"

