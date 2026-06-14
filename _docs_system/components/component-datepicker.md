# Composant Twig — `<twig:FormFieldDatepicker>`

Champ de sélection de date ou plage de dates, piloté par DateRangePicker.
Le calendrier est rendu via un contrôleur Stimulus qui passe les options depuis les props Twig.
Disponible en deux modes : **plage de dates** (par défaut) et **date unique**.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Composant PHP | `src/Twig/Components/FormFieldDatepickerComponent.php` |
| Template Twig | `templates/components/form_field_datepicker.html.twig` |
| Contrôleur Stimulus | `assets/controllers/components/twig/form_field_datepicker_controller.js` |
| Module JS | `assets/js/modules/form-fields/daterangepicker/daterangepicker.js` |
| CSS | `assets/js/modules/form-fields/daterangepicker/daterangepicker.css` |
| FormType Symfony | `src/Form/Type/DateRangePickerType.php` |
| Bloc form theme | `templates/form/da_form_theme.html.twig` → `date_range_picker_widget` |

---

## Props — `<twig:FormFieldDatepicker>`

### Champ

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `string` | auto | Identifiant HTML — généré automatiquement (`drp_xxxxxxxx`) si absent |
| `name` | `string` | `''` | Attribut `name` de l'input (requis pour les formulaires) |
| `label` | `string` | `''` | Texte du label affiché au-dessus du champ |
| `placeholder` | `string` | `''` | Placeholder de l'input |
| `value` | `string` | `''` | Valeur initiale pré-remplie (doit respecter `format` et `separator`) |
| `required` | `bool` | `false` | Marque le champ comme obligatoire (astérisque sur le label) |
| `disabled` | `bool` | `false` | Désactive le champ |
| `help` | `string` | `''` | Texte d'aide affiché sous le champ (masqué si `error` est présent) |
| `error` | `string` | `''` | Message d'erreur — applique `da-input--error` sur l'input |

### Calendrier

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `singleDate` | `bool` | `false` | Mode date unique — `false` = plage de deux dates |
| `opens` | `string` | `'right'` | Côté d'ouverture du calendrier : `left` · `center` · `right` |
| `drops` | `string` | `'down'` | Sens d'ouverture : `up` · `down` · `auto` |
| `format` | `string` | `'DD/MM/YYYY'` | Format de date (notation moment.js) |
| `separator` | `string` | `' — '` | Séparateur entre la date de début et la date de fin |
| `minDate` | `string` | `''` | Date minimum sélectionnable (au format `format`) |
| `maxDate` | `string` | `''` | Date maximum sélectionnable (au format `format`) |
| `autoApply` | `bool` | `false` | Applique automatiquement dès la sélection (sans bouton Appliquer) |
| `showRanges` | `bool` | `false` | Affiche les raccourcis de plages prédéfinies dans un panneau latéral |

---

## Plages prédéfinies (`showRanges="true"`)

Activées lorsque `showRanges` est `true` et `singleDate` est `false`.

| Label | Période calculée |
|-------|-----------------|
| Aujourd'hui | Jour courant |
| Cette semaine | Lundi → Dimanche de la semaine ISO courante |
| Semaine dernière | Lundi → Dimanche de la semaine ISO précédente |
| Ce mois | 1er → dernier jour du mois courant |
| Mois dernier | 1er → dernier jour du mois précédent |
| 3 derniers mois | Il y a 3 mois → aujourd'hui |
| Période personnalisée | Ouvre le calendrier pour une sélection libre |

> Une plage prédéfinie sélectionnée est toujours convertie en dates formatées dans l'input (ex : `26/05/2026 — 01/06/2026`).

---

## Événements natifs sur l'input

| Événement | Déclencheur |
|-----------|-------------|
| `change` | Valeur mise à jour après confirmation — compatible `addEventListener` et formulaires Symfony |
| `apply.daterangepicker` | Une plage est confirmée (detail = instance DateRangePicker) |
| `cancel.daterangepicker` | Annulation |
| `show.daterangepicker` | Calendrier ouvert |
| `hide.daterangepicker` | Calendrier fermé |

---

## Exemples d'utilisation — Twig component

### Plage de dates minimale

```twig
<twig:FormFieldDatepicker
    name="periode"
    label="Période"
    placeholder="JJ/MM/AAAA — JJ/MM/AAAA"
/>
```

### Date unique

```twig
<twig:FormFieldDatepicker
    name="date_debut"
    label="Date de début"
    :singleDate="true"
    placeholder="JJ/MM/AAAA"
/>
```

### Avec plages prédéfinies et limites

```twig
<twig:FormFieldDatepicker
    name="periode"
    label="Filtrer par période"
    :showRanges="true"
    minDate="01/01/2024"
    maxDate="31/12/2026"
    opens="left"
/>
```

### Avec valeur initiale et message d'aide

