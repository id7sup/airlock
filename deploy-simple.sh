#!/bin/bash

# Script ULTRA-SIMPLE pour déployer sur le serveur
# Usage: ./deploy-simple.sh

set -e

echo "🚀 Déploiement simple - Mise à jour complète"
echo ""

cd /var/www/airlock || exit 1

# 1. Sauvegarder et récupérer
echo "📥 Récupération depuis GitHub..."
# Supprimer les fichiers générés qui peuvent causer des conflits
rm -f next-env.d.ts 2>/dev/null || true
git stash 2>/dev/null || true
# Forcer la suppression des fichiers ignorés qui pourraient être trackés
git clean -fd 2>/dev/null || true
git pull origin main

# 2. Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# 3. NETTOYER et REBUILD
echo "🔨 Nettoyage et rebuild complet..."
rm -rf .next
npm run build

# 4. TUER TOUS les processus (ORDRE CRITIQUE)
echo "🛑 Arrêt de tous les processus..."

# D'abord arrêter PM2 proprement
echo "   → Arrêt de PM2..."
pm2 delete airlock 2>/dev/null || true
pm2 stop all 2>/dev/null || true
sleep 2
pm2 kill 2>/dev/null || true
sleep 2

# Ensuite tuer tous les processus Node/Next (INCLUANT next-server)
echo "   → Arrêt de tous les processus Node/Next..."
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node.*3000" 2>/dev/null || true
pkill -9 -f "node.*start" 2>/dev/null || true
pkill -9 -f "node.*airlock" 2>/dev/null || true
sleep 2

# Libérer le port 3000 avec différentes méthodes (plus agressif)
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:3000 2>/dev/null || true)
    if [ ! -z "$PIDS" ]; then
        echo "   Tuer les processus trouvés: $PIDS"
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
fi

if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 1
fi

if command -v ss &> /dev/null; then
    # Utiliser ss pour trouver et tuer (INCLUANT next-server)
    SS_OUTPUT=$(ss -tlnp 2>/dev/null | grep ":3000" || true)
    if [ ! -z "$SS_OUTPUT" ]; then
        echo "   Processus trouvé avec ss, tentative de kill..."
        # Extraire les PIDs depuis ss
        SS_PIDS=$(echo "$SS_OUTPUT" | grep -oP 'pid=\K[0-9]+' || true)
        if [ ! -z "$SS_PIDS" ]; then
            echo "   → PIDs trouvés: $SS_PIDS"
            for pid in $SS_PIDS; do
                echo "   → Kill -9 PID: $pid"
                kill -9 $pid 2>/dev/null || true
                sleep 0.5
            done
            sleep 2
        fi
    fi
fi

# Attendre que tout soit arrêté
sleep 3

# Nettoyer les logs PM2 pour éviter la confusion
pm2 flush 2>/dev/null || true

# Vérifier que le port est libre (logique améliorée)
echo "⏳ Vérification que le port 3000 est libre..."
PORT_FREE=false
for i in {1..10}; do
    PORT_IN_USE=false
    
    # Vérifier avec ss
    if command -v ss &> /dev/null; then
        if ss -tlnp 2>/dev/null | grep -q ":3000"; then
            PORT_IN_USE=true
        fi
    fi
    
    # Vérifier avec netstat si ss n'a rien trouvé
    if [ "$PORT_IN_USE" = false ] && command -v netstat &> /dev/null; then
        if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
            PORT_IN_USE=true
        fi
    fi
    
    # Vérifier avec lsof si toujours rien
    if [ "$PORT_IN_USE" = false ] && command -v lsof &> /dev/null; then
        if lsof -i:3000 2>/dev/null | grep -q "LISTEN"; then
            PORT_IN_USE=true
        fi
    fi
    
    if [ "$PORT_IN_USE" = false ]; then
        echo "✅ Port 3000 libéré"
        PORT_FREE=true
        break
    fi
    
    # Si le port est encore utilisé, essayer de tuer à nouveau (plus agressif)
    if [ $i -le 5 ]; then
        # Tuer avec lsof
        if command -v lsof &> /dev/null; then
            PIDS=$(lsof -ti:3000 2>/dev/null || true)
            if [ ! -z "$PIDS" ]; then
                echo "   Nouvelle tentative de kill (lsof) pour: $PIDS"
                for pid in $PIDS; do
                    kill -9 $pid 2>/dev/null || true
                done
                sleep 1
            fi
        fi
        # Tuer avec ss (next-server)
        if command -v ss &> /dev/null; then
            SS_PIDS=$(ss -tlnp 2>/dev/null | grep ":3000" | grep -oP 'pid=\K[0-9]+' || true)
            if [ ! -z "$SS_PIDS" ]; then
                echo "   Nouvelle tentative de kill (ss) pour: $SS_PIDS"
                for pid in $SS_PIDS; do
                    kill -9 $pid 2>/dev/null || true
                done
                sleep 1
            fi
        fi
        # Tuer tous les next-server
        pkill -9 -f "next-server" 2>/dev/null || true
        sleep 1
    fi
    
    echo "   Attente... ($i/10)"
    sleep 1
done

# Si le port n'est toujours pas libre, forcer ou continuer quand même
if [ "$PORT_FREE" = false ]; then
    echo "⚠️  Le port 3000 semble encore occupé"
    echo "🔍 Dernière vérification:"
    if command -v lsof &> /dev/null; then
        lsof -i:3000 2>/dev/null || echo "   (lsof ne trouve rien)"
    fi
    if command -v ss &> /dev/null; then
        ss -tlnp 2>/dev/null | grep ":3000" || echo "   (ss ne trouve rien)"
    fi
    echo "⚠️  Continuation quand même (PM2 devrait gérer)..."
fi

# 5. Redémarrer le daemon PM2 proprement
echo "🔄 Redémarrage du daemon PM2..."
pm2 ping 2>/dev/null || pm2 kill 2>/dev/null || true
sleep 1

# 6. DÉMARRER avec PM2
echo "🚀 Démarrage de l'application..."
npm install -g pm2 2>/dev/null || true
pm2 start npm --name "airlock" -- start
pm2 save
pm2 startup 2>/dev/null || true

# 6. Attendre et vérifier
echo "⏳ Attente du démarrage..."
sleep 5

# Vérifier
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅ ✅ ✅ SUCCÈS ! Application démarrée !"
    echo ""
    pm2 status
else
    echo "⚠️  Code HTTP: $HTTP_CODE"
    pm2 logs airlock --lines 20 --nostream
fi

echo ""
echo "✅ Déploiement terminé !"
echo "🌐 Testez sur https://airlck.com (videz le cache: Ctrl+Shift+R)"

