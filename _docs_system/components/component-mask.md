# Module JS — MaskField

Champ de saisie avec masque de formatage, piloté par **IMask** (v7). L'input originel est masqué et remplacé par un champ visible formaté ; la valeur brute (non masquée) est stockée dans l'input original et soumise avec le formulaire.

L'initialisation est automatique via le contrôleur Stimulus `components/forms/form` — il suffit d'ajouter `data-mask` sur l'input.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Classe principale | `assets/js/modules/form-fields/mask/mask-field.js` |
| Auto-initialiseur | `assets/js/modules/form-fields/mask/mask-field-manager.js` |
| Classe de base | `assets/js/modules/form-fields/abstract/abstract-field.js` |
| Contrôleur Stimulus | `assets/controllers/components/forms/form_controller.js` |
| Dépendance | `imask` (^7.6) |

> `MaskField` n'a pas de FormType Symfony dédié : le masque est configuré via l'attribut `data-mask` sur n'importe quel `TextType` ou input HTML.

---

## Initialisation automatique

`MaskFieldManager` est instancié dans `initialize()` du contrôleur Stimulus `components/forms/form`. Tous les `input[data-mask]` de la page sont initialisés automatiquement.

```twig
{# Suffit à déclencher l'initialisation de tous les input[data-mask] de la page #}
<form {{ stimulus_controller('components/forms/form') }}>
    …
</form>
```

Chaque élément initialisé expose son instance via `el._maskField`. La double initialisation est protégée (`if (!el._maskField)`).

---

## Configuration — `data-mask`

L'attribut `data-mask` reçoit un **objet JSON** correspondant aux options IMask.

### Masque fixe (pattern)

```html
<input class="da-input" type="text" name="telephone"
    data-mask='{"mask": "00 00 00 00 00"}'>
```

### Masque numérique

```html
<input class="da-input" type="text" name="montant"
    data-mask='{"mask": Number, "scale": 2, "thousandsSeparator": " ", "padFractionalZeros": true, "normalizeZeros": true, "radix": ","}'>
```

> `"mask": Number` est un alias IMask pour le mode numérique.

### Masque date

```html
<input class="da-input" type="text" name="date_naissance"
    data-mask='{"mask": "DD/MM/YYYY", "blocks": {"DD": {"mask": IMask.MaskedRange, "from": 1, "to": 31, "maxLength": 2}, "MM": {"mask": IMask.MaskedRange, "from": 1, "to": 12, "maxLength": 2}, "YYYY": {"mask": IMask.MaskedRange, "from": 1900, "to": 2100}}}'>
```

### Masque regex

```html
<input class="da-input" type="text" name="code_postal"
    data-mask='{"mask": /^[0-9]{0,5}$/}'>
```

### Masque dynamique (plusieurs formats)

```html
<input class="da-input" type="text" name="reference"
    data-mask='{"mask": [{"mask": "AAA-000"}, {"mask": "000-AAA-000"}]}'>
```

---

## Options IMask principales

| Option | Type | Description |
|--------|------|-------------|
| `mask` | `string \| RegExp \| Number \| Date \| Array` | Type de masque |
| `lazy` | `bool` | `false` = affiche le placeholder du masque dès le focus |
| `placeholderChar` | `string` | Caractère de substitution (défaut : `_`) |
| `overwrite` | `bool` | Mode remplacement |
| `scale` | `int` | Nombre de décimales (mode `Number`) |
| `thousandsSeparator` | `string` | Séparateur de milliers (mode `Number`) |
| `radix` | `string` | Séparateur décimal : `','` ou `'.'` (mode `Number`) |
| `min` / `max` | `number` | Bornes de valeur (mode `Number`) |

La liste complète des options est disponible dans la [documentation IMask](https://imask.js.org/guide.html).

---

## Utilisation — Symfony FormType

`MaskField` ne requiert pas de FormType dédié. Il s'active via `attr['data-mask']` sur n'importe quel type text.

```php
use Symfony\Component\Form\Extension\Core\Type\TextType;

// Téléphone français
$builder->add('telephone', TextType::class, [
    'label' => 'Téléphone',
    'attr'  => ['data-mask' => json_encode(['mask' => '00 00 00 00 00'])],
]);

// SIRET (14 chiffres, formaté par groupes)
$builder->add('siret', TextType::class, [
    'label' => 'SIRET',
    'attr'  => ['data-mask' => json_encode(['mask' => '000 000 000 00000'])],
]);

// Code postal
$builder->add('codePostal', TextType::class, [
    'label' => 'Code postal',
    'attr'  => ['data-mask' => json_encode(['mask' => '00000'])],
]);
```

---

## Comportement — valeur soumise

L'input original (masqué) reçoit la **valeur non masquée** (unmasked value). C'est cette valeur qui est soumise avec le formulaire.

| Affichage (input visible) | Valeur soumise (input masqué) |
|---------------------------|-------------------------------|
| `06 12 34 56 78` | `0612345678` |
| `1 234,56` | `1234.56` |
| `26/05/2026` | `26052026` |

Pour conserver la valeur masquée à la soumission, utiliser `processValue` dans l'API JS (voir ci-dessous).

---

## API JavaScript

L'instance est accessible via `el._maskField` (élément DOM) ou en instanciant la classe directement.

```js
import { MaskField } from 'assets/js/modules/form-fields/mask/mask-field';

// Avec options IMask
const field = new MaskField(
    document.querySelector('#telephone'),
    { mask: '00 00 00 00 00' }
);

// Avec processValue — pour personnaliser la valeur stockée
const field = new MaskField(
    document.querySelector('#montant'),
    { mask: Number, radix: ',', scale: 2 },
    (unmaskedValue, maskedValue) => maskedValue  // stocke la valeur formatée
);
```

### Constructeur

```js
new MaskField(element, options, processValue)
```

| Paramètre | Type | Description |
|-----------|------|-------------|
| `element` | `HTMLInputElement` | Input cible (sera masqué) |
| `options` | `object` | Options IMask (voir [documentation](https://imask.js.org/guide.html)) |
| `processValue` | `function(unmasked, masked) → string` | Transforme la valeur stockée dans l'input masqué |

### Accès à l'instance IMask

```js
const imaskInstance = element['mask']; // l'instance IMask sous-jacente
imaskInstance.value;         // valeur masquée
imaskInstance.unmaskedValue; // valeur brute
imaskInstance.typedValue;    // valeur typée (Date, Number selon le masque)
```

---

## Initialisation manuelle (hors formulaire Stimulus)

```js
import { MaskField } from 'assets/js/modules/form-fields/mask/mask-field';

// Au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('#telephone');
    input._maskField = new MaskField(input, { mask: '00 00 00 00 00' });
});
```

---

## Structure HTML générée

```html
<!-- Input original — masqué par le JS (style="display:none") -->
<input
    id="form_telephone"
    name="form[telephone]"
    type="text"
    class="da-input"
    data-mask='{"mask": "00 00 00 00 00"}'
    value="0612345678"
    style="display:none">

<!-- Clone visible créé par MaskField (pas de name, pas d'id) -->
<input
    type="text"
    class="da-input"
    placeholder="__ __ __ __ __"
    value="06 12 34 56 78">
```

> Le clone visible ne porte ni `name` ni `id` : il n'est jamais soumis ni ciblé par les labels.
> Les attributs `disabled` et `value` de l'input original sont synchronisés en temps réel avec le clone.
