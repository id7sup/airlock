#!/bin/bash

# Script pour libérer le port 3000 et redémarrer proprement l'application

set -e

echo "🛑 Arrêt complet de l'application..."

# 1. Arrêter PM2 complètement
echo "   → Arrêt de PM2..."
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 2

# 2. Tuer tous les processus Node/Next.js
echo "   → Arrêt de tous les processus Node/Next.js..."
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
pkill -9 -f "node.*start" 2>/dev/null || true
pkill -9 -f "node.*airlock" 2>/dev/null || true
sleep 2

# 3. Libérer le port 3000 avec toutes les méthodes disponibles
echo "   → Libération du port 3000..."

# Méthode 1: lsof
if command -v lsof &> /dev/null; then
    LSOF_PIDS=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$LSOF_PIDS" ]; then
        echo "   → Processus trouvés avec lsof, arrêt..."
        echo "$LSOF_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Méthode 2: fuser
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 1
fi

# Méthode 3: ss + kill
if command -v ss &> /dev/null; then
    SS_OUTPUT=$(ss -tlnp 2>/dev/null | grep ":3000" || true)
    if [ ! -z "$SS_OUTPUT" ]; then
        echo "   → Processus trouvés avec ss, arrêt..."
        SS_PIDS=$(echo "$SS_OUTPUT" | grep -oP 'pid=\K[0-9]+' || true)
        if [ ! -z "$SS_PIDS" ]; then
            echo "$SS_PIDS" | xargs kill -9 2>/dev/null || true
        fi
        sleep 1
    fi
fi

# Méthode 4: netstat (fallback)
if command -v netstat &> /dev/null; then
    NETSTAT_PIDS=$(netstat -tlnp 2>/dev/null | grep ":3000" | awk '{print $7}' | cut -d'/' -f1 | grep -E '^[0-9]+$' || true)
    if [ ! -z "$NETSTAT_PIDS" ]; then
        echo "   → Processus trouvés avec netstat, arrêt..."
        echo "$NETSTAT_PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

# Attendre que tout soit arrêté
echo "   → Attente de la libération du port..."
sleep 3

# 4. Vérifier que le port est libre
echo "⏳ Vérification que le port 3000 est libre..."
PORT_FREE=false
for i in {1..15}; do
    PORT_IN_USE=false
    
    if command -v ss &> /dev/null; then
        if ss -tlnp 2>/dev/null | grep -q ":3000"; then
            PORT_IN_USE=true
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
            PORT_IN_USE=true
        fi
    elif command -v lsof &> /dev/null; then
        if lsof -ti:3000 &>/dev/null; then
            PORT_IN_USE=true
        fi
    else
        echo "⚠️  Impossible de vérifier le port (outils non disponibles). Supposons qu'il est libre."
        PORT_FREE=true
        break
    fi

    if ! $PORT_IN_USE; then
        echo "✅ Port 3000 libéré !"
        PORT_FREE=true
        break
    fi
    
    echo "   → Attente... ($i/15)"
    sleep 1
done

if ! $PORT_FREE; then
    echo "❌ Le port 3000 est toujours occupé après 15 tentatives."
    echo "🔍 Processus utilisant le port 3000:"
    if command -v lsof &> /dev/null; then
        lsof -i:3000 || true
    elif command -v ss &> /dev/null; then
        ss -tlnp | grep ":3000" || true
    elif command -v netstat &> /dev/null; then
        netstat -tlnp | grep ":3000" || true
    fi
    echo "💡 Essayez manuellement: sudo kill -9 \$(lsof -ti:3000)"
    exit 1
fi

# 5. Nettoyer les logs PM2
echo "🧹 Nettoyage des logs PM2..."
pm2 flush 2>/dev/null || true

# 6. Redémarrer PM2 daemon
echo "🔄 Redémarrage du daemon PM2..."
pm2 kill 2>/dev/null || true
sleep 1
pm2 ping 2>/dev/null || true

echo "✅ Nettoyage terminé ! Le port 3000 est libre."
echo ""
echo "📝 Pour redémarrer l'application, exécutez:"
echo "   cd /var/www/airlock && ./deploy-simple.sh"

