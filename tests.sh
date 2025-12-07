# // File: ppacilyoncentre/tests.sh

#!/bin/bash
# File: tests.sh
# Deep smoke tests for ppacilyoncentre: API + DB + filesystem + Nginx
# Objectif: vérifier la réalité en DB, sur disque et via Nginx. Pas seulement les codes HTTP.
# Exécution: ./tests.sh
# Prérequis: bash, curl, jq, mariadb-client

set -u

# =========================
# === Configuration base ==
# =========================
API_BASE="https://www.ppacilyoncentre.com/api"
DOMAIN="https://www.ppacilyoncentre.com"

# Identité de test (unique par run)
STAMP=$(date +%s)
EMAIL="deeptest_${STAMP}@example.com"
PASSWORD="Secret!123"
TEST_IMAGE_PATH="./tests/test.png"  # doit exister (petit PNG)

# Bases MariaDB
USER_DB="user_production_ppacilyoncentre_v1"
MEDIA_DB="media_production_ppacilyoncentre_v1"

# Dossiers cibles pour la preuve filesystem
IMAGES_DIR="/var/www/ppacilyoncentre/media-backend/uploads/imagesprofile"

# Variables runtime (éviter set -u issues)
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
MEDIA_ID=""
FILENAME=""
PATH_REL=""

# =========================
# ====== Utils / IO =======
# =========================
ok()   { echo "✅ $1"; }
fail() { echo "❌ $1"; }

die()  { fail "$1"; exit 1; }

json_field() {
  # $1: JSON; $2: jq path
  echo "$1" | jq -r "$2 // empty" 2>/dev/null
}

# Run MariaDB queries
mysql_user()  { mariadb -N -D "$USER_DB"  -e "$1" 2>/dev/null; }
mysql_media() { mariadb -N -D "$MEDIA_DB" -e "$1" 2>/dev/null; }

# =========================
# ====== Pre-checks =======
# =========================
echo "=== 🔍 Pre-checks ==="

# DB reachability (Users count)
PRE_USER_COUNT=$(mysql_user "SELECT COUNT(*) FROM Users WHERE email='${EMAIL}';")
if [[ -z "${PRE_USER_COUNT}" ]]; then
  die "User DB not reachable or query failed (Users count pre)."
else
  ok "Pre user count for ${EMAIL}: ${PRE_USER_COUNT}"
fi

# Tools availability
command -v curl >/dev/null 2>&1 || die "curl not found"
command -v jq   >/dev/null 2>&1 || die "jq not found"
command -v mariadb >/dev/null 2>&1 || die "mariadb client not found"

# =========================
# ======= Register ========
# =========================
echo "=== 🚀 Register user ==="

