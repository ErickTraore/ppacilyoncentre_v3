#!/bin/bash
# Health-check ppacilyoncentre (à lancer sur Hostinger)
BASE="${1:-http://127.0.0.1:8085}"
echo "=== Health-check $BASE ==="

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE/")
echo "/ → $code"

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST "$BASE/api/users/login" -H "Content-Type: application/json" -d '{}')
echo "/api/users/login (POST) → $code"

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/media/")
echo "/api/media/ → $code"

code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/presse-locale/")
echo "/api/presse-locale/ → $code"

echo "=== Fin ==="
