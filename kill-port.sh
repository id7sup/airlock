#!/bin/bash

# Script pour FORCER la libération du port 3000
echo "🔪 Libération FORCÉE du port 3000..."

# 1. PM2
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2

# 2. Tuer TOUS les processus Node/Next
pkill -9 node 2>/dev/null || true
pkill -9 -f next 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
sleep 2

# 3. Trouver et tuer avec lsof
if command -v lsof &> /dev/null; then
    for i in {1..5}; do
        PIDS=$(lsof -ti:3000 2>/dev/null || true)
        if [ ! -z "$PIDS" ]; then
            echo "$PIDS" | xargs kill -9 2>/dev/null || true
            sleep 1
        else
            break
        fi
    done
fi

# 4. Trouver et tuer avec ss
if command -v ss &> /dev/null; then
    for i in {1..5}; do
        SS_PIDS=$(ss -tlnp 2>/dev/null | grep ":3000" | grep -oP 'pid=\K[0-9]+' || true)
        if [ ! -z "$SS_PIDS" ]; then
            echo "$SS_PIDS" | xargs kill -9 2>/dev/null || true
            sleep 1
        else
            break
        fi
    done
fi

# 5. Utiliser fuser si disponible
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 1
fi

# 6. Redémarrer PM2 daemon
pm2 kill 2>/dev/null || true
sleep 1

# Vérification finale
if command -v ss &> /dev/null && ss -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "⚠️  Port 3000 toujours occupé après tentatives"
    ss -tlnp 2>/dev/null | grep ":3000"
    exit 1
else
    echo "✅ Port 3000 libéré"
    exit 0
fi

