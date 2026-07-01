---
name: project-frontend-architecture
description: "Architecture front-end — conventions CSS/JS/Twig, structure des fichiers, règles de design"
metadata: 
  node_type: memory
  type: project
---

## Structure des fichiers (symétrie totale)

```
assets/styles/
  theme.css              ← CONFIG CENTRALE — toutes les variables, tokens Tailwind, classes composants
  app.css                ← imports (tailwindcss + theme.css + sous-fichiers)
  components/            ← CSS spécifique à un composant réutilisable
  layouts/               ← CSS des layouts (app-layout, etc.)
  partials/              ← CSS navbar, footer, sidebar…
  pages/                 ← CSS spécifique à une page

assets/js/
  components/            ← JS d'un composant
  layouts/
  partials/
  pages/                 ← JS spécifique à une page

templates/
  base.html.twig         ← base globale (polices, FA, blocks stylesheets/javascripts/head/scripts)
  components/            ← composants Twig réutilisables
  layouts/               ← layouts Twig (ex: layout-app.html.twig)
  partials/              ← navbar.html.twig, footer.html.twig…
  pages/                 ← une page = un fichier Twig
```

## webpack.config.js — Entrées Encore

Une entrée Webpack par page (en plus de l'entrée globale) :

```js
// Entrée globale — Tailwind, theme.css, composants partagés
.addEntry('app', './assets/js/app.js')

// Une entrée par page
.addEntry('home', './assets/js/pages/home.js')
.addEntry('directory', './assets/js/pages/directory.js')
// etc.
```

Le fichier JS de page importe son CSS spécifique :
```js
// assets/js/pages/home.js
import '../styles/pages/home.css';
// ... logique JS de la page
```

Dans le template Twig de la page, charger l'entrée dans les blocs :
```twig
{% block stylesheets %}
    {{ parent() }}
    {{ encore_entry_link_tags('home') }}
{% endblock %}

{% block javascripts %}
    {{ parent() }}
    {{ encore_entry_script_tags('home') }}
{% endblock %}
```

## Règles de composition

- **Une page** = 1 template Twig + 1 CSS page + 1 JS page (si besoin)
- **Un layout** = 1 template layout + 1 CSS layout
- **base.html.twig** : aucun CSS inline, aucun style direct — tout passe par assets
- Le **layout** hérite de `base.html.twig` via `{% extends 'base.html.twig' %}`
- La **page** hérite du layout via `{% extends 'layouts/xxx.html.twig' %}`
- Les CSS de page sont chargés via un bloc `{% block stylesheets %}` dans le template de page

## Extensions Twig — attributs obligatoires

Toute extension Twig (`src/Twig/Extension/`) doit **exclusivement** utiliser les attributs natifs, jamais l'ancien système (`extends AbstractExtension` + `getFilters()`/`getFunctions()`) :

- `#[AsTwigFilter]` — pour déclarer un filtre
- `#[AsTwigFunction]` — pour déclarer une fonction
- `#[AsTwigComponent]` — pour déclarer un composant


L'ancien système (`extends AbstractExtension` + `getFilters()` / `getFunctions()`) est **proscrit**. Les attributs rendent la classe plus légère (pas d'héritage), auto-documentée et directement auto-configurée par Symfony.


## theme.css — config centrale

Fichier : `assets/styles/theme.css`

Contient :
1. `@theme {}` — tokens Tailwind v4 (couleurs azur/ink/coral/sémantiques, ombres, rayons, polices)
2. `:root {}` — variables CSS `--da-*` (rôles sémantiques, typographie, espacement, tailles)
3. Classes composants réutilisables préfixées `da-` :
   - `.da-btn`, `.da-btn-primary/secondary/outline/ghost/danger`, `.da-btn-sm/lg/hero/icon`
   - `.da-input`, `.da-select`, `.da-label`, `.da-field-error`, `.da-input-wrapper`
   - `.da-toggle`, `.da-pill-checkbox`, `.da-segmented`
   - `.da-card`, `.da-card-practitioner`, `.da-card-alert`, `.da-card-slot`
   - `.da-badge`, `.da-badge--success/warning/danger/info/neutral/brand/alert/outline`
   - `.da-toast`, `.da-toast__icon--success/danger/warning/info`
   - `.da-navbar`, `.da-nav-link`, `.da-bottom-nav`, `.da-bottom-nav__item`
   - `.da-logomark`, `.da-pulse`, `.da-avatar`, `.da-slider`, `.da-container`
   - `.da-display/h1/h2/h3/body-lg/body/caption/overline/mono/kicker` (échelle typo)

## Design system — valeurs clés

- **Police :** Montserrat (sans) + Montserrat Mono (chiffres, horaires, distances)
- **Couleur brand :** `#0F558A` (azur-600) — CTA, liens, focus
- **Accent alerte :** `#FF6B5B` (coral-500) — strictement réservé aux alertes actives
- **Canvas :** `#F7FAFA` (ink-50) — fond de page
- **Surface :** `#FFFFFF` — cartes, inputs
- **Border fin :** `#EEF2F3` (ink-100)
- **Texte primaire :** `#0F1417` (ink-900)
- **Texte secondaire :** `#6B757B` (ink-500)
- **Focus ring :** `box-shadow: 0 0 0 3px rgba(15,85,138,0.25)` + `border-color: #0F558A`
- **Rayon cartes :** 10px (`rounded-md`) — boutons/inputs : 8px (`rounded`)
- **Hauteur input/touch min :** 44px

**Why:** Règle absolue — aucun CSS dans les fichiers Twig. theme.css est la source de vérité unique.

**How to apply:** Toujours vérifier theme.css avant d'écrire du CSS pour un composant ou une page. Utiliser les classes `da-*` et les variables `--da-*` plutôt que des valeurs codées en dur.
