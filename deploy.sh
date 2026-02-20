#!/bin/bash
# File: /var/www/ppacilyoncentre/deploy.sh
# Purpose: Automatiser le déploiement du site ppacilyoncentre

set -e
set -u

echo "=== 🚀 Déploiement ppacilyoncentre ==="

cd /var/www/ppacilyoncentre

echo "=== 🛑 Arrêt des anciens process PM2 ==="
pm2 delete user-backend-ppaci || true
pm2 delete frontend-ppaci || true

echo "=== 📦 Installation des dépendances ==="
cd user-backend && npm install || { echo "❌ npm install failed in user-backend"; exit 1; } && cd ..
cd frontend && npm install && npm run build || { echo "❌ frontend build failed"; exit 1; } && cd ..

echo "=== 🔄 Démarrage PM2 ==="
pm2 start .ecosystem.config.js
pm2 save
pm2 status

echo "=== 🌐 Vérification et reload Nginx ==="
nginx -t && systemctl reload nginx

echo "=== ✅ Déploiement terminé ==="
