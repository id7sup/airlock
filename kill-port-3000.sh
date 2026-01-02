#!/bin/bash

# Script pour forcer la libération du port 3000

echo "🔍 Recherche des processus utilisant le port 3000..."

# Méthode 1: lsof
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$PIDS" ]; then
        echo "   Processus trouvés avec lsof: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    else
        echo "   Aucun processus trouvé avec lsof"
    fi
fi

# Méthode 2: ss
if command -v ss &> /dev/null; then
    SS_OUTPUT=$(ss -tlnp 2>/dev/null | grep ":3000" || true)
    if [ ! -z "$SS_OUTPUT" ]; then
        echo "   Processus trouvé avec ss:"
        echo "$SS_OUTPUT"
        # Extraire les PIDs
        SS_PIDS=$(echo "$SS_OUTPUT" | grep -oP 'pid=\K[0-9]+' || true)
        if [ ! -z "$SS_PIDS" ]; then
            echo "   PIDs extraits: $SS_PIDS"
            echo "$SS_PIDS" | xargs kill -9 2>/dev/null || true
        fi
    else
        echo "   Aucun processus trouvé avec ss"
    fi
fi

# Méthode 3: netstat
if command -v netstat &> /dev/null; then
    NETSTAT_OUTPUT=$(netstat -tlnp 2>/dev/null | grep ":3000" || true)
    if [ ! -z "$NETSTAT_OUTPUT" ]; then
        echo "   Processus trouvé avec netstat:"
        echo "$NETSTAT_OUTPUT"
        # Extraire les PIDs
        NETSTAT_PIDS=$(echo "$NETSTAT_OUTPUT" | grep -oP '/\K[0-9]+' || true)
        if [ ! -z "$NETSTAT_PIDS" ]; then
            echo "   PIDs extraits: $NETSTAT_PIDS"
            echo "$NETSTAT_PIDS" | xargs kill -9 2>/dev/null || true
        fi
    else
        echo "   Aucun processus trouvé avec netstat"
    fi
fi

# Tuer tous les processus Node/Next de manière agressive
echo "🔪 Tuer tous les processus Node/Next..."
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
pkill -9 -f "node.*start" 2>/dev/null || true
pkill -9 node 2>/dev/null || true

# PM2
echo "🛑 Arrêt de PM2..."
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 kill 2>/dev/null || true

sleep 2

# Vérification finale
echo "✅ Vérification finale..."
if command -v lsof &> /dev/null; then
    FINAL_CHECK=$(lsof -i:3000 2>/dev/null || true)
    if [ -z "$FINAL_CHECK" ]; then
        echo "✅ Port 3000 libéré avec succès!"
    else
        echo "⚠️  Port 3000 toujours occupé:"
        echo "$FINAL_CHECK"
    fi
fi
