#!/bin/bash

# Script simple pour libérer le port 3000
# Usage: ./kill-port.sh

echo "🔍 Libération du port 3000..."

# Arrêter PM2
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
sleep 1

# Tuer tous les processus next-server
pkill -9 -f "next-server" 2>/dev/null || true
sleep 1

# Utiliser lsof
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$PIDS" ]; then
        echo "   Processus trouvés: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Utiliser ss
if command -v ss &> /dev/null; then
    SS_PIDS=$(ss -tlnp 2>/dev/null | grep ":3000" | grep -oP 'pid=\K[0-9]+' || true)
    if [ ! -z "$SS_PIDS" ]; then
        echo "   Processus trouvés: $SS_PIDS"
        echo "$SS_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Vérification
if command -v ss &> /dev/null && ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "⚠️  Le port 3000 est encore occupé"
    ss -tlnp 2>/dev/null | grep ":3000"
else
    echo "✅ Port 3000 libéré"
fi

