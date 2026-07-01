# Skeleton Symfony 8.0

> Squelette de projet **Symfony 8.0** prêt à l'emploi : stack front-end moderne (Webpack Encore + Tailwind CSS v4 + Stimulus/Turbo), bibliothèque de composants UX, authentification complète, API REST documentée, environnement Docker complet et intégration **Claude Code** (skills, design system, agent IA dédié).

[![Symfony](https://img.shields.io/badge/Symfony-8.0-000000?logo=symfony)](https://symfony.com)
[![PHP](https://img.shields.io/badge/PHP-%E2%89%A58.4-777BB4?logo=php)](https://www.php.net)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com)

---

## Sommaire

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Installation rapide (installeurs)](#installation-rapide-installeurs)
- [Installation manuelle](#installation-manuelle)
- [Services & URLs](#services--urls)
- [Structure du projet](#structure-du-projet)
- [Front-end](#front-end)
- [Composants UX Twig](#composants-ux-twig)
- [Helpers & services back-end](#helpers--services-back-end)
- [Authentification & sécurité](#authentification--sécurité)
- [API REST](#api-rest)
- [Intégration Claude Code](#intégration-claude-code)
- [Commandes utiles](#commandes-utiles)
- [Tests & qualité](#tests--qualité)
- [Documentation](#documentation)

---

## Aperçu

Ce squelette fournit une base de projet web complète, opinionée et documentée, conçue pour démarrer rapidement une application Symfony 8 de type **MPA** (Multi-Page Application). Il embarque :

- Une **architecture front-end** symétrique (un fichier = une responsabilité) basée sur Tailwind v4 et Webpack Encore.
- Une **bibliothèque de composants UX** réutilisables (modales, tables, toasts, datepicker, selectize, dropzone, rating…).
- Une **authentification** prête à l'emploi : connexion, inscription, réinitialisation de mot de passe, jetons d'API.
- Une **API REST** au format normalisé, documentée via Swagger (Nelmio).
- Un **environnement Docker** complet (PHP-FPM, Nginx, MariaDB, PhpMyAdmin, MailDev).
- Une **intégration Claude Code** : skills, agent IA conteneurisé et synchronisation du design system depuis Claude Design.
- Une **boîte à outils** de helpers PHP statiques (dates, nombres, texte, téléphone, scraping…), de traits Doctrine et de types de formulaire personnalisés.

---

## Stack technique

| Domaine | Technologies |
|---|---|
| **Back-end** | Symfony 8.0, PHP ≥ 8.4 |
| **ORM** | Doctrine ORM 3, Doctrine Migrations |
| **Front-end** | Webpack Encore, Tailwind CSS v4, Stimulus, Turbo (Symfony UX), FontAwesome 7 |
| **Templating** | Twig + Twig Components (Symfony UX) |
| **API** | Nelmio API Doc (Swagger UI) |
| **Sécurité** | Symfony Security, ResetPassword Bundle, jetons d'API |
| **Async** | Symfony Messenger (transport Doctrine), Scheduler |
| **Mail** | Symfony Mailer + thème mail centralisé |
| **JS libs** | Choices.js, DataTables, IMask, Moment, Clipboard |
| **Infra** | Docker Compose (PHP-FPM, Nginx, MariaDB, PhpMyAdmin, MailDev) |
| **Qualité** | PHPUnit 13, PHP-CS-Fixer, Panther (tests E2E) |

---

## Installation rapide (installeurs)

Des installeurs sont disponibles pour **Linux**, **macOS** et **Windows** dans le dépôt :

➡️ **https://github.com/GBonnaire/skeleton-installer/tree/main/symfony-8.0**

Ils reproduisent un `composer create-project` : clonage du squelette, réinitialisation de l'historique Git (départ propre), build + démarrage des conteneurs Docker, puis `composer install`, `yarn install` et `yarn dev`.

> Prérequis : **Git** et **Docker** (avec Docker Compose) installés.

### Linux / macOS

```bash
# Utiliser l'installeur (remplacer mon-app par le nom de votre application slugentifier)
curl -fsSL https://raw.githubusercontent.com/GBonnaire/skeleton-installer/main/symfony-8.0/create-project.sh | bash -s mon-app
```

### Windows

```bat
:: Télécharger create-project.bat depuis :
:: https://github.com/GBonnaire/skeleton-installer/tree/main/symfony-8.0

create-project.bat mon-app
```

**Usage des installeurs :**

```
create-project.sh|.bat [repertoire-destination] [url-du-depot-git]
```

- `repertoire-destination` *(optionnel)* — dossier cible (par défaut : demandé, ou `.` = répertoire courant qui doit être vide).
- `url-du-depot-git` *(optionnel)* — par défaut `https://github.com/GBonnaire/skeleton-symfony-8.0.git`.

À la fin, l'application est accessible sur http://localhost (voir [Services & URLs](#services--urls)).

---

## Installation manuelle

Si vous préférez ne pas utiliser les installeurs :

```bash
# 1. Cloner le squelette
git clone https://github.com/GBonnaire/skeleton-symfony-8.0.git mon-app
cd mon-app

# 2. (optionnel) repartir d'un historique Git propre
rm -rf .git && git init

# 3. Construire et démarrer les conteneurs
docker compose up -d --build

# 4. Installer les dépendances dans le conteneur PHP
docker compose exec php composer install
docker compose exec php yarn install
docker compose exec php yarn dev

# 5. Créer la base de données et jouer les migrations
docker compose exec php php bin/console doctrine:database:create
docker compose exec php php bin/console doctrine:migrations:migrate

# 6. Créer un premier utilisateur
docker compose exec php php bin/console app:user:create
```

> Adaptez les variables d'environnement dans `.env` (ou un `.env.local` non versionné) : `DATABASE_*`, `MAILER_*`, `APP_SECRET`, etc.

---

## Services & URLs

Une fois les conteneurs démarrés (`docker compose up -d`) :

| Service | URL | Description |
|---|---|---|
| **Application** | http://localhost | Front Symfony (Nginx) |
| **PhpMyAdmin** | http://localhost:8080 | Administration MariaDB |
| **MailDev** | http://localhost:8081 | Capture & visualisation des emails |
| **API / Swagger** | http://localhost/api | Documentation interactive (Nelmio) |
| **API v1** | http://localhost/api/v1 | Documentation de l'API v1 |

Conteneurs Docker (`docker-compose.yml`) : `php` (PHP 8.4-FPM), `nginx`, `db` (MariaDB), `phpmyadmin`, `maildev`, `claudeai` (environnement IA dédié).

---

## Structure du projet

```
.
├── assets/                  # Front-end (Webpack Encore)
│   ├── app.js               # entrée globale
│   ├── controllers/         # contrôleurs Stimulus
│   ├── js/                  # components / layouts / partials / pages / utils
│   └── styles/              # theme.css (source de vérité) + app.css + CSS par scope
├── bin/                     # console & phpunit
├── config/                  # configuration Symfony (packages, routes, services)
├── docker/                  # Dockerfiles (php, nginx, claudeai)
├── public/                  # racine web (index.php)
├── src/
│   ├── Command/             # commandes console (app:user:create…)
│   ├── Controller/          # contrôleurs web, Security/, Api/
│   ├── Entity/              # entités Doctrine (User, ResetPasswordRequest)
│   ├── Enum/                # énumérations (UserRoleEnum…)
│   ├── Event/               # listeners (cycle de vie entités, API…)
│   ├── Form/                # types & extensions de formulaire
│   ├── Model/               # DTO / view models
│   ├── Security/            # ApiTokenHandler…
│   ├── Service/             # JwtService, MailerService, UserService, Scheduler
│   ├── Twig/Components/     # composants Twig UX
│   └── Util/                # Helpers/, Traits/, Doctrine/, Enum/
├── templates/               # base, layouts, partials, pages, components, mail
├── translations/            # fichiers de traduction (fr)
├── _docs_system/            # documentation du squelette (architecture, composants, helpers)
└── .claude/                 # configuration Claude Code (skills, memory)
```

---

## Front-end

Architecture **symétrique** et règle absolue : **aucun CSS inline dans les fichiers Twig**.

- **Une page** = 1 template Twig + 1 CSS page + 1 JS page (entrée Encore dédiée).
- **Un layout** hérite de `base.html.twig` ; **une page** hérite du layout.
- `assets/styles/theme.css` est la **source de vérité** : tokens Tailwind v4 (`@theme`), variables `--da-*` (`:root`) et classes `da-*`. Toujours réutiliser ces tokens plutôt que des valeurs codées en dur.

```bash
yarn dev            # build développement
yarn watch          # build + watch
yarn dev-server     # serveur de dev Encore
yarn build          # build production
```

> Détails complets : [`_docs_system/architecture-frontend.md`](_docs_system/architecture-frontend.md).

---

## Composants UX Twig

Composants réutilisables (`<twig:NomComposant />`) déclarés dans `src/Twig/Components/`, avec template dans `templates/components/` et contrôleur Stimulus associé. Chacun est documenté dans `_docs_system/components/` :

| Composant | Doc |
|---|---|
| Modale | [`component-modal.md`](_docs_system/components/component-modal.md) |
| Table (DataTables) | [`component-table.md`](_docs_system/components/component-table.md) |
| Formulaire | [`component-form.md`](_docs_system/components/component-form.md) |
| Toast / notifications | [`component-toast.md`](_docs_system/components/component-toast.md) |
| Onglets (tabs) | [`component-tab.md`](_docs_system/components/component-tab.md) |
| Datepicker | [`component-datepicker.md`](_docs_system/components/component-datepicker.md) |
| Selectize (Choices.js) | [`component-selectize.md`](_docs_system/components/component-selectize.md) |
| File dropzone | [`component-file-dropzone.md`](_docs_system/components/component-file-dropzone.md) |
| Rating | [`component-rating.md`](_docs_system/components/component-rating.md) |
| Mask (IMask) | [`component-mask.md`](_docs_system/components/component-mask.md) |

**Types de formulaire personnalisés** (`src/Form/Type/`) : `FileDropzoneType`, `RatingType`, `DateRangePickerType`.
**Extensions de formulaire** (`src/Form/Extension/`) : classe de ligne, champ conditionnel, type password, accept de fichier.

---

## Helpers & services back-end

### Helpers statiques — `src/Util/Helpers/`

Classes utilitaires 100 % statiques (aucune instanciation), documentées dans [`_docs_system/helpers/`](_docs_system/helpers/index.md) :

| Classe | Rôle |
|---|---|
| `Address` | Formatage de codes postaux |
| `ApiResponse` | Réponses JSON normalisées `{status, message, data}` |
| `Converter` | Conversion de types & listes textuelles |
| `Date` | Parsing, jours fériés FR, modificateurs relatifs |
| `DateDistribution` | Répartition d'éléments sur des créneaux temporels |
| `Number` | Formatage (K/M/B/T), extraction min/max |
| `Password` | Tokens & mots de passe sécurisés |
| `PhoneNumber` | Normalisation FR / BE |
| `Table` | Accès par chemin pointé, fusion de collections Doctrine |
| `Text` | Conversions de casse, normalisation, accents/emojis |
| `Web` | Domaines, URLs absolues, query string |
| `WebScrapper` | Scraping HTTP, métadonnées, liens sociaux/images |

### Services — `src/Service/`

- `UserService` — création & gestion des utilisateurs
- `MailerService` — envoi d'emails (registration, reset password)
- `JwtService` — génération / validation de jetons
- `MessengerSchedulerService` — planification de messages (voir [`service-messenger-scheduler.md`](_docs_system/services/service-messenger-scheduler.md))

### Traits Doctrine — `src/Util/Doctrine/`

`CreatedAtTrait`, `UpdatedAtTrait`, `CreatedByTrait`, `ActiveTrait`, `HistoryLogTrait` — pour composer rapidement les entités.

### Thème mail centralisé

Les couleurs des emails sont configurées dans `config/services.yaml` (`mail_theme`) et exposées comme global Twig, surchargeable par template.

---

## Authentification & sécurité

Configurée dans `config/packages/security.yaml` :

- **Connexion par formulaire** (`form_login`) avec protection CSRF et *remember me* (7 jours).
- **Inscription** + **réinitialisation de mot de passe** (SymfonyCasts ResetPassword Bundle).
- **API stateless** sécurisée par **jetons d'accès** (`App\Security\ApiTokenHandler`) sur le pare-feu `^/api/v`.
- **Contrôle d'accès** par rôles : `^/admin` → `ROLE_ADMIN`, `^/api/v1` → `ROLE_API`.
- Entité `User` + énumération `UserRoleEnum`.

Créer un utilisateur :

```bash
docker compose exec php php bin/console app:user:create
```

---

## API REST

Conventions (voir [`_docs_system/architecture-api.md`](_docs_system/architecture-api.md)) :

- Endpoints en **anglais**, **kebab-case**, préfixe `/api`, versionnés (`/v1`).
- Structure REST imbriquée : `/v1/<collection>[/<id>[/<collection>…]]` (max 5 niveaux).
- Réponse JSON normalisée :

```json
{
  "status": "success | error",
  "message": "ok | <message d'erreur>",
  "data": {}
}
```

- Codes HTTP standardisés (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `422`, `500`).
- Documentation Swagger générée par Nelmio : **http://localhost/api**.

---

## Intégration Claude Code

Le squelette est conçu pour être développé avec **[Claude Code](https://claude.com/claude-code)**.

### Conteneur `claudeai`

Le service Docker `claudeai` (`docker/claudeai/Dockerfile`) fournit un environnement isolé PHP 8.4 avec Node 24, Composer, Git, Claude CLI et les drivers navigateurs (Chromium / Firefox) pour les tests Panther.

```bash
docker compose exec claudeai bash   # entrer dans l'environnement IA
```

### Skills Claude Code

Les skills sont des commandes personnalisées utilisables directement dans Claude Code.

- **`/init-skeleton`** : Initialise tous les éléments pour la génération de code par l'IA (mémoire, contextes). **à faire en premier!**
- **`/update-design-system <url>`** : Synchronise le design system depuis un lien de partage Claude Design.
- **`/update-readme`** : Met à jour automatiquement le README.md en fonction des évolutions du projet.

#### Focus : `/update-design-system`

Synchronise tout le design system du projet (`theme.css`, `app.css`, `services.yaml`, `base.html.twig`, `layouts/main.html.twig`) à partir d'un **lien de partage Claude Design**.

### Mémoire projet

`.claude/memory/` documente les conventions persistantes : architecture front-end et règle de réutilisation prioritaire des outils du squelette (`_docs_system/`).

---

## Commandes utiles

> Préfixer par `docker compose exec php` pour exécuter dans le conteneur.

```bash
# Symfony
php bin/console                              # liste des commandes
php bin/console app:user:create              # créer un utilisateur
php bin/console cache:clear                  # vider le cache
php bin/console debug:router                 # lister les routes

# Doctrine
php bin/console doctrine:database:create
php bin/console make:migration
php bin/console doctrine:migrations:migrate

# Front-end (yarn)
yarn dev | yarn watch | yarn build

# Messenger
php bin/console messenger:consume async -vv

# Scripts locaux à exécuter depuis le container docker php (bin/local)
./bin/local/fixerQuality.sh                  # exécuter php-cs-fixer
./bin/local/messenger.sh                     # consommer les messages (limit 10)
```

---

## Tests & qualité

```bash
# Tests unitaires & fonctionnels (PHPUnit 13)
docker compose exec php php bin/phpunit

# Tests E2E navigateur (Symfony Panther — Chromium / Firefox)
docker compose exec php php bin/phpunit --testsuite e2e

# Style de code (PHP-CS-Fixer)
docker compose exec php vendor/bin/php-cs-fixer fix
```

Configuration : `phpunit.dist.xml`, `.php-cs-fixer.dist.php`, `.editorconfig`.

---

## Documentation

Toute la documentation du squelette se trouve dans le dossier [`_docs_system/`](_docs_system/) :

- [`architecture-frontend.md`](_docs_system/architecture-frontend.md) — stack, conventions CSS/JS/Twig, `theme.css`, layouts, thème mail.
- [`architecture-api.md`](_docs_system/architecture-api.md) — conventions REST, format de réponse, codes HTTP.
- [`guide-symfony-form.md`](_docs_system/guide-symfony-form.md) — guide des formulaires.
- [`components/`](_docs_system/components/) — un fichier par composant UX.
- [`helpers/`](_docs_system/helpers/index.md) — documentation détaillée de chaque helper.
- [`services/`](_docs_system/services/) — services (Messenger Scheduler…).

---

## Licence MIT

Projet — GBonnaire.fr.

