---
name: update-design-system
description: Synchronise le design system du projet (theme.css, app.css, services.yaml, base.html.twig, layouts/main.html.twig) à partir de l'url de claude design fourni.
---
# Préambule

Si l'url n'est pas fourni ou n'est pas connu, alors demander à l'utilisateur l'url de claude design (Lien de partage) + procédure pour avoir ce lien et une fois fourni le garder en mémoire.

# Skill — Mise à jour du Design System

## Objectif

Propager les changements effectués claude design vers tous les fichiers du projet qui dépendent du design system, sans casser les conventions ni l'architecture existante.

## Fichiers sources & cibles

| Source | Cible(s) |
|---|---|
| `@theme { }` | `assets/styles/theme.css` → bloc `@theme` |
| Polices Google dans `<head>` | `templates/base.html.twig` → balises `<link>` polices |
| Couleurs brand dans le HTML | `config/services.yaml` → section `mail_theme` |
| Variables CSS `:root` implicites | `assets/styles/theme.css` → bloc `:root` (variables `--da-*`) |
| Classes utilitaires utilisées | `assets/styles/app.css` → body, typographie, boutons |
| Structure layout du `<body>` | `templates/layouts/main.html.twig` |
| Structure `<head>` / favicon | `templates/base.html.twig` |

---

## Étape 1 — Lire et analyser le design system

Récupérer intégralement le thème de claude design depuis l'url.

( Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) )

Extraire et noter :

### 1a. Tokens `@theme`
Relever **tout le contenu** du bloc `<style type="text/tailwindcss">` → section `@theme { }` :
- Familles de polices (`--font-*`)
- Palettes de couleurs et leurs noms de tokens (ex : `teal`, `ink`, `coral`, `success`, `warning`, `danger`, `info`)
- Ombres (`--shadow-*`)
- Rayons (`--radius-*`)

**IMPORTANT — réconciliation des noms de tokens :**
Le fichier `theme.css` du projet peut utiliser un nom de palette différent de celui du design (ex : `azur` dans theme.css vs `teal` dans le design). Dans ce cas :
- Identifier le nom utilisé dans **theme.css** (palette de marque existante)
- Identifier le nom utilisé dans **designSystem.html** (nouvelle palette)
- Si les **valeurs hex sont identiques** → garder le nom existant de theme.css (ne pas renommer)
- Si les **valeurs hex ont changé** → mettre à jour les valeurs en conservant le nom existant dans theme.css
- Si le nom a changé ET les valeurs aussi → mettre à jour les valeurs ET proposer à l'utilisateur s'il faut renommer (ne pas renommer automatiquement car ça casse les classes Tailwind utilisées dans les templates)

### 1b. Polices
Relever les balises `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` dans le `<head>`.

### 1c. Couleurs sémantiques brand
Relever les valeurs hex utilisées pour :
- Couleur primaire (brand)
- Couleur hover primaire
- Couleur accent/alerte
- Couleur de fond (canvas)
- Couleur surface
- Couleur texte principal

### 1d. Structure layout
Observer la structure du `<body>` dans le design (navbar sticky, main, footer, etc.) et noter les classes Tailwind utilisées sur les éléments structurels.

### 1e. Variables `:root` implicites
Dans le design HTML, les variables `--da-*` ne sont pas déclarées explicitement mais utilisées implicitement via les couleurs relevées en 1c. Les mapper sur les variables existantes dans `theme.css`.

---

## Étape 2 — Comparer avec les fichiers existants

Lire les fichiers cibles :
- `assets/styles/theme.css`
- `assets/styles/app.css`
- `config/services.yaml`
- `templates/base.html.twig`
- `templates/layouts/main.html.twig`

Pour chaque fichier, identifier précisément **ce qui a changé** entre le design actuel et les fichiers du projet. Ne modifier que ce qui est différent.

---

## Étape 3 — Mettre à jour `assets/styles/theme.css`

### Règles impératives

