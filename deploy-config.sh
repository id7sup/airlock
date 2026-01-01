#!/bin/bash

# Script pour configurer les variables de déploiement

echo "🔧 Configuration du déploiement automatique"
echo ""

read -p "Adresse du serveur (ex: root@192.168.1.100 ou root@airlck.com): " server_input
SERVER_USER=$(echo "$server_input" | cut -d@ -f1)
SERVER_HOST=$(echo "$server_input" | cut -d@ -f2)

read -p "Chemin sur le serveur (défaut: /var/www/airlock): " server_path
SERVER_PATH="${server_path:-/var/www/airlock}"

read -p "Branche Git (défaut: main): " git_branch
GIT_BRANCH="${git_branch:-main}"

# Créer un fichier de configuration
cat > .deploy-config << EOF
# Configuration de déploiement automatique
# Généré le $(date)

export SERVER_USER="$SERVER_USER"
export SERVER_HOST="$SERVER_HOST"
export SERVER_PATH="$SERVER_PATH"
export GIT_BRANCH="$GIT_BRANCH"
EOF

echo ""
echo "✅ Configuration sauvegardée dans .deploy-config"
echo ""
echo "Pour utiliser cette configuration, ajoutez dans votre ~/.bashrc ou ~/.zshrc:"
echo "  source $(pwd)/.deploy-config"
echo ""
echo "Ou exportez les variables avant d'exécuter deploy-auto.sh:"
echo "  export SERVER_USER=\"$SERVER_USER\""
echo "  export SERVER_HOST=\"$SERVER_HOST\""
echo "  export SERVER_PATH=\"$SERVER_PATH\""
echo "  export GIT_BRANCH=\"$GIT_BRANCH\""

