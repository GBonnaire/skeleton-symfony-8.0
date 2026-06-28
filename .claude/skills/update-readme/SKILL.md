---
name: update-readme
description: Met à jour le readme du projet symfony
---

# Préambule

Si le fichier README.md n'existe pas alors analyse ce projet Symfony et génère un README.md complet et professionnel.
Si le fihier README.md existe alors lire le fichier avant tout chose

## Objectif

Objectif écrire ou mettre à jour le readme qui doit intégrer :
- Structure du projet
- Configuration requise
- Déploiement DEV
- Déploiement PROD
- Utilisation
- Configuration
- Crons
- Commandes disponibles

## STRUCTURE MINIMAL DU README :

# [Nom du Projet]
[Description courte du projet - 1-2 lignes]

Git : [URL du repository si trouvé dans .git/config]

## Usage

### Local
#### Installation (Dev)
* Require : PHP[version détectée depuis composer.json]
* Clone repository : `git clone [url]`
* [Si Docker] Si Docker présent : `docker compose up -d`
* Configure `.env.local`
* [Si Docker] Connect to terminal on Docker and continue in docker
* Install dependencies
    * `composer install`
    * `php bin/console assets:install`
    * `php bin/console doctrine:migrations:migrate`
    * [Si webpack and yarn.lock] `yarn install`
    * [Si webpack and yarn.lock] `yarn dev`
    * [Si assetMapper] `php bin/console importmap:install && php bin/console asset-map:compile`
    * [Si assetMapper and tailwind] `php bin/console tailwind:build && php bin/console cache:clear`
    * [Lister les extensions PHP spéciales détectées dans composer.json avec instructions d'installation via PECL]
* [Si messenger] Start worker
    * if you want to use command
        * you can create file sh on `bin/local/`
        * script sh for start :
        * ```bash
      #!/bin/bash

      cd /var/www/app
      php bin/console messenger:consume async --limit=10
      ```
    * if you want to use supervisor
        * install supervisor : `nano /etc/supervisor/conf.d/symfony_messenger.conf`
        * [Configuration supervisor adaptée]
        * `service supervisor start`
        * check with status : `supervisorctl status`
        * If not started : `supervisorctl start symfony-messenger-consume-async:*`
* [Si PHPStan détecté] Check quality of your code with this command : `php vendor/bin/phpstan analyse src` with PHPStan
* [Si PHPCSFixer détecté] Check quality of your code with this command : `/var/www/app/vendor/bin/php-cs-fixer fix src` with PHPCSFixer

### Deploy (prod)
* Create Deploy Key (Settings > Repository > Deploy Key)
* Require : PHP[version]
* Packages requires:
    * Ext PHP : [lister les extensions depuis composer.json]
* Clone or update repository :
    * Clone `git clone [url] [folder]`
    * Update `git pull`
* Configure `.env.local`
* Install dependencies
    * `composer install --no-dev --optimize-autoloader`
    * `php bin/console assets:install`
    * `php bin/console doctrine:migrations:migrate`
    * [Si yarn] `yarn install --ignore-engines`
    * [Si yarn] `yarn build`
    * [Si assetMapper] `php bin/console importmap:install && php bin/console asset-map:compile`
    * [Si assetMapper and tailwind] `php bin/console tailwind:build && php bin/console cache:clear`
    * [Extensions PHP avec instructions PECL]
* Clear cache `php bin/console cache:clear`
* [Si applicable] Update crons

### Update
Use script `bin/local/gitupdate.sh`
if no exist, in directory of project, execute this lines
* `git pull`
* `composer install --no-dev --optimize-autoloader --no-interaction`
* `php bin/console --no-interaction doctrine:migrations:migrate`
* `php bin/console cache:clear`
* [Si messenger] `php bin/console messenger:stop-workers`
* [Si yarn] `yarn install --ignore-engines`
* [Si yarn] `yarn build`
* [Si assetMapper] `php bin/console importmap:install && php bin/console asset-map:compile`
* [Si assetMapper and tailwind] `php bin/console tailwind:build && php bin/console cache:clear`

## Configuration
To define in .env, .env.local

### App
* `APP_BASEURL` : Base app URL with http (without / on last char)
* [Lister TOUTES les variables d'environnement trouvées dans .env et .env.example avec leur description]

[POUR CHAQUE GROUPE DE CONFIG (Socket, OAuth, API, etc.) créer une section avec:]
#### [Nom du groupe]
[Si nécessaire] Go to [URL de configuration]
1) [Étapes de configuration]
* [Variables d'env avec description]

## HOW GUIDE
[Lister les guides spécifiques trouvés dans le code comme SubscriptionType, Configuration avancée, etc.]

## Crons
[Analyser src/Command et lister les commandes qui semblent être des crons avec leur fréquence suggérée]
### Every [période]
* Command : `app:[nom] [options]`

## Commands available
[Lister TOUTES les commandes Symfony trouvées dans src/Command/]
### Command [Nom]
* Command : `app:[nom] [arguments] [options]`
  [Description extraite du code ou des commentaires]

---

INSTRUCTIONS D'ANALYSE :

1. Commence par explorer la structure du projet avec `ls -la`
2. Lis composer.json pour identifier :
    - Version PHP requise
    - Dépendances importantes (doctrine, messenger, etc.)
    - Extensions PHP spéciales
3. Cherche .env et .env.example pour toutes les variables d'environnement
4. Explore src/Command/ pour lister toutes les commandes disponibles
5. Vérifie la présence de : docker-compose.yml, yarn.lock, package.json, stream/, PHPStan
6. Si .git/config existe, extrais l'URL du repository
7. Cherche les URLs de déploiement dans les .env
8. Identifie les patterns de configuration (OAuth, API keys, etc.)

IMPORTANT :
- Sois exhaustif : liste TOUTES les variables d'env, TOUTES les commandes
- Groupe logiquement les configurations (OAuth ensemble, API ensemble, etc.)
- Ajoute des commentaires explicatifs pour les configurations complexes
- Si une info n'est pas trouvée, marque [À définir] plutôt que de l'inventer
- Respecte EXACTEMENT la structure fournie ci-dessus
- N'intègre pas les informations sur la documentation du Skeleton présent dans `_docs_system`
