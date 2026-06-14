# Architecture front-end

## Stack

- **Symfony 8** — MPA (Multi-Page Application)
- **Webpack Encore** — bundler, une entrée par page
- **Tailwind CSS v4** — utilitaires via `@theme {}`
- **FontAwesome 6** — icônes (solid par défaut, regular pour états désactivés)

---

## Structure des fichiers (symétrie totale)

```
assets/
  app.js                   ← entry globale Webpack
  styles/
    theme.css              ← CONFIG CENTRALE — variables, tokens Tailwind, classes da-*
    app.css                ← imports (tailwindcss + theme.css + partials/layouts)
    components/            ← CSS d'un composant réutilisable
    layouts/               ← CSS des layouts
    partials/              ← CSS navbar, footer, sidebar…
    pages/                 ← CSS spécifique à une page
  js/
    components/            ← JS d'un composant réutilisable
    layouts/               ← JS d'un layout
    partials/              ← JS navbar, footer…
    pages/                 ← JS spécifique à une page

templates/
  base.html.twig           ← base globale (polices, FA, blocks)
  components/              ← composants Twig réutilisables
  layouts/                 ← layouts Twig (ex: layout-main.html.twig)
  partials/                ← navbar.html.twig, footer.html.twig, navbar_mobile.html.twig…
  pages/                   ← une page = un fichier Twig
```

---

## Règles de composition

- **Une page** = 1 template Twig + 1 CSS page + 1 JS page (si besoin)
- **Un layout** = 1 template layout + 1 CSS layout
- **Un partial** = 1 template partial + 1 CSS partial (importé globalement via `app.css`)
- `base.html.twig` : aucun CSS inline, aucun style direct — tout passe par assets
- Le **layout** hérite de `base.html.twig` via `{% extends 'base.html.twig' %}`
- La **page** hérite du layout via `{% extends 'layouts/xxx.html.twig' %}`
- **Règle absolue : aucun CSS dans les fichiers Twig**

---

## webpack.config.js — Entrées Encore

Une entrée par page, en plus de l'entrée globale :

```js
// Entrée globale — Tailwind, theme.css, partials, layouts
.addEntry('app', './assets/app.js')

// Layout
.addEntry('layout-main', './assets/js/layouts/main.js')

// Pages — une entrée par page
.addEntry('page-home', './assets/js/pages/home.js')
.addEntry('page-dashboard', './assets/js/pages/dashboard.js')
.addEntry('page-account', './assets/js/pages/account.js')
// etc.
```

Le fichier JS de page importe son CSS spécifique :

```js
// assets/js/pages/home.js
import '../../styles/pages/home.css';
// ... logique JS de la page
```

Le template Twig de la page charge son entrée dans les blocs :

```twig
{% block stylesheets %}
    {{ parent() }}
    {{ encore_entry_link_tags('page-home') }}
{% endblock %}

{% block javascripts %}
    {{ parent() }}
    {{ encore_entry_script_tags('page-home') }}
{% endblock %}
```

---

## theme.css — source de vérité

Fichier : `assets/styles/theme.css`

Toujours vérifier `theme.css` avant d'écrire du CSS. Utiliser les classes `da-*` et les variables `--da-*` plutôt que des valeurs codées en dur.

### 1. `@theme {}` — tokens Tailwind v4

Génère des classes utilitaires Tailwind (`bg-azur-600`, `text-ink-500`, `shadow-card`, `rounded-md`…).

| Token | Valeur |
|---|---|
| `--color-azur-600` | `#0F558A` — couleur signature brand |
| `--color-coral-500` | `#FF6B5B` — accent alerte (usage strict) |
| `--color-ink-900` | `#0F1417` — texte primaire |
| `--color-ink-50` | `#F7FAFA` — canvas (fond de page) |
| `--shadow-card` | ombre subtile pour les cartes |
| `--shadow-pop` | ombre hover |
| `--shadow-float` | ombre modales/toasts |
| `--radius-md` | `10px` — cartes |
| `--radius-sm` | `6px` — petits inputs |


## Layout principal — `layout-main`

Fichiers :
- `templates/layouts/main.html.twig`
- `assets/styles/layouts/main.css`

Partials inclus :
- `partials/navbar.html.twig` — barre desktop
- `partials/navbar_mobile.html.twig` — bottom nav fixe (masquée ≥ 768px)
- `partials/footer.html.twig` — pied de page

Comportement responsive :
- **Desktop (≥ 768px)** : navbar horizontale complète, footer visible, bottom nav masquée
- **Mobile (< 768px)** : top bar logo seul, bottom nav fixe (3 items), padding-bottom 72px sur `main`

---

## Composants Twig UX (`<twig:NomComposant />`)

Les composants sont déclarés dans `src/Twig/Components/` et leurs templates dans `templates/components/`.
Chaque composant Twig dispose d'un contrôleur Stimulus associé dans `assets/controllers/components/twig/`.

> Voir la documentation complète (props, blocs, événements) dans le dossier `app-docs-system/components`.

---

## Système de thème mail

Les couleurs des emails sont configurées dans `config/services.yaml` (paramètre `mail_theme`)
et exposées comme global Twig `mail_theme` via `config/packages/twig.yaml`.

**Paramètres disponibles :**

| Clé | Défaut | Usage |
|---|---|---|
| `primary` | `#0F558A` | Header, boutons, highlight-box, liens footer |
| `primary_dark` | `#0A4470` | Dégradé (fin) header et boutons |
| `accent` | `#FF6B5B` | `.btn-warning` |
| `header_text` | `#ffffff` | Texte dans le header |
| `text` | `#333333` | Corps du mail |
| `text_muted` | `#6c757d` | Footer |
| `background` | `#f8f9fa` | Fond du mail et highlight-box |
| `surface` | `#ffffff` | Fond du container principal |
| `border` | `#e9ecef` | Séparateur footer |

**Surcharger le thème dans un template spécifique :**

```twig
{# mail/reset_password.html.twig #}
{% extends 'mail/base.html.twig' %}

{# Surcharge locale du thème pour ce mail uniquement #}
{% set mail_theme = mail_theme|merge({primary: '#e63946', primary_dark: '#c1121f'}) %}
```

**Ajouter des styles CSS spécifiques au mail :**

```twig
{% block styles %}
    .alerte-box { border: 2px solid {{ mail_theme.primary }}; padding: 12px; }
{% endblock %}
```