1. **Conserver intégralement le bloc `:root { }` avec toutes les variables `--da-*`** — c'est la source de vérité pour les composants CSS du skeleton
2. Mettre à jour les **valeurs hex** dans `:root` si elles ont changé dans le design
3. Mettre à jour le bloc `@theme { }` avec les nouveaux tokens (polices, couleurs, ombres, rayons)
4. Si des tokens sont **ajoutés** dans le design → les ajouter dans `@theme`
5. Si des tokens sont **supprimés** dans le design → les conserver dans `@theme` s'ils sont référencés ailleurs dans le projet (grep avant de supprimer)
6. Conserver la règle `.rounded { border-radius: 8px; }` si présente

---

## Étape 4 — Mettre à jour `assets/styles/app.css`

Mettre à jour uniquement :
- Les règles `body { }` (font-size, line-height, color, background-color)
- Les imports de polices si le fichier en contient
- Ne pas modifier les classes `.da-*` — elles sont définies selon les variables `--da-*` de theme.css et se mettront à jour automatiquement

---

## Étape 5 — Mettre à jour `config/services.yaml`

Mettre à jour la section `mail_theme:` avec les nouvelles valeurs hex correspondantes :

```yaml
mail_theme:
    primary:       '<couleur brand hex>'        # couleur primaire (brand-600)
    primary_dark:  '<couleur brand hover hex>'  # brand-700 / hover
    header_text:   '#ffffff'                     # toujours blanc
    accent:        '<couleur accent hex>'        # coral / alerte
    text:          '#333333'                     # corps de mail
    text_muted:    '#6c757d'                     # texte secondaire mail
    background:    '#f8f9fa'                     # fond mail
    surface:       '#ffffff'                     # surface carte mail
    border:        '#e9ecef'                     # bordure mail
```

Les valeurs `text`, `text_muted`, `background`, `surface`, `border` sont des valeurs génériques mail — ne les modifier que si le design a explicitement changé le thème mail.

---

## Étape 6 — Mettre à jour `templates/base.html.twig`

Mettre à jour uniquement :
- Les balises `<link>` Google Fonts dans le `<head>` si les polices ont changé
- Le favicon inline SVG si la couleur de fond ou la lettre a changé dans le design
- Ne pas modifier la structure Twig (blocks, encore_entry_*)

---

## Étape 7 — Mettre à jour `templates/layouts/main.html.twig`

Comparer la structure layout du design avec le fichier existant.

Mettre à jour :
- Les classes Tailwind sur les éléments structurels (`<div>`, `<main>`, etc.) si elles ont changé
- Les includes Twig si la structure des partials a changé (navbar, footer, etc.)
- Ne pas modifier les blocs Twig (`{% block %}`) ni les includes existants sauf si le design montre une structure fondamentalement différente

---

## Étape 8 — Vérification finale

Après toutes les modifications, vérifier :

1. Que `theme.css` contient toujours **toutes** les variables `--da-*` présentes avant la mise à jour
2. Que les noms de tokens Tailwind dans `@theme` sont cohérents avec les classes utilisées dans les templates (grep `bg-azur`, `text-azur`, `bg-teal`, etc.)
3. Que `app.css` importe toujours `./theme.css`
4. Que `services.yaml` est du YAML valide (indentation correcte)

Présenter un résumé des modifications effectuées par fichier.

## Étape 9 — Importer les pages de claude Design

Demander à l'utilisateur si il souhaite importer les pages de claude Design. S'il accepte, lister les pages qu'il souhaite importer (liste multiple choix) pour qu'il décide des pages à importer.
Avant d'importer lis : `.claude/memory/project-frontend-architecture.md` et  `.claude/memory/feedback-skeleton-tools.md`
Pour chaque page que l'utilisateur souhaite importer les pages de claude Design, met les dans le répertoire `templates/pages/` nomment les en suivant la structure kebab-case de la page, si la structure de la page ne peux pas s'intègrer facilement dans le `main` alors créer un nouveau layout dans `templates/layouts/`.

---

## Règles de conduite générale

- **Ne jamais supprimer** une variable CSS `--da-*` sans avoir vérifié qu'elle n'est plus utilisée
- **Ne jamais renommer** automatiquement une palette de tokens Tailwind (cela casse toutes les classes dans les templates)
- **Conserver** les commentaires de section dans theme.css et app.css
- **Minimiser** les changements : si une valeur est identique, ne pas la réécrire
- En cas de doute sur l'intention d'un changement, demander à l'utilisateur avant d'agir
