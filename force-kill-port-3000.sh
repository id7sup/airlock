#!/bin/bash

# Script ULTRA-AGRESSIF pour forcer la libération du port 3000
# À utiliser en dernier recours

set -e

echo "🔥 FORCE KILL - Libération agressive du port 3000"
echo ""

# 1. Identifier TOUS les processus utilisant le port 3000
echo "🔍 Identification de tous les processus..."
echo ""

if command -v lsof &> /dev/null; then
    echo "→ Avec lsof:"
    lsof -i:3000 || echo "   (aucun processus trouvé)"
    echo ""
    LSOF_PIDS=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$LSOF_PIDS" ]; then
        echo "→ PIDs trouvés: $LSOF_PIDS"
        for pid in $LSOF_PIDS; do
            echo "   → Kill -9 PID: $pid"
            kill -9 $pid 2>/dev/null || true
        done
        sleep 2
    fi
fi

if command -v ss &> /dev/null; then
    echo "→ Avec ss:"
    ss -tlnp 2>/dev/null | grep ":3000" || echo "   (aucun processus trouvé)"
    echo ""
    SS_PIDS=$(ss -tlnp 2>/dev/null | grep ":3000" | grep -oP 'pid=\K[0-9]+' || true)
    if [ ! -z "$SS_PIDS" ]; then
        echo "→ PIDs trouvés: $SS_PIDS"
        for pid in $SS_PIDS; do
            echo "   → Kill -9 PID: $pid"
            kill -9 $pid 2>/dev/null || true
        done
        sleep 2
    fi
fi

if command -v fuser &> /dev/null; then
    echo "→ Avec fuser:"
    fuser 3000/tcp 2>/dev/null || echo "   (aucun processus trouvé)"
    echo ""
    echo "   → Kill avec fuser..."
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

# 2. Tuer TOUS les processus Node/Next de manière ultra-agressive
echo ""
echo "🔪 Tuer TOUS les processus Node/Next.js..."
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
pkill -9 -f "node.*start" 2>/dev/null || true
pkill -9 -f "node.*airlock" 2>/dev/null || true
pkill -9 node 2>/dev/null || true
sleep 3

# 3. Arrêter PM2 complètement
echo ""
echo "🛑 Arrêt complet de PM2..."
pm2 delete all 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 3

# 4. Vérification finale
echo ""
echo "✅ Vérification finale..."
echo ""

PORT_STILL_IN_USE=false

if command -v lsof &> /dev/null; then
    FINAL_CHECK=$(lsof -i:3000 2>/dev/null || true)
    if [ ! -z "$FINAL_CHECK" ]; then
        echo "⚠️  Port 3000 TOUJOURS occupé:"
        echo "$FINAL_CHECK"
        PORT_STILL_IN_USE=true
    fi
fi

if command -v ss &> /dev/null; then
    SS_FINAL=$(ss -tlnp 2>/dev/null | grep ":3000" || true)
    if [ ! -z "$SS_FINAL" ]; then
        echo "⚠️  Port 3000 TOUJOURS occupé (ss):"
        echo "$SS_FINAL"
        PORT_STILL_IN_USE=true
    fi
fi

if [ "$PORT_STILL_IN_USE" = false ]; then
    echo "✅ Port 3000 est maintenant LIBRE !"
    echo ""
    echo "📝 Vous pouvez maintenant exécuter:"
    echo "   ./deploy-simple.sh"
else
    echo ""
    echo "❌ Le port 3000 est TOUJOURS occupé après toutes les tentatives."
    echo ""
    echo "🔍 Informations détaillées:"
    echo ""
    if command -v lsof &> /dev/null; then
        echo "→ lsof -i:3000:"
        lsof -i:3000 || echo "   (rien)"
    fi
    if command -v ss &> /dev/null; then
        echo "→ ss -tlnp | grep :3000:"
        ss -tlnp 2>/dev/null | grep ":3000" || echo "   (rien)"
    fi
    echo ""
    echo "💡 Essayez manuellement:"
    echo "   sudo lsof -i:3000"
    echo "   sudo kill -9 \$(sudo lsof -ti:3000)"
    echo ""
    echo "   Ou changez le port dans next.config.js"
    exit 1
fi