REGISTER_JSON=$(curl -sS -w "\n%{http_code}" -X POST "${API_BASE}/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

REGISTER_BODY=$(echo "$REGISTER_JSON" | head -n -1)
REGISTER_CODE=$(echo "$REGISTER_JSON" | tail -n1)

if [[ "$REGISTER_CODE" != "200" && "$REGISTER_CODE" != "201" ]]; then
  die "Register HTTP ${REGISTER_CODE}: ${REGISTER_BODY}"
else
  ok "Register HTTP ${REGISTER_CODE}"
fi

# Récupération userId (API sinon DB)
USER_ID=$(json_field "$REGISTER_BODY" '.userId')
if [[ -z "${USER_ID}" ]]; then
  USER_ID=$(mysql_user "SELECT id FROM Users WHERE email='${EMAIL}' ORDER BY id DESC LIMIT 1;")
fi
if [[ -z "${USER_ID}" ]]; then
  die "User ID not found post-register (API nor DB)."
else
  ok "User ID resolved: ${USER_ID}"
fi

# Confirmation d’insertion en DB
POST_USER_COUNT=$(mysql_user "SELECT COUNT(*) FROM Users WHERE email='${EMAIL}';")
if [[ "${POST_USER_COUNT}" == "1" ]]; then
  ok "DB insert confirmed: Users.email='${EMAIL}' exists."
else
  die "DB insert NOT confirmed: Users.email='${EMAIL}' count=${POST_USER_COUNT}."
fi

# =========================
# ========= Login =========
# =========================
echo "=== 🔑 Login ==="

LOGIN_JSON=$(curl -sS -w "\n%{http_code}" -X POST "${API_BASE}/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

LOGIN_BODY=$(echo "$LOGIN_JSON" | head -n -1)
LOGIN_CODE=$(echo "$LOGIN_JSON" | tail -n1)

if [[ "$LOGIN_CODE" != "200" ]]; then
  die "Login HTTP ${LOGIN_CODE}: ${LOGIN_BODY}"
else
  ok "Login HTTP ${LOGIN_CODE}"
fi

ACCESS_TOKEN=$(json_field "$LOGIN_BODY" '.accessToken')
REFRESH_TOKEN=$(json_field "$LOGIN_BODY" '.refreshToken')

if [[ -z "${ACCESS_TOKEN}" ]]; then
  die "No accessToken in login response."
else
  ok "Access token obtained."
fi
if [[ -z "${REFRESH_TOKEN}" ]]; then
  die "No refreshToken in login response."
else
  ok "Refresh token obtained."
fi

# =========================
# ===== Extend session ====
# =========================
echo "=== ⏳ Extend session ==="

EXTEND_JSON=$(curl -sS -w "\n%{http_code}" -X POST "${API_BASE}/users/extend-session" \
  -H "Authorization: Bearer ${REFRESH_TOKEN}")

EXTEND_BODY=$(echo "$EXTEND_JSON" | head -n -1)
EXTEND_CODE=$(echo "$EXTEND_JSON" | tail -n1)

if [[ "$EXTEND_CODE" != "200" ]]; then
  die "Extend HTTP ${EXTEND_CODE}: ${EXTEND_BODY}"
else
  ok "Extend HTTP ${EXTEND_CODE}"
fi

# =========================
# === MediaProfile slots ==
# =========================
echo "=== 🗂️ Check media profile slots ==="

# Appelle la route paramétrée par USER_ID
SLOTS_JSON=$(curl -sS -w "\n%{http_code}" -X GET "${API_BASE}/media/mediaProfile/${USER_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

SLOTS_BODY=$(echo "$SLOTS_JSON" | head -n -1)
SLOTS_CODE=$(echo "$SLOTS_JSON" | tail -n1)

if [[ "$SLOTS_CODE" != "200" ]]; then
  die "MediaProfile GET HTTP ${SLOTS_CODE}: ${SLOTS_BODY}"
else
  ok "MediaProfile GET HTTP ${SLOTS_CODE}"
fi

# Sélectionne le premier slot retourné
MEDIA_ID=$(echo "$SLOTS_BODY" | jq -r '.[0].id // empty' 2>/dev/null || true)
if [[ -z "${MEDIA_ID}" ]]; then
  die "No media slots returned by API."
else
  ok "Media slot selected: id=${MEDIA_ID}"
fi

# =========================
# ======= Upload PNG ======
# =========================
echo "=== 📤 Upload image ==="

if [[ ! -f "${TEST_IMAGE_PATH}" ]]; then
  fail "Test image not found at ${TEST_IMAGE_PATH}. Provide a small PNG."
else
  UPLOAD_JSON=$(curl -sS -w "\n%{http_code}" -X POST "${API_BASE}/media/uploadImageProfile" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -F "image=@${TEST_IMAGE_PATH}")

  UPLOAD_BODY=$(echo "$UPLOAD_JSON" | head -n -1)
  UPLOAD_CODE=$(echo "$UPLOAD_JSON" | tail -n1)

  if [[ "$UPLOAD_CODE" != "200" && "$UPLOAD_CODE" != "201" ]]; then
    fail "Upload HTTP ${UPLOAD_CODE}: ${UPLOAD_BODY}"
    FILENAME=""
  else
    ok "Upload HTTP ${UPLOAD_CODE}"
    FILENAME=$(json_field "$UPLOAD_BODY" '.filename')
    PATH_REL="/imagesprofile/${FILENAME}"
    if [[ -z "${FILENAME}" ]]; then
      fail "No filename in upload response."
    else
      ok "Upload filename: ${FILENAME}"
    fi
  fi
fi

# =========================
# === Update media slot ===
# =========================
echo "=== 🔧 Update media slot path ==="

if [[ -n "${FILENAME}" && -n "${MEDIA_ID}" ]]; then
  # Met à jour les deux champs attendus par le modèle: path + filename
  UPDATE_JSON=$(curl -sS -w "\n%{http_code}" -X PUT "${API_BASE}/media/mediaProfile/${MEDIA_ID}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"path\":\"${PATH_REL}\",\"filename\":\"${FILENAME}\"}")

  UPDATE_BODY=$(echo "$UPDATE_JSON" | head -n -1)
  UPDATE_CODE=$(echo "$UPDATE_JSON" | tail -n1)

  if [[ "$UPDATE_CODE" != "200" ]]; then
    fail "Update HTTP ${UPDATE_CODE}: ${UPDATE_BODY}"
  else
    ok "Update HTTP ${UPDATE_CODE}"
    # Vérifie la réalité en DB avec les colonnes correctes (path, filename)
    MP_CHECK=$(mysql_media "SELECT path, filename FROM MediaProfile WHERE id=${MEDIA_ID} LIMIT 1;")
    if [[ -z "${MP_CHECK}" ]]; then
      fail "DB: MediaProfile id=${MEDIA_ID} not found."
    else
      DB_PATH=$(echo "${MP_CHECK}" | awk '{print $1}')
      DB_FILENAME=$(echo "${MP_CHECK}" | awk '{print $2}')
      if [[ "${DB_PATH}" == "${PATH_REL}" ]]; then
        ok "DB path matches: ${DB_PATH}"
      else
        fail "DB path mismatch: expected ${PATH_REL}, got ${DB_PATH}"
      fi
      if [[ "${DB_FILENAME}" == "${FILENAME}" ]]; then
        ok "DB filename matches: ${DB_FILENAME}"
      else
        fail "DB filename mismatch: expected ${FILENAME}, got ${DB_FILENAME}"
      fi
    fi
  fi
else
  fail "Skip update: missing FILENAME or MEDIA_ID."
fi

# =========================
# ==== Filesystem proof ===
# =========================
echo "=== 📁 Filesystem proof ==="

if [[ -n "${FILENAME}" ]]; then
  FILE_ABS="${IMAGES_DIR}/${FILENAME}"
  if [[ -f "${FILE_ABS}" ]]; then
    ok "File exists on disk: ${FILE_ABS}"
  else
    fail "File not found on disk: ${FILE_ABS}"
  fi
else
  fail "Skip FS check: no FILENAME."
fi

# =========================
# ======= Nginx proof =====
# =========================
echo "=== 🌐 Nginx proof ==="

if [[ -n "${FILENAME}" ]]; then
  NGX_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${DOMAIN}/imagesprofile/${FILENAME}")
  if [[ "$NGX_CODE" == "200" ]]; then
    ok "Nginx serves image at ${DOMAIN}/imagesprofile/${FILENAME}"
  else
    fail "Nginx failed to serve image (HTTP ${NGX_CODE}) at ${DOMAIN}/imagesprofile/${FILENAME}"
  fi
else
  fail "Skip Nginx check: no FILENAME."
fi

# =========================
# ======= Recap log =======
# =========================
echo "=== 📒 Recap ==="
echo "- Email: ${EMAIL}"
echo "- User ID: ${USER_ID}"
echo "- Media ID: ${MEDIA_ID}"
echo "- Filename: ${FILENAME}"
echo "- Path rel: ${PATH_REL}"

# =========================
# ======= Exit line =======
# =========================
echo "=== ✅ Tests completed ==="
 