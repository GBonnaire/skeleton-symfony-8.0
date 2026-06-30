# Module JS — Rating

Composant de notation par étoiles (1 à N). Remplace un `<input type="number">` par une interface visuelle interactive : étoiles pleines, demi-étoiles, survol en temps réel, mode lecture seule.

L'initialisation est automatique via le contrôleur Stimulus `components/forms/form` — aucune configuration JavaScript n'est requise pour l'usage standard via `RatingType`.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Classe principale | `assets/js/modules/form-fields/rating/rating.js` |
| Auto-initialiseur | `assets/js/modules/form-fields/rating/rating-manager.js` |
| CSS | `assets/js/modules/form-fields/rating/rating.css` |
| Classe de base | `assets/js/modules/form-fields/abstract/abstract-field.js` |
| Contrôleur Stimulus | `assets/controllers/components/forms/form_controller.js` |
| FormType Symfony | `src/Form/Type/RatingType.php` |
| Bloc form theme | `templates/form/da_form_theme.html.twig` → `rating_widget` |

---

## Initialisation automatique

`RatingManager` est instancié dans `initialize()` du contrôleur Stimulus `components/forms/form`. Tous les éléments `[data-rating]` de la page sont initialisés automatiquement.

```twig
{# Suffit à déclencher l'initialisation de tous les [data-rating] de la page #}
<form {{ stimulus_controller('components/forms/form') }}>
    …
</form>
```

Chaque élément initialisé expose son instance via `el._rating`. La double initialisation est protégée (`if (!el._rating)`).

---

## Variantes — `data-*` sur l'input

| Attribut | Valeur | Effet |
|----------|--------|-------|
| `data-rating` | _(attribut vide)_ | Déclenche l'initialisation par `RatingManager` |
| `data-rating-number` | entier | Nombre d'étoiles (défaut : `5`) |
| `data-showscore` | `"true"` | Affiche le score textuel sous les étoiles (ex : `3/5`) |
| `readonly` | _(attribut HTML)_ | Mode lecture seule — désactive les clics |
| `value` | nombre | Score initial |

---

## Exemples HTML

### Notation interactive (5 étoiles)

```html
<input type="number" min="0" max="5" step="1"
    data-rating
    data-rating-number="5"
    value="0"
    style="display:none">
```

### Notation avec score affiché

```html
<input type="number" min="0" max="5" step="1"
    data-rating
    data-rating-number="5"
    data-showscore="true"
    value="3"
    style="display:none">
```

### Lecture seule (affichage d'une note existante)

```html
<input type="number" min="0" max="5" step="1"
    data-rating
    data-rating-number="5"
    value="4"
    readonly
    style="display:none">
```

### Notation sur 10 étoiles

```html
<input type="number" min="0" max="10" step="1"
    data-rating
    data-rating-number="10"
    value="7"
    style="display:none">
```

---

## Utilisation — Symfony FormType

`RatingType` hérite de `IntegerType`. La valeur stockée dans l'entité est un `int`.

### Déclaration dans un FormType PHP

```php
use App\Form\Type\RatingType;

// Notation interactive standard
$builder->add('note', RatingType::class, [
    'label' => 'Votre note',
]);

// Notation sur 10 étoiles avec score affiché
$builder->add('note', RatingType::class, [
    'label'      => 'Note',
    'number'     => 10,
    'show_score' => true,
]);

// Affichage d'une note existante (lecture seule)
$builder->add('notePraticien', RatingType::class, [
    'label'           => 'Note du praticien',
    'rating_readonly' => true,
    'show_score'      => true,
]);
```

### Options disponibles (`RatingType`)

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `number` | `int` | `5` | Nombre d'étoiles |
| `show_score` | `bool` | `false` | Affiche le score textuel `N/max` |
| `rating_readonly` | `bool` | `false` | Désactive les clics (affichage uniquement) |

> Les options standard de `IntegerType` (`label`, `help`, `required`, `disabled`, `attr`…) sont toutes supportées.

---

## API JavaScript

L'instance est accessible via `el._rating` (élément DOM) ou en instanciant la classe directement.

```js
import { Rating } from 'assets/js/modules/form-fields/rating/rating';

const rating = new Rating(document.querySelector('input[data-rating]'), { number: 5 });
// ou : const rating = document.querySelector('input[data-rating]')._rating;
```

### Méthodes

| Méthode | Retour | Description |
|---------|--------|-------------|
| `setValue(value)` | `void` | Définit le score (déclenche `change`) — ignoré en mode `readonly` |
| `getValue()` | `number` | Retourne le score courant |
| `render()` | `void` | Redessine les étoiles selon le score courant |

### Exemple d'usage

```js
const rating = document.querySelector('#note')._rating;

// Lire la valeur
console.log(rating.getValue()); // 3

// Définir une valeur
rating.setValue(4);

// Écouter les changements
rating.addEventListener('change', (instance, value) => {
    console.log('Nouvelle note :', value); // 4
});
```

---

## Événements

`Rating` étend `EventsDispatcher` (via `AbstractField`). Les événements sont écoutés via `addEventListener`.

| Événement | Données | Déclencheur |
|-----------|---------|-------------|
| `change` | `instance, value` | Score modifié par clic |

```js
const rating = document.querySelector('input[data-rating]')._rating;

rating.addEventListener('change', (instance, value) => {
    console.log('Note sélectionnée :', value);
    // Envoyer en AJAX, mettre à jour un compteur, etc.
});
```

---

## Classes CSS de référence

| Classe | Rôle |
|--------|------|
| `.rating-score` | Conteneur des étoiles — `display:flex`, centré |
| `.rating-score.readonly` | Mode lecture seule — curseur `default` sur les étoiles |
| `.star` | Étoile vide — pseudo-élément `::after` avec icône FontAwesome `fa-regular` |
| `.star.active` | Étoile pleine — `fa-solid fa-star` |
| `.star.half-active` | Demi-étoile — `fa-solid fa-star-half-stroke` |
| `.rating-score-value` | Score textuel `N/max` — visible si `data-showscore="true"` |
