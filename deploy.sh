#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/airlock"
BRANCH="main"
PM2_NAME="airlock"
PORT="3000"

log() { echo -e "$1"; }

cd "$APP_DIR"

log "🚀 Déploiement..."

# 1) Sync code (robuste, aucun blocage par fichiers modifiés localement)
log "📥 Mise à jour (fetch + reset)..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

# Nettoyage prudent : ajuste les exclusions si tu as des fichiers/dossiers persistants
# (ex: .env.local, uploads/, storage/, logs/, etc.)
log "🧹 Nettoyage..."
git clean -fd \
  -e ".env" \
  -e ".env.*" \
  -e "uploads/" \
  -e "storage/" \
  -e "logs/"

# 2) Dépendances (déterministe)
log "📦 Installation (npm ci)..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# 3) Build
log "🔨 Build..."
rm -rf .next
npm run build

# 4) Redémarrage PM2 propre
log "♻️ Redémarrage PM2..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME" --update-env
else
  pm2 start npm --name "$PM2_NAME" -- start
fi
pm2 save

# 5) Vérification
log "🔎 Vérification..."
sleep 3

if pm2 jlist 2>/dev/null | grep -q "\"name\":\"$PM2_NAME\".*\"status\":\"online\""; then
  log "✅ Déployé et en ligne."
  pm2 status "$PM2_NAME"
else
  log "❌ Erreur au démarrage"
  pm2 logs "$PM2_NAME" --lines 50 --nostream || true
  exit 1
fi

# 6) (Optionnel) Vérifier que le port écoute bien
if command -v ss >/dev/null 2>&1; then
  if ss -tln 2>/dev/null | grep -q ":$PORT"; then
    log "✅ Port $PORT à l'écoute."
  else
    log "⚠️ Port $PORT non détecté en écoute (à vérifier)."
  fi
fi
