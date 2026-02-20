-- Wipe presse_locale_production_ppacilyoncentre_v1 (Contabo ppacilyon-presseLocale)
-- Usage: mariadb -h HOST -P PORT -u USER -p presse_locale_production_ppacilyoncentre_v1 < wipe-presse-locale-db.sql

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE PresseLocale;

SET FOREIGN_KEY_CHECKS = 1;
