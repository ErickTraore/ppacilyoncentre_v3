# Architecture complète – ppacilyoncentre

## 1. Vue d’ensemble

Le site **ppacilyoncentre** repose sur **deux hébergements** :

- **Hostinger** (srv1103486 – 93.127.167.134) : frontend, user-backend, BDD users + Presse Générale, nginx.
- **Contabo** (vmi3028091 – 62.171.186.233) : backends Presse Locale, Media (Gle + Locale), BDD et fichiers associés.

Le navigateur appelle toujours **ppacilyoncentre.com**. Nginx (Hostinger) sert le frontend et route les APIs vers le user-backend local ou vers Contabo selon le chemin.

---

## 2. Arborescence du projet

```
/var/www/ppacilyoncentre/
├── frontend/                 # React (build servi par nginx)
├── user-backend/             # Node/Express – users, Presse Générale, profils, Zoom
├── presseLocale-backend/     # Code du backend Presse Locale (déployé sur Contabo)
├── nginx/                    # Config nginx du conteneur Docker
│   └── conf.d/
│       └── ppacilyoncentre.conf
├── scripts/
├── tests/
├── docker-compose.yml        # Stack Hostinger : user-backend + mariadb + nginx + adminer
├── deploy-docker.sh
├── deploy.sh
├── nginx-ppacilyoncentre-https.conf   # Nginx hôte (à mettre dans /etc/nginx/sites-available)
└── DEPLOIEMENT.md
```

**Remarque :** Les backends **mediaGle** et **mediaLocale** ne sont pas dans ce dépôt ; ils sont déployés séparément sur Contabo (voir § 5).

---

## 3. Frontend (React)

- **Build :** `frontend/build/` (servi par nginx comme site statique).
- **Entrée :** `src/app/App.jsx` → routage par **hash** (`#home`, `#presse-generale`, etc.).
- **APIs utilisées (variables d’environnement) :**
  - `REACT_APP_USER_API` → `https://ppacilyoncentre.com` (users, Presse Générale, profils)
  - `REACT_APP_PRESSE_LOCALE_API` → `https://ppacilyoncentre.com/api/presse-locale`
  - `REACT_APP_MEDIA_API` → `https://ppacilyoncentre.com/api/media`
  - `REACT_APP_PRESSE_LOCALE_MEDIA_API` → `https://ppacilyoncentre.com/api/media-locale`

**Pages / écrans principaux :**

| Hash / clé              | Composant / usage |
|-------------------------|-------------------|
| `auth`, `login`, `register` | Auth, Login, Register |
| `home`                  | Home |
| `contact`               | ContactForm |
| `messagelist`, `newpresse` | Presse Générale (liste / consulter) |
| `newpresse-locale`      | Presse Locale (liste publique) |
| `presse-generale`       | Gérer Presse Générale (admin) |
| `presse-locale`         | Gérer Presse Locale (admin) |
| `admin-presse-generale`, `admin-presse-locale` | Créer article (Presse ou Presse Locale) |
| `profilepage`           | ProfilePage |

**Presse Générale** → appels à `USER_API` (user-backend).  
**Presse Locale** → appels à `REACT_APP_PRESSE_LOCALE_API` (proxifié vers Contabo).

---

## 4. Hébergement Hostinger (Docker)

### 4.1 Conteneurs (docker-compose)

| Service        | Image      | Port exposé | Rôle |
|----------------|------------|-------------|------|
| **user-backend** | node:20  | 7004        | API users, Presse Générale (PresseGle), profils, Zoom |
| **mariadb**      | mariadb:11 | 3311       | BDD `user_production_ppacilyoncentre_v1` (Users, PresseGle, Profile, etc.) |
| **nginx**        | nginx:stable | 8085      | Sert le frontend + proxy vers user-backend et Contabo |
| **adminer**      | adminer    | 8086        | Interface web BDD (optionnel) |

### 4.2 user-backend (Node/Express)

- **Port interne :** 7004.
- **Base de données :** MariaDB (service `mariadb`), base `user_production_ppacilyoncentre_v1`.
- **Tables principales :** `User`, `PresseGle` (Presse Générale), `Profile` (infos profil), + tables de session/migrations.
- **Routes exposées (préfixe `/api`) :**
  - `/api/users/` : register, login, refresh, me, all (admin), etc.
  - `/api/users/messages/` : CRUD Presse Générale (PresseGle).
  - `/api/infoProfile/` : CRUD profils.
  - `/zoom/signature` : signature Zoom.

Le frontend appelle `https://ppacilyoncentre.com/...` ; nginx hôte redirige vers le conteneur nginx (port 8085), qui lui-même envoie `/api/users/` et `/api/infoProfile/` vers `user-backend:7004`.

---

## 5. Hébergement Contabo (62.171.186.233)

Sur Contabo tournent **3 stacks Docker Compose** pour ppacilyoncentre :

