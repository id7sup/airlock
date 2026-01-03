#!/bin/bash

# Script ULTRA-AGRESSIF pour libérer le port 3000
echo "🔪 Libération ULTRA-FORCÉE du port 3000..."

# 1. PM2 - ARRÊT TOTAL
echo "   → Arrêt PM2..."
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 kill 2>/dev/null || true
sleep 3

# 2. Tuer TOUS les processus Node/Next de manière AGRESSIVE
echo "   → Tuer tous les processus Node/Next..."
pkill -9 node 2>/dev/null || true
pkill -9 -f next 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "npm.*start" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
sleep 3

# 3. Trouver TOUS les PIDs qui utilisent le port 3000 et les tuer
echo "   → Recherche des processus sur le port 3000..."

# Méthode 1: lsof
if command -v lsof &> /dev/null; then
    for i in {1..10}; do
        PIDS=$(lsof -ti:3000 2>/dev/null || true)
        if [ ! -z "$PIDS" ]; then
            echo "      PIDs trouvés avec lsof: $PIDS"
            for pid in $PIDS; do
                kill -9 $pid 2>/dev/null || true
                sleep 0.5
            done
            sleep 2
        else
            break
        fi
    done
fi

# Méthode 2: ss
if command -v ss &> /dev/null; then
    for i in {1..10}; do
        SS_OUTPUT=$(ss -tlnp 2>/dev/null | grep ":3000" || true)
        if [ ! -z "$SS_OUTPUT" ]; then
            SS_PIDS=$(echo "$SS_OUTPUT" | grep -oP 'pid=\K[0-9]+' || true)
            if [ ! -z "$SS_PIDS" ]; then
                echo "      PIDs trouvés avec ss: $SS_PIDS"
                for pid in $SS_PIDS; do
                    kill -9 $pid 2>/dev/null || true
                    sleep 0.5
                done
                sleep 2
            else
                # Si on ne peut pas extraire le PID, tuer tous les processus next-server
                pkill -9 -f "next-server" 2>/dev/null || true
                sleep 2
            fi
        else
            break
        fi
    done
fi

# Méthode 3: netstat
if command -v netstat &> /dev/null; then
    NETSTAT_PIDS=$(netstat -tlnp 2>/dev/null | grep ":3000" | grep -oP '/\K[0-9]+' || true)
    if [ ! -z "$NETSTAT_PIDS" ]; then
        echo "      PIDs trouvés avec netstat: $NETSTAT_PIDS"
        for pid in $NETSTAT_PIDS; do
            kill -9 $pid 2>/dev/null || true
        done
        sleep 2
    fi
fi

# Méthode 4: fuser
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

# 4. Tuer à nouveau TOUS les processus Node (au cas où)
echo "   → Nettoyage final..."
pkill -9 node 2>/dev/null || true
pkill -9 -f next 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
sleep 3

# 5. Redémarrer PM2 daemon proprement
pm2 kill 2>/dev/null || true
sleep 2

# Vérification finale avec AFFICHAGE DÉTAILLÉ
echo "   → Vérification finale..."
PORT_OCCUPIED=false

if command -v ss &> /dev/null; then
    SS_CHECK=$(ss -tlnp 2>/dev/null | grep ":3000" || true)
    if [ ! -z "$SS_CHECK" ]; then
        echo "      ⚠️  Port encore occupé (ss):"
        echo "$SS_CHECK"
        PORT_OCCUPIED=true
    fi
fi

if command -v lsof &> /dev/null; then
    LSOF_CHECK=$(lsof -i:3000 2>/dev/null || true)
    if [ ! -z "$LSOF_CHECK" ]; then
        echo "      ⚠️  Port encore occupé (lsof):"
        echo "$LSOF_CHECK"
        PORT_OCCUPIED=true
    fi
fi

if [ "$PORT_OCCUPIED" = true ]; then
    echo ""
    echo "❌ ERREUR: Le port 3000 est TOUJOURS occupé!"
    echo ""
    echo "🔍 Processus en cours:"
    ps aux | grep -E "(next|node|3000)" | grep -v grep || true
    echo ""
    echo "💡 Solution: Redémarrez le serveur ou tuez manuellement le processus"
    exit 1
else
    echo "✅ Port 3000 libéré avec succès!"
    exit 0
fi

