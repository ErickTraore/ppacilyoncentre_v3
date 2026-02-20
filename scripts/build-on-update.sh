#!/usr/bin/env bash
# Build frontend uniquement (production). Aucune action git.

set -e

ROOT="/var/www/ppacilyoncentre"
cd "$ROOT"

echo "[$(date -Iseconds)] Build frontend ppacilyoncentre..."
cd frontend
npm run build
cd ..
echo "[$(date -Iseconds)] Build terminé."
