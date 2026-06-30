# Module JS — Selectize

Surcouche du design system autour de **Choices.js** (v11). Remplace le `<select>` natif par un composant stylisé : dropdown avec chevron, tags supprimables, recherche, optgroups, états désactivé et erreur.

L'initialisation est automatique via le contrôleur Stimulus `components/forms/form` — aucune configuration JavaScript n'est requise pour l'usage standard.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Classe principale | `assets/js/modules/form-fields/selectize/selectize.js` |
| Auto-initialiseur | `assets/js/modules/form-fields/selectize/selectize-manager.js` |
| CSS | `assets/js/modules/form-fields/selectize/selectize.css` |
| Contrôleur Stimulus | `assets/controllers/components/forms/form_controller.js` |
| Bloc form theme | `templates/form/da_form_theme.html.twig` → `choice_widget_collapsed` |

---

## Initialisation automatique

`SelectizeManager` est instancié dans `initialize()` du contrôleur Stimulus `components/forms/form`. Dès qu'un formulaire portant ce contrôleur est présent dans la page, **tous** les `select.da-select` de la page sont initialisés (sélecteur global sur `document`).

```twig
{# Suffit à déclencher l'initialisation de tous les select.da-select de la page #}
<form {{ stimulus_controller('components/forms/form') }}>
    …
</form>
```

Chaque élément initialisé expose son instance via `el._selectize`. La double initialisation est protégée (`if (!el._selectize)`).

### Opt-out par élément

```html
<select class="da-select" data-da-selectize="false">…</select>
```

---

## Variantes — `data-*` sur le `<select>`

| Attribut | Valeur | Effet |
|----------|--------|-------|
| `multiple` | _(attribut HTML)_ | Mode multi-sélection avec tags supprimables |
| `data-search="true"` | `"true"` | Active la recherche sur un select simple |
| `data-max-items="N"` | entier | Limite le nombre d'items sélectionnables (multiple) |
| `data-da-selectize="false"` | `"false"` | Conserve le `<select>` natif, pas de Choices.js |
| `disabled` | _(attribut HTML)_ | Désactive le champ (fond grisé, curseur `not-allowed`) |
| `class="da-select--error"` | _(classe CSS)_ | Applique l'état d'erreur (bordure rouge) |

---

## Exemples HTML

### Select simple

```html
<select class="da-select">
    <option value="">Choisir…</option>
    <option value="1">Option A</option>
    <option value="2">Option B</option>
</select>
```

### Select avec recherche

```html
<select class="da-select" data-search="true">
    <option value="">Rechercher…</option>
    <option value="fr">France</option>
    <option value="de">Allemagne</option>
    <option value="es">Espagne</option>
</select>
```

### Select multiple

```html
<select class="da-select" multiple>
    <option value="1">Option A</option>
    <option value="2">Option B</option>
    <option value="3">Option C</option>
</select>
```

### Multiple avec limite d'items

```html
<select class="da-select" multiple data-max-items="2">
    <option value="1">Option A</option>
    <option value="2">Option B</option>
    <option value="3">Option C</option>
</select>
```

### Optgroups

```html
<select class="da-select">
    <option value="">Choisir…</option>
    <optgroup label="Groupe A">
        <option value="a1">Sous-option 1</option>
        <option value="a2">Sous-option 2</option>
    </optgroup>
    <optgroup label="Groupe B">
        <option value="b1">Sous-option 3</option>
        <option value="b2">Sous-option 4</option>
    </optgroup>
</select>
```

### Désactivé

```html
<select class="da-select" disabled>
    <option value="1" selected>Valeur verrouillée</option>
</select>
```

### État erreur

```html
<select class="da-select da-select--error">
    <option value="">Choisir…</option>
    <option value="1">Option A</option>
</select>
```

---

## Utilisation — Symfony FormType

Le form theme `da_form_theme.html.twig` (enregistré globalement) ajoute automatiquement la classe `da-select` à tout `ChoiceType` rendu en mode `collapsed` (select déroulant). Aucune configuration de template supplémentaire n'est nécessaire.

### Déclaration dans un FormType PHP

```php
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

// Select simple
$builder->add('statut', ChoiceType::class, [
    'label'       => 'Statut',
    'placeholder' => 'Choisir…',
    'choices'     => ['Actif' => 'actif', 'Inactif' => 'inactif'],
]);

// Select avec recherche
$builder->add('pays', ChoiceType::class, [
    'label'       => 'Pays',
    'placeholder' => 'Rechercher…',
    'choices'     => $paysList,
    'attr'        => ['data-search' => 'true'],
]);

// Select multiple avec limite
$builder->add('tags', ChoiceType::class, [
    'label'    => 'Tags',
    'choices'  => $tagsList,
    'multiple' => true,
    'expanded' => false,
    'attr'     => ['data-max-items' => '3'],
]);

// Select désactivé via Selectize natif
$builder->add('type', ChoiceType::class, [
    'label'   => 'Type',
    'choices' => $typeList,
    'attr'    => ['data-da-selectize' => 'false'],
]);
```

> Les options standard de `ChoiceType` (`label`, `help`, `required`, `disabled`, `placeholder`, `attr`…) sont toutes supportées.

---

## API JavaScript

L'instance est accessible via `el._selectize` (élément DOM) ou en instanciant la classe directement.

```js
import { Selectize } from 'assets/js/modules/form-fields/selectize/selectize';

const sel = new Selectize('#mon-select');
// ou : const sel = document.querySelector('#mon-select')._selectize;
```

### Méthodes

| Méthode | Retour | Description |
|---------|--------|-------------|
| `getValue()` | `string \| string[]` | Valeur(s) sélectionnée(s) — tableau si `multiple` |
| `setValue(value)` | `this` | Définit la valeur (string ou tableau de strings) |
| `clearValue()` | `this` | Supprime la sélection en cours |
| `setChoices(arr)` | `this` | Remplace les options — `arr: [{value, label, disabled?, selected?}]` |
| `enable()` | `this` | Active le champ |
| `disable()` | `this` | Désactive le champ |
| `setError(bool)` | `this` | Bascule l'état d'erreur |
| `destroy()` | `void` | Détruit l'instance et restaure le `<select>` natif |
| `.instance` | `Choices` | Accès à l'instance Choices.js sous-jacente |

### Exemples d'usage

```js
const select = document.querySelector('#mon-select')._selectize;

// Lire la valeur
const val = select.getValue(); // "fr" ou ["fr", "de"]

// Définir une valeur
select.setValue('fr');
select.setValue(['fr', 'de']); // multiple

// Remplacer les options dynamiquement
select.setChoices([
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Allemagne', disabled: true },
]);

// Activer / désactiver / erreur
select.disable();
select.enable();
select.setError(true);
select.setError(false);

// Chaîner
select.clearValue().setError(false).enable();
```

---

## Événements

`Selectize` étend `EventsDispatcher`. Les événements sont écoutés via `on()`.

| Événement | Données | Déclencheur |
|-----------|---------|-------------|
| `change` | `value` (string \| string[]) | Valeur modifiée |
| `open` | — | Dropdown ouvert |
| `close` | — | Dropdown fermé |
| `addItem` | `{ value, label, … }` | Item ajouté (multiple) |
| `removeItem` | `{ value, label, … }` | Item supprimé (multiple) |
| `destroy` | — | Instance détruite |

```js
const select = document.querySelector('#mon-select')._selectize;

select.on('change', (value) => {
    console.log('Nouvelle valeur :', value);
});

select.on('addItem', ({ value, label }) => {
    console.log('Ajouté :', label, '→', value);
});

select.on('removeItem', ({ value }) => {
    console.log('Supprimé :', value);
});
```

---

## Traductions

Les textes sont gérés via le `Translator` JS (domaine `selectize`). La langue est résolue automatiquement depuis `document.documentElement.lang`.

| Clé | FR | EN |
|-----|----|----|
| `noResultsText` | Aucun résultat | No results found |
| `noChoicesText` | Aucune option disponible | No choices to choose from |
| `uniqueItemText` | Seules des valeurs uniques peuvent être ajoutées | Only unique values can be added |
| `maxItemText` | Maximum {max} valeur(s) autorisée(s) | Only {max} values can be added |
| `addItemText` | Appuyez sur Entrée pour ajouter "{value}" | Press Enter to add "{value}" |
| `removeItemIconText` | Supprimer | Remove item |
| `removeItemLabelText` | Supprimer : {label} | Remove item: {label} |

Pour surcharger une traduction dans une page spécifique :

```js
import Translator from 'assets/js/utils/translator';

Translator.get().load({
    noResultsText: 'Aucun élément trouvé',
}, 'selectize', 'fr');
```

---

## Classes CSS de référence

| Classe | Rôle |
|--------|------|
| `.da-selectize` | Classe racine — porte toutes les CSS custom properties du thème |
| `.da-selectize.is-focused` | État focus — bordure brand + box-shadow |
| `.da-selectize.is-open` | Dropdown ouvert — rayon bas supprimé sur l'inner |
| `.da-selectize.is-flipped` | Dropdown ouvert vers le haut |
| `.da-selectize.is-disabled` | Champ désactivé — fond grisé, curseur `not-allowed` |
| `.da-selectize.is-invalid` | État erreur — bordure rouge + box-shadow rouge |
| `.choices__inner` | Zone de saisie visible |
| `.choices__list--dropdown` | Dropdown (`display: none` → `display: block` avec `.is-active`) |
| `.choices__item--selectable.is-highlighted` | Option survolée ou focus clavier |
| `.choices__item--selectable.is-selected` | Option déjà sélectionnée |
| `.choices__heading` | En-tête de groupe (optgroup) |
| `.choices__notice` | Message "aucun résultat" / "aucun choix" |
