#!/bin/bash

# Script pour tuer spécifiquement les processus next-server qui bloquent le port 3000

set -e

echo "🔍 Recherche des processus next-server..."

# Trouver tous les processus next-server
NEXT_SERVER_PIDS=$(ps aux | grep "next-server" | grep -v grep | awk '{print $2}' || true)

if [ ! -z "$NEXT_SERVER_PIDS" ]; then
    echo "→ Processus next-server trouvés: $NEXT_SERVER_PIDS"
    for pid in $NEXT_SERVER_PIDS; do
        echo "   → Kill -9 PID: $pid"
        kill -9 $pid 2>/dev/null || true
    done
    sleep 2
else
    echo "→ Aucun processus next-server trouvé"
fi

# Vérifier avec ss
if command -v ss &> /dev/null; then
    SS_OUTPUT=$(ss -tlnp 2>/dev/null | grep ":3000" | grep "next-server" || true)
    if [ ! -z "$SS_OUTPUT" ]; then
        echo "→ Processus next-server trouvé avec ss sur port 3000:"
        echo "$SS_OUTPUT"
        SS_PIDS=$(echo "$SS_OUTPUT" | grep -oP 'pid=\K[0-9]+' || true)
        if [ ! -z "$SS_PIDS" ]; then
            echo "→ PIDs à tuer: $SS_PIDS"
            for pid in $SS_PIDS; do
                echo "   → Kill -9 PID: $pid"
                kill -9 $pid 2>/dev/null || true
            done
            sleep 2
        fi
    fi
fi

# Vérification finale
echo ""
echo "✅ Vérification finale..."
if command -v ss &> /dev/null; then
    FINAL_CHECK=$(ss -tlnp 2>/dev/null | grep ":3000" | grep "next-server" || true)
    if [ -z "$FINAL_CHECK" ]; then
        echo "✅ Aucun processus next-server sur le port 3000"
    else
        echo "⚠️  Processus next-server toujours présent:"
        echo "$FINAL_CHECK"
        echo ""
        echo "💡 Essayez: sudo kill -9 \$(sudo ss -tlnp | grep ':3000' | grep -oP 'pid=\K[0-9]+')"
    fi
fi

