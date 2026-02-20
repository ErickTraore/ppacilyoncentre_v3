#!/bin/bash
# Wipe toutes les données ppacilyoncentre - repartir à zéro
# HOSTINGER : user DB (port 3310 si Docker)
# CONTABO : media/media-locale/presse-locale (ports 3317, 3319, 3320)

set -e

echo "=== WIPE PPACILYONCENTRE - TOUTES LES DONNÉES ==="
echo "ATTENTION : irréversible. Ctrl+C pour annuler."
sleep 3

# Hostinger - user DB (Docker mariadb ppacilyoncentre)
echo ""
echo "=== Hostinger: user_production_ppacilyoncentre_v1 ==="
MYSQL_PWD='@Ppacilyoncentre2691' mariadb -h 127.0.0.1 -P 3311 -u ppaci user_production_ppacilyoncentre_v1 -e "
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Users;
TRUNCATE TABLE Messages;
TRUNCATE TABLE Profiles;
SET FOREIGN_KEY_CHECKS = 1;
" && echo "OK user DB" || echo "SKIP (Docker pas démarré ou port différent)"

echo ""
echo "=== Contabo (exécuter sur le VPS Contabo) ==="
echo "  media_production_ppacilyoncentre_v1 (port 3317)"
echo "  media_locale_production_ppacilyoncentre_v1 (port 3319)"
echo "  presse_locale_production_ppacilyoncentre_v1 (port 3320)"
echo ""
echo "Fichiers SQL: scripts/wipe-user-db.sql | wipe-media-db.sql | wipe-presse-locale-db.sql"
echo ""
echo "=== WIPE terminé ==="
