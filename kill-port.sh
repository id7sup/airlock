#!/bin/bash

# Script ULTRA-AGRESSIF pour libérer le port 3000
echo "🔪 Libération ULTRA-FORCÉE du port 3000..."

# 1. PM2 - ARRÊT TOTAL (pour root ET pour l'utilisateur airlock)
echo "   → Arrêt PM2..."
# PM2 pour root
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
pm2 kill 2>/dev/null || true
# PM2 pour l'utilisateur airlock (si existe)
if id "airlock" &>/dev/null; then
    sudo -u airlock pm2 delete airlock 2>/dev/null || true
    sudo -u airlock pm2 stop all 2>/dev/null || true
    sudo -u airlock pm2 kill 2>/dev/null || true
fi
sleep 3

# 2. Tuer TOUS les processus Node/Next de manière AGRESSIVE (pour TOUS les utilisateurs)
echo "   → Tuer tous les processus Node/Next..."
# Tuer par nom de processus (tous utilisateurs)
pkill -9 node 2>/dev/null || true
pkill -9 -f next 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "npm.*start" 2>/dev/null || true
pkill -9 -f "npm start" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
# Tuer par commande complète
pkill -9 -f "next start" 2>/dev/null || true
pkill -9 -f "next start -p 3000" 2>/dev/null || true
# Tuer spécifiquement pour l'utilisateur airlock
if id "airlock" &>/dev/null; then
    pkill -9 -u airlock node 2>/dev/null || true
    pkill -9 -u airlock -f next 2>/dev/null || true
    pkill -9 -u airlock -f "npm" 2>/dev/null || true
fi
sleep 3

# 2.5. Trouver et tuer les processus PARENTS (npm start) et leurs enfants - FORCE ROOT
echo "   → Recherche des processus parents (npm start)..."
if command -v pgrep &> /dev/null; then
    # Trouver tous les PIDs de npm start (tous utilisateurs)
    NPM_PIDS=$(pgrep -f "npm.*start" 2>/dev/null || true)
    if [ ! -z "$NPM_PIDS" ]; then
        echo "      PIDs npm start trouvés: $NPM_PIDS"
        for pid in $NPM_PIDS; do
            # Tuer le processus et TOUS ses enfants (en tant que root)
            kill -9 -$pid 2>/dev/null || true  # Le - devant le PID tue tout le groupe
            kill -9 $pid 2>/dev/null || true
            # Trouver les enfants de ce processus
            CHILD_PIDS=$(pgrep -P $pid 2>/dev/null || true)
            if [ ! -z "$CHILD_PIDS" ]; then
                echo "      Enfants trouvés: $CHILD_PIDS"
                for child in $CHILD_PIDS; do
                    kill -9 -$child 2>/dev/null || true
                    kill -9 $child 2>/dev/null || true
                done
            fi
        done
        sleep 3
    fi
    
    # Aussi chercher spécifiquement les processus de l'utilisateur airlock
    if id "airlock" &>/dev/null; then
        AIRLOCK_NPM_PIDS=$(pgrep -u airlock -f "npm" 2>/dev/null || true)
        if [ ! -z "$AIRLOCK_NPM_PIDS" ]; then
            echo "      PIDs npm de l'utilisateur airlock: $AIRLOCK_NPM_PIDS"
            for pid in $AIRLOCK_NPM_PIDS; do
                kill -9 -$pid 2>/dev/null || true
                kill -9 $pid 2>/dev/null || true
            done
            sleep 2
        fi
    fi
fi

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

# 4. Tuer à nouveau TOUS les processus Node (au cas où) - INCLUANT LES GROUPES
echo "   → Nettoyage final agressif..."
# Tuer tous les processus npm/node/next
pkill -9 node 2>/dev/null || true
pkill -9 -f next 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "npm" 2>/dev/null || true
pkill -9 -f "npm.*start" 2>/dev/null || true
pkill -9 -f "next start" 2>/dev/null || true

# Tuer par groupe de processus si possible
if command -v pgrep &> /dev/null; then
    # Trouver tous les PIDs et tuer leurs groupes
    ALL_NODE_PIDS=$(pgrep -f "node|next|npm" 2>/dev/null || true)
    if [ ! -z "$ALL_NODE_PIDS" ]; then
        for pid in $ALL_NODE_PIDS; do
            # Tuer le groupe de processus
            kill -9 -$pid 2>/dev/null || true
            kill -9 $pid 2>/dev/null || true
        done
    fi
fi

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
    ps aux | grep -E "(next|node|npm|3000)" | grep -v grep || true
    echo ""
    echo "🔪 Tentative de kill manuel des processus restants..."
    # Tuer manuellement tous les processus trouvés
    if command -v ss &> /dev/null; then
        FINAL_PIDS=$(ss -tlnp 2>/dev/null | grep ":3000" | grep -oP 'pid=\K[0-9]+' || true)
        if [ ! -z "$FINAL_PIDS" ]; then
            echo "   → Kill final des PIDs: $FINAL_PIDS"
            for pid in $FINAL_PIDS; do
                # Tuer le processus et son groupe
                kill -9 -$pid 2>/dev/null || true
                kill -9 $pid 2>/dev/null || true
                # Trouver le parent
                PARENT_PID=$(ps -o ppid= -p $pid 2>/dev/null | tr -d ' ' || true)
                if [ ! -z "$PARENT_PID" ] && [ "$PARENT_PID" != "1" ]; then
                    echo "      → Kill du parent: $PARENT_PID"
                    kill -9 -$PARENT_PID 2>/dev/null || true
                    kill -9 $PARENT_PID 2>/dev/null || true
                fi
            done
            sleep 3
            # Vérifier à nouveau
            if ! command -v ss &> /dev/null || ! ss -tlnp 2>/dev/null | grep -q ":3000"; then
                echo "✅ Port 3000 libéré après kill manuel!"
                exit 0
            fi
        fi
    fi
    echo ""
    echo "💡 Solution: Exécutez manuellement:"
    echo "   pkill -9 -f 'npm.*start'"
    echo "   pkill -9 -f 'next-server'"
    echo "   Ou redémarrez le serveur"
    exit 1
else
    echo "✅ Port 3000 libéré avec succès!"
    exit 0
fi

