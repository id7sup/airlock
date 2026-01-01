#!/bin/bash

# Script pour vérifier le déploiement

echo "🔍 Vérification du déploiement..."

echo ""
echo "1. Processus Next.js en cours:"
ps aux | grep -E "next|node.*start" | grep -v grep

echo ""
echo "2. Ports en écoute:"
netstat -tlnp | grep -E ":3000|:80|:443" || ss -tlnp | grep -E ":3000|:80|:443"

echo ""
echo "3. Dernières lignes du log:"
tail -20 /var/log/airlock.log 2>/dev/null || echo "Log non trouvé"

echo ""
echo "4. Vérification de l'application:"
curl -I http://localhost:3000 2>/dev/null | head -5 || echo "Application non accessible sur localhost:3000"

echo ""
echo "5. Vérification de la version Git:"
cd /var/www/airlock && git log --oneline -5

echo ""
echo "6. Fichiers .next (build):"
ls -lah /var/www/airlock/.next 2>/dev/null | head -5 || echo "Dossier .next non trouvé"

