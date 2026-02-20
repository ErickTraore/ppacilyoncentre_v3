# ppacilyoncentre – Déploiement

## Architecture 2 presses (alignée cppeurope)

- **Presse Générale** : user-backend (Hostinger), BDD user, table **PresseGle**.
- **Presse Locale** : presseLocale-backend (Contabo :7105), BDD dédiée (ex. presse_locale_prod_ppacilyoncentre_v1), table **PresseLocale**.

Après mise à jour, exécuter les migrations :
- **user-backend** : `npx sequelize-cli db:migrate` (renomme Messages → PresseGle).
- **presseLocale-backend** (sur Contabo ou en local) : créer la BDD puis `npx sequelize-cli db:migrate` (crée la table PresseLocale). Utiliser le même `JWT_SIGN_SECRET` que user-backend.

## Stack Hostinger (Docker)

- **Frontend + API users** : port 8085 (nginx)
- **user-backend** : 7004
- **mariadb** : 3311
- **adminer** : 8086

## Accès Contabo (SSH)

- **IP** : 62.171.186.233
- **User** : root
- **Clé** : ~/.ssh/id_ed25519
- **Hostname** : vmi3028091

Connexion : `ssh -i ~/.ssh/id_ed25519 root@62.171.186.233`

## Contabo ppacilyon (ports)

- **7104** → ppacilyon-mediaGle-backend (BDD 3317)
- **7105** → ppacilyon-presseLocale-backend (BDD 3320)
- **7106** → ppacilyon-mediaLocale-backend (BDD 3319)

## Vérifier les proxies Contabo

À exécuter **sur le serveur Hostinger** (accès à Contabo) :

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8085/api/media/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8085/api/presse-locale/
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8085/api/media-locale/
```

Attendu : 200, 401 ou 404 (pas de timeout).

## Commandes utiles

```bash
cd /var/www/ppacilyoncentre
docker compose ps
docker compose logs user-backend
./deploy-docker.sh   # rebuild + up
```

## Compte test

- Email : test@ppacilyoncentre.com
- Mot de passe : Test123!
