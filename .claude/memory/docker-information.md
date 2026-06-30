---
name: docker-information
description: "Alias réseau Docker à utiliser depuis le conteneur claudeai (nginx, db, maildev)"
metadata: 
  node_type: memory
  type: feedback
---
les autres services sont accessibles via leur **nom de service** comme nom d'hôte sur le réseau Docker
(pas via `localhost` ni les ports publiés sur l'hôte). Le conteneur `claudeai`
dépend déjà de `db`, `maildev` et `nginx`.

**Why:** Les ports `ports:` du `docker-compose.yml` (80, 8080, 8081…) ne sont
exposés que sur la machine hôte. Entre conteneurs, on utilise le DNS interne
Docker (nom de service + port interne du conteneur).

**How to apply:**

- **Tests E2E / requêtes HTTP vers l'application** → utiliser `nginx` (port interne 80).
  - URL de base : `http://nginx` (et non `http://localhost`).
- **Base de données** → utiliser `db` (MariaDB, port interne 3306).
  - Hôte : `db`, base : `db`, user : `admin`, mot de passe : `admin`
    (root : user `root` / mot de passe `root`).
  - DSN type : `mysql://admin:admin@db:3306/db`.
- **Maildev** (mails de test) → utiliser `maildev`.
  - Interface web : `http://maildev` (port interne 80).
  - SMTP : `maildev:25`.

Récapitulatif des alias internes ≠ ports publiés sur l'hôte :

| Service  | Alias interne (depuis claudeai) | Port publié sur l'hôte |
|----------|---------------------------------|------------------------|
| nginx    | `http://nginx` (80)             | `http://localhost:80`  |
| db       | `db:3306`                       | —                      |
| maildev  | `http://maildev` (80) / `:25`   | `http://localhost:8081`|
| phpmyadmin | `phpmyadmin:80`               | `http://localhost:8080`|