```twig
<twig:FormFieldDatepicker
    name="periode"
    label="Période de surveillance"
    value="01/05/2026 — 31/05/2026"
    help="La surveillance s'arrête automatiquement à la date de fin."
/>
```

### Avec erreur de validation

```twig
<twig:FormFieldDatepicker
    name="periode"
    label="Période de surveillance"
    value="01/05/2026 — 31/05/2026"
    error="La date de fin doit être postérieure à la date de début."
    :required="true"
/>
```

### Application automatique (sans bouton Appliquer)

```twig
<twig:FormFieldDatepicker
    name="date"
    label="Date"
    :singleDate="true"
    :autoApply="true"
/>
```

### Calendrier ouvrant vers le haut à gauche

```twig
<twig:FormFieldDatepicker
    name="periode"
    label="Plage"
    opens="left"
    drops="up"
/>
```

---

## Utilisation — Symfony FormType

`DateRangePickerType` hérite de `TextType`. La valeur stockée dans l'entité est une `string`.

### Déclaration dans un FormType PHP

```php
use App\Form\Type\DateRangePickerType;

$builder->add('periode', DateRangePickerType::class, [
    'label'       => 'Période de surveillance',
    'show_ranges' => true,
    'required'    => false,
]);

// Date unique avec limite inférieure = aujourd'hui
$builder->add('date_debut', DateRangePickerType::class, [
    'label'       => 'Date de début',
    'single_date' => true,
    'min_date'    => (new \DateTime())->format('d/m/Y'),
]);
```

### Options disponibles (`DateRangePickerType`)

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `single_date` | `bool` | `false` | Mode date unique |
| `opens` | `string` | `'right'` | `left` · `center` · `right` |
| `drops` | `string` | `'down'` | `up` · `down` · `auto` |
| `format` | `string` | `'DD/MM/YYYY'` | Format moment.js |
| `separator` | `string` | `' — '` | Séparateur plage |
| `min_date` | `string` | `''` | Date minimum |
| `max_date` | `string` | `''` | Date maximum |
| `auto_apply` | `bool` | `false` | Application automatique |
| `show_ranges` | `bool` | `false` | Raccourcis prédéfinis |

> Les options standard de `TextType` (`label`, `help`, `required`, `disabled`, `attr`…) sont toutes supportées.

### Rendu automatique via le form theme

Le form theme `da_form_theme.html.twig` (enregistré globalement) détecte automatiquement le bloc `date_range_picker_widget` et applique le wrapper Stimulus + icône + input `readonly`.

Aucune configuration de template supplémentaire n'est nécessaire.

---

## Écouter le changement de valeur en JavaScript

```js
const input = document.querySelector('[name="periode"]');

input.addEventListener('change', (e) => {
    console.log('Nouvelle valeur :', e.target.value);
    // ex : "26/05/2026 — 01/06/2026"
});

// Ou via l'événement natif du picker
input.addEventListener('apply.daterangepicker', (e) => {
    const picker = e.detail;
    console.log('start:', picker.startDate.format('DD/MM/YYYY'));
    console.log('end:',   picker.endDate.format('DD/MM/YYYY'));
});
```

---

## Structure HTML générée

```html
<!-- Wrapper Stimulus (posé par le composant Twig ou le form theme) -->
<div class="form-group"
     data-controller="components--twig--form-field-datepicker"
     data-components--twig--form-field-datepicker-single-date-value="false"
     data-components--twig--form-field-datepicker-opens-value="right"
     ...>

    <label class="da-label" for="drp_abc12345">Période</label>

    <div class="da-input-wrapper">
        <i class="fa-regular fa-calendar-days da-input-icon da-input-icon--left" aria-hidden="true"></i>
        <input
            id="drp_abc12345"
            name="periode"
            type="text"
            class="da-input da-input--icon-left"
            placeholder="JJ/MM/AAAA — JJ/MM/AAAA"
            autocomplete="off"
            readonly
        >
    </div>

    <!-- En cas d'erreur -->
    <p class="da-field-error" role="alert">
        <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
        Message d'erreur
    </p>

    <!-- Ou texte d'aide -->
    <p class="da-field-help">Texte d'aide</p>
</div>
```

---

## Classes CSS de référence

| Classe | Rôle |
|--------|------|
| `.da-input-wrapper` | Conteneur relatif pour l'icône et l'input |
| `.da-input` | Styles de base de l'input |
| `.da-input--icon-left` | Padding gauche pour laisser place à l'icône |
| `.da-input--error` | Bordure et état d'erreur |
| `.da-label` | Style du label |
| `.da-label.required` | Ajoute `*` après le label |
| `.da-field-error` | Message d'erreur (rouge, icône exclamation) |
| `.da-field-help` | Texte d'aide (couleur secondaire) |
| `.daterangepicker` | Popup du calendrier (géré par `daterangepicker.css`) |
