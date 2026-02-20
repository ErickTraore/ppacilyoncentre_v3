# Vérifier l’image (BDD + uploads) sur Contabo

À exécuter **sur le serveur Contabo** (62.171.186.233) où tourne ppacilyon-mediaGle-backend (port 7104, BDD MariaDB port 3317).

## 1) BDD média – dernières entrées

Connexion à la base du media-backend (port 3317 selon DEPLOIEMENT.md) :

```bash
mysql -h 127.0.0.1 -P 3317 -u <user> -p <database>
```

Puis :

```sql
-- Table des médias Presse Locale (strictement indépendante de Presse Gle)
SELECT id, messageId, filename, type, path, createdAt FROM MediaPresseLocale ORDER BY id DESC LIMIT 10;
```

Vérifier qu’une ligne existe avec le `messageId` de l’article testé, un `filename` (ex. timestamp + .jpg) et `type = 'image'`.

## 2) Fichiers dans uploads (Contabo)

Répertoire typique du media-backend (à adapter selon le déploiement) :

```bash
# Exemple : app media dans /var/www/... ou dans un conteneur
ls -la /chemin/vers/mediaGle-backend/uploads/images/
# ou
ls -la uploads/images/
```

Vérifier que le `filename` vu en BDD existe bien dans ce dossier.

## 3) Vérification depuis l’hébergeur (sans SSH Contabo)

Avec un token valide (localStorage `accessToken` après connexion sur le site) :

```bash
export TOKEN="Bearer <coller_accessToken_ici>"
cd /var/www/ppacilyoncentre
./scripts/verify-media-article.sh
```

Pour un message précis :

```bash
./scripts/verify-media-article.sh <messageId>
```

Le script appelle l’API getMedia et teste l’URL d’image ; si getMedia renvoie 404, l’image n’est pas en BDD côté Contabo.
