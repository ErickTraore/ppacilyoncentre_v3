#!/usr/bin/env bash
# Vérifie si l'image d'un article presse (avec photo) est en BDD média et accessible en uploads sur Contabo.
# Usage:
#   export TOKEN="Bearer <accessToken>"   # depuis localStorage.accessToken après connexion
#   ./scripts/verify-media-article.sh
# Ou avec l'ID du message connu:
#   ./scripts/verify-media-article.sh 42

set -e
BASE_URL="${BASE_URL:-https://ppacilyoncentre.com}"
TOKEN="${TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "⚠️  Définir TOKEN (Bearer <accessToken>). Ex: export TOKEN=\"Bearer eyJ...\""
  exit 1
fi

echo "=== 1) Liste des messages (dernier = candidat article avec photo) ==="
MSG_LIST=$(curl -s -H "Authorization: $TOKEN" "$BASE_URL/api/users/messages/?limit=5")
echo "$MSG_LIST" | head -c 500
echo ""

# Récupérer le dernier id (premier de la liste si order title:ASC)
LAST_ID=$(echo "$MSG_LIST" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
if [ -z "$LAST_ID" ]; then
  # Si un id est passé en argument
  LAST_ID="$1"
fi

if [ -z "$LAST_ID" ]; then
  echo "⚠️  Aucun message trouvé ou pas d'id. Passer l'id en argument: $0 <messageId>"
  exit 1
fi

echo ""
echo "=== 2) Médias pour le message id=$LAST_ID (getMedia) ==="
MEDIA_RESP=$(curl -s -w "\n%{http_code}" -H "Authorization: $TOKEN" "$BASE_URL/api/media/getMedia/$LAST_ID")
HTTP_BODY=$(echo "$MEDIA_RESP" | head -n -1)
HTTP_CODE=$(echo "$MEDIA_RESP" | tail -n 1)
echo "HTTP $HTTP_CODE"
echo "$HTTP_BODY" | head -c 800
echo ""

if [ "$HTTP_CODE" = "404" ]; then
  echo "❌ Aucun média en BDD pour ce message (getMedia 404)."
  exit 1
fi

# Extraire le premier filename si présent
FILENAME=$(echo "$HTTP_BODY" | grep -o '"filename":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$FILENAME" ]; then
  echo ""
  echo "=== 3) Test URL image: $BASE_URL/api/uploads/images/$FILENAME ==="
  IMG_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/uploads/images/$FILENAME")
  if [ "$IMG_CODE" = "200" ]; then
    echo "✅ Image accessible (HTTP 200)."
  else
    echo "❌ Image non accessible (HTTP $IMG_CODE)."
  fi
else
  echo "⚠️  Pas de filename trouvé dans la réponse getMedia."
fi
