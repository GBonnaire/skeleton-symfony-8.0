---
name: init-skeleton
description: Initialize tous les éléments pour la génération de code par l'IA
---

# Préambule

Ajoute dans ta mémoire globale que le premier fichier à lire à chaque nouvelle session est le fichier `.claude/memory/MEMORY.md`
puis charge le fichier `.claude/memory/MEMORY.md`

## Objectif

Initialiser tous les éléments nécessaires pour préparer au mieux à suivre les bonnes pratiques de génération de code par IA

## Recherche d'informations

Pose les questions suivantes (si tu n'as pas l'informations) :
- Nom du projet
- Objectif du projet
- Langue que l'IA doit utiliser dans ces conversations
- Langue à utiliser dans le nom des entités, services, repository, route
- Langue à utiliser dans les commentaires du code
- Langue à utiliser dans les documentations
- Est-ce qu'il va utiliser Claude Design pour générer le design de l'application, si oui demander s'il a déjà fait le design et si oui demander le lien claude design

une fois que tu as toutes ces informations tu mets à jour ta mémoire (`.claude/memory/MEMORY.md`)

## Prérequis techniques avant de commencer le dev

- Génère un APP_SECRET (alphanumérique sur 128 caractères) dans le fichier `.env`
- Vérifie si un GIT est initialisé, si ce n'est pas le cas propose à l'utilisateur d'initialiser un GIT
- Vérifie si le répertoire vendor est présent et les packages sont installés, sinon lancer un `composer install`
- Si il utilise claude design rappeler de bien idniquer dans le prompt d'utiliser Tailwind et Fontawesome. Tu pourras lui proposer un prompt à intégrer dans ces instructions claude design
- Si le design est déjà fait, propose lui de mettre à jour le thème, s'il accepte exécute la commande `/update-design-system`
- Si le README existe déjà, propose de refaire entièrement le README, s'il accepte exécute la commande `/update-readme`

## A exécuter une fois tous les éléments et avant les commandes
- Mets à jour le fichier services.yaml et particulièrement les lignes ci-dessous et les éléments entre [...] : 
```yaml
     app:
        name: '[APP NAME]'
        description: '[VERY SHORT DESCRIPTION]'
```
