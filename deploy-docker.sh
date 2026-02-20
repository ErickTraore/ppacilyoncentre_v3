#!/bin/bash
# Déploiement ppacilyoncentre via Docker (Hostinger)
# Build frontend + docker-compose up

set -e

cd "$(dirname "$0")"

echo "=== Build frontend ==="
cd frontend && npm install && CI=false npm run build && cd ..

echo "=== Démarrage stack Docker ==="
docker compose up -d

echo "=== Attente MariaDB (10s) ==="
sleep 10

echo "=== Sync schéma BDD (user-backend) ==="
docker compose exec user-backend node -e "
  const { sequelize } = require('./models');
  require('./models');
  sequelize.sync({ alter: false }).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
" || true

echo "=== Statut ==="
docker compose ps

echo "=== ppacilyoncentre Docker prêt ==="
echo "Frontend + API users: http://localhost:8085"
echo "Adminer: http://localhost:8086"