| Stack (compose)                 | Backend (Node)        | MariaDB (port hôte) | Base de données |
|--------------------------------|------------------------|----------------------|------------------|
| ppacilyon-mediaGle-backend      | port **7104**          | **3317**             | `media_production_ppacilyoncentre_v1` (MediaPresseGle, MediaProfile) |
| ppacilyon-presseLocale-backend | port **7105**          | **3320**             | `presse_locale_production_ppacilyoncentre_v1` (PresseLocale) |
| ppacilyon-mediaLocale-backend  | port **7106**          | **3319**             | `media_locale_production_ppacilyoncentre_v1` (MediaPresseLocale, MediaProfile) |

Ces backends ne sont **pas** dans le dépôt ppacilyoncentre ; ils vivent ailleurs (ex. `/opt/...` sur Contabo) et sont déployés indépendamment.

---

## 6. Nginx (conteneur Docker – ppacilyoncentre)

Fichier : `nginx/conf.d/ppacilyoncentre.conf`.  
Écoute : port 80 (conteneur). Résumé des **locations** :

| Chemin (côté client)   | Destination |
|------------------------|------------|
| `/api/users/`          | `http://user-backend:7004/api/users/` (Hostinger) |
| `/api/infoProfile/`    | `http://user-backend:7004/api/infoProfile/` (Hostinger) |
| `/api/media/`          | `http://62.171.186.233/api/media/` (Contabo, port 80) |
| `/api/presse-locale/`  | `http://62.171.186.233:7105/api/` (presseLocale-backend) |
| `/api/media-locale/`  | `http://62.171.186.233:7106/api/media-locale/` |
| `/mediaprofile/`       | `http://62.171.186.233/mediaprofile/` |
| `/imagesprofile/`      | `http://62.171.186.233/imagesprofile/` |
| `/api/uploads/`, `/media-backend/` | Contabo (uploads) |
| `/api/uploads-locale/` | `http://62.171.186.233:7106/api/uploads-locale/` |
| `/`                    | Fichiers statiques `frontend/build` (SPA) |

---

## 7. Nginx hôte (HTTPS)

Fichier de config à déployer : `nginx-ppacilyoncentre-https.conf` (ex. dans `/etc/nginx/sites-available/`).

- Écoute 443 (SSL) pour `ppacilyoncentre.com` / `www.ppacilyoncentre.com`.
- **Tout le trafic** est renvoyé vers `http://127.0.0.1:8085` (conteneur nginx du projet).
- Certificats : Let’s Encrypt (`/etc/letsencrypt/...`).

---

## 8. Flux “Presse Générale” vs “Presse Locale”

- **Presse Générale**
  - Données : table **PresseGle** dans la BDD **user-backend** (Hostinger, MariaDB 3311).
  - API : `https://ppacilyoncentre.com/api/users/messages/` → nginx → user-backend:7004.
  - Médias (images/vidéos) : peuvent transiter par Contabo (`/api/media/`, `/api/uploads/` selon implémentation).

- **Presse Locale**
  - Données : table **PresseLocale** dans la BDD sur Contabo (port 3320).
  - API : `https://ppacilyoncentre.com/api/presse-locale/...` → nginx → `62.171.186.233:7105/api/...`.
  - Médias : Contabo mediaLocale (7106), exposés via `/api/media-locale/` et `/api/uploads-locale/`.

---

## 9. Bases de données – récapitulatif

| Où       | Port BDD | Base de données                                  | Tables principales |
|----------|----------|---------------------------------------------------|--------------------|
| Hostinger | 3311    | `user_production_ppacilyoncentre_v1`             | User, PresseGle, Profile, … |
| Contabo  | 3317    | `media_production_ppacilyoncentre_v1`            | MediaPresseGle, MediaProfile |
| Contabo  | 3319    | `media_locale_production_ppacilyoncentre_v1`     | MediaPresseLocale, MediaProfile |
| Contabo  | 3320    | `presse_locale_production_ppacilyoncentre_v1`    | PresseLocale |

---

## 10. Déploiement rapide (Hostinger)

```bash
cd /var/www/ppacilyoncentre
docker compose ps
./deploy-docker.sh   # rebuild + up
```

Migrations :

- **user-backend :** `npx sequelize-cli db:migrate` (ex. dans le conteneur ou en local avec BDD pointant sur 3311).
- **presseLocale-backend :** exécutées sur Contabo (là où tourne le backend 7105).

---

## 11. Schéma synthétique

```
[ Navigateur ]  →  https://ppacilyoncentre.com
                          │
                          ▼
              [ Nginx hôte :443 → 127.0.0.1:8085 ]
                          │
                          ▼
              [ Nginx conteneur Docker :80 ]
                    │         │         │
        /api/users  │         │  /api/presse-locale   /api/media, /api/media-locale
        /api/infoProfile     │         │
                    ▼         ▼         ▼
              [ user-backend ]   [ Contabo ]
              :7004 (Hostinger)   62.171.186.233
                    │              :7105 presseLocale
                    ▼              :7106 mediaLocale
              [ MariaDB :3311 ]    :80  media (nginx Contabo)
               PresseGle, User     BDD 3317, 3319, 3320
```

Tu peux t’appuyer sur ce fichier pour ne plus te perdre dans l’architecture ppacilyoncentre.
