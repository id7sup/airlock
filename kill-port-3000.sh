#!/bin/bash

# Script pour tuer tous les processus sur le port 3000

echo "🛑 Arrêt de tous les processus sur le port 3000..."

# Méthode 1: Utiliser lsof si disponible
if command -v lsof &> /dev/null; then
    echo "📋 Utilisation de lsof..."
    PIDS=$(lsof -ti:3000 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo "Processus trouvés: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Méthode 2: Utiliser ss/fuser
if command -v ss &> /dev/null; then
    echo "📋 Utilisation de ss..."
    PIDS=$(ss -tlnp | grep ":3000" | grep -oP 'pid=\K[0-9]+' | sort -u)
    if [ -n "$PIDS" ]; then
        echo "Processus trouvés: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Méthode 3: Tuer tous les processus next-server
echo "📋 Arrêt des processus next-server..."
pkill -9 -f "next-server" || true
pkill -9 -f "next start" || true
pkill -9 -f "node.*next" || true
pkill -9 -f "node.*3000" || true

sleep 3

# Vérifier que le port est libre
if ss -tlnp | grep -q ":3000"; then
    echo "⚠️  Le port 3000 est encore utilisé!"
    ss -tlnp | grep ":3000"
    echo "Tentative de tuer de force..."
    
    # Dernière tentative avec fuser si disponible
    if command -v fuser &> /dev/null; then
        fuser -k 3000/tcp 2>/dev/null || true
    fi
    
    sleep 3
    
    if ss -tlnp | grep -q ":3000"; then
        echo "❌ Impossible de libérer le port 3000"
        echo "Vérifiez manuellement avec: ss -tlnp | grep :3000"
        exit 1
    fi
fi

echo "✅ Le port 3000 est maintenant libre"

