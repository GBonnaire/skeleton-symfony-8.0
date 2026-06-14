# Guide — Formulaire Symfony complet

Ce guide décrit comment structurer un formulaire Symfony en utilisant tous les systèmes en place : form theme automatique, composants JS (Selectize, MaskField, Rating, FileDropzone, DateRangePicker, ConditionalField), Twig wrapper `<twig:Form>`, et contrôleur Stimulus.

---

## Architecture globale

```
FormType PHP
    └── Symfony Forms génère un FormView
            └── form theme da_form_theme.html.twig applique les classes DS
                    └── <twig:Form :form="form"> rend la mise en page carte
                            └── stimulus_controller('components/forms/form')
                                    └── form_controller.js initialise les managers JS
                                            ├── SelectizeManager  → select.da-select
                                            ├── MaskFieldManager  → input[data-mask]
                                            ├── FileFieldManager  → [data-file-dropzone]
                                            └── RatingManager     → input[data-rating]
```

Le form theme est enregistré **globalement** (`config/packages/twig.yaml`) — aucune déclaration par template requise. Le contrôleur Stimulus est appliqué automatiquement par le composant `<twig:Form>` dès que la prop `form` est fournie.

---

## Correspondance FormType → Design System

| FormType Symfony | Classe CSS appliquée | Composant JS activé |
|------------------|---------------------|---------------------|
| `TextType`, `EmailType`, `PasswordType`, `SearchType`, `UrlType`, `TelType` | `da-input` | — |
| `TextareaType` | `da-input da-textarea` | — |
| `ChoiceType` (`expanded: false`) | `da-select` | **Selectize** (Choices.js) |
| `ChoiceType` (`expanded: true`, `multiple: true`) | `da-pill-checkbox` (checkboxes) | — |
| `ChoiceType` (`expanded: true`, `multiple: false`) | `da-pill-checkbox` (radios) | — |
| `CheckboxType` | `da-toggle-input` + `span.da-toggle` | — (CSS pur) |
| `RangeType` | `da-slider` | — (CSS pur) |
| `RatingType` | `input[data-rating]` | **Rating** |
| `FileDropzoneType` | `div[data-file-dropzone]` | **FileField** |
| `DateRangePickerType` | `da-input da-input--icon-left` | **DateRangePicker** (Stimulus) |
| `TextType` + `attr['data-mask']` | `da-input` | **MaskField** (IMask) |

---

## Structure minimale — FormType PHP

```php
// src/Form/Type/AlertType.php
namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class AlertType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'Nom',
                'attr'  => ['placeholder' => 'Mon alerte'],
            ])
            ->add('email', EmailType::class, [
                'label' => 'Email de contact',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Alert::class,
        ]);
    }
}
```

---

## Template Twig

```twig
{# templates/alerts/new.html.twig #}
<twig:Form :form="form" classCard="max-w-2xl">
    <twig:block name="title">Créer une alerte</twig:block>

    <twig:block name="fields">
        {{ form_row(form.name) }}
        {{ form_row(form.email) }}
    </twig:block>

    <twig:block name="label">Créer l'alerte</twig:block>
</twig:Form>
```

`form_row()` rend automatiquement label + widget + erreurs + aide dans un `div.form-group`. Aucune classe à passer manuellement grâce au form theme.

---

## Champs texte — `TextType`, `EmailType`, `PasswordType`

Rendu automatique en `da-input`. Aucune configuration supplémentaire.

```php
$builder
    ->add('firstName', TextType::class, [
        'label' => 'Prénom',
        'help'  => 'Tel qu'il apparaîtra dans les notifications.',
    ])
    ->add('email', EmailType::class, [
        'label' => 'Adresse email',
        'attr'  => ['placeholder' => 'vous@exemple.com'],
    ])
    ->add('password', PasswordType::class, [
        'label'  => 'Mot de passe',
        'mapped' => false,
    ])
;
```

### Variante avec icône

Le form theme ajoute `da-input` automatiquement. Pour ajouter une icône, wrapper l'`input` manuellement dans le template :

```twig
<div class="form-group">
    {{ form_label(form.email) }}
    <div class="da-input-wrapper">
        <i class="fa-regular fa-envelope da-input-icon da-input-icon--left" aria-hidden="true"></i>
        {{ form_widget(form.email, {attr: {class: 'da-input da-input--icon-left'}}) }}
    </div>
    {{ form_errors(form.email) }}
</div>
```

---

## Textarea — `TextareaType`

Reçoit `da-input da-textarea`. La hauteur est contrôlée par `attr.rows` ou CSS.

```php
$builder->add('description', TextareaType::class, [
    'label'    => 'Description',
    'required' => false,
    'attr'     => ['rows' => 4, 'placeholder' => 'Informations complémentaires…'],
]);
```

---

## Select déroulant — `ChoiceType` (collapsed)

Reçoit `da-select` et est automatiquement enrichi par **Selectize** (Choices.js).

```php
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

// Select simple avec placeholder
$builder->add('specialty', ChoiceType::class, [
    'label'       => 'Spécialité',
    'placeholder' => 'Choisir une spécialité…',
    'choices'     => [
        'Cardiologie'   => 'cardiology',
        'Dermatologie'  => 'dermatology',
        'Neurologie'    => 'neurology',
    ],
]);

// Select avec recherche activée
$builder->add('practitioner', ChoiceType::class, [
    'label'       => 'Praticien',
    'placeholder' => 'Rechercher un praticien…',
    'choices'     => $practitionerChoices,
    'attr'        => ['data-search' => 'true'],
]);

// Select multiple avec limite d'items
$builder->add('timeSlots', ChoiceType::class, [
    'label'    => 'Créneaux souhaités',
    'choices'  => ['Matin' => 'morning', 'Après-midi' => 'afternoon', 'Soir' => 'evening'],
    'multiple' => true,
    'expanded' => false,
    'attr'     => ['data-max-items' => '2'],
]);

// Conserver le select natif (opt-out Selectize)
$builder->add('country', ChoiceType::class, [
    'attr' => ['data-da-selectize' => 'false'],
]);
```

> Voir la documentation complète dans [`component-selectize.md`](components/component-selectize.md).

---

## Pills checkbox / radio — `ChoiceType` (expanded)

`expanded: true` génère des **pills** visuelles. `multiple: true` → checkboxes, `multiple: false` → radios.

```php
// Pills radio (choix unique)
$builder->add('consultationType', ChoiceType::class, [
    'label'    => 'Type de consultation',
    'choices'  => [
        'Cabinet'    => 'office',
        'Téléconsult' => 'teleconsult',
        'Urgences'   => 'emergency',
    ],
    'expanded' => true,
    'multiple' => false,
]);

// Pills checkboxes (choix multiples)
$builder->add('notificationChannels', ChoiceType::class, [
    'label'    => 'Canaux de notification',
    'choices'  => [
        'Email' => 'email',
        'SMS'   => 'sms',
        'Push'  => 'push',
    ],
    'expanded' => true,
    'multiple' => true,
]);
```

Les pills se mettent en `flex flex-wrap gap-2` automatiquement. La sélection est gérée en CSS pur via `:checked`.

---

## Toggle — `CheckboxType`

Rendu en `input.da-toggle-input` + `span.da-toggle`. L'état activé/désactivé est géré en CSS pur.

```php
$builder->add('acceptTerms', CheckboxType::class, [
    'label'    => 'J\'accepte les conditions d\'utilisation',
    'required' => true,
    'mapped'   => false,
]);

$builder->add('emailNotifications', CheckboxType::class, [
    'label'    => 'Recevoir les notifications par email',
    'required' => false,
]);
```

Le rendu produit :
```html
<div class="form-group">
    <div class="flex items-center gap-3">
        <label class="da-toggle-field" for="form_emailNotifications">
            <input type="checkbox" class="da-toggle-input" id="form_emailNotifications" name="…">
            <span class="da-toggle" aria-hidden="true"></span>
        </label>
        <label class="da-body font-medium cursor-pointer" for="form_emailNotifications">
            Recevoir les notifications par email
        </label>
    </div>
</div>
```

---

## Slider — `RangeType`

Rendu en `da-slider` avec remplissage progressif via `--da-slider-pct` (mise à jour `oninput`).

```php
use Symfony\Component\Form\Extension\Core\Type\RangeType;

$builder->add('radius', RangeType::class, [
    'label' => 'Rayon de recherche (km)',
    'attr'  => [
        'min'   => 1,
        'max'   => 50,
        'step'  => 1,
        'value' => 10,
    ],
]);
```

---

## Champ masqué — `TextType` + `data-mask`

Le masque est configuré via `attr['data-mask']` (objet JSON des options IMask). Activé automatiquement par **MaskFieldManager**.

```php
// Téléphone français
$builder->add('phone', TextType::class, [
    'label' => 'Téléphone',
    'attr'  => [
        'data-mask' => json_encode(['mask' => '00 00 00 00 00']),
    ],
]);

// Numérique avec séparateur décimal
$builder->add('amount', TextType::class, [
    'label' => 'Montant',
    'attr'  => [
        'data-mask' => json_encode([
            'mask'      => 'num',
            'blocks'    => ['num' => ['mask' => Number::class, 'scale' => 2]],
        ]),
    ],
]);

// Code postal
$builder->add('zipCode', TextType::class, [
    'label' => 'Code postal',
    'attr'  => ['data-mask' => json_encode(['mask' => '00000'])],
]);
```

> Voir la documentation complète dans [`component-mask.md`](components/component-mask.md).

---

## Rating — `RatingType`

Type Symfony custom. Rendu en `input[data-rating]`, enrichi automatiquement par **RatingManager**.

```php
use App\Form\Type\RatingType;

$builder->add('satisfaction', RatingType::class, [
    'label'           => 'Satisfaction',
    'number'          => 5,
    'show_score'      => true,
    'rating_readonly' => false,
]);
```

> Voir la documentation complète dans [`component-rating.md`](components/component-rating.md).

---

## File Dropzone — `FileDropzoneType`

Type Symfony custom. Rendu en `div[data-file-dropzone]`, géré par **FileFieldManager**.

```php
use App\Form\Type\FileDropzoneType;

$builder->add('attachment', FileDropzoneType::class, [
    'label'    => 'Pièce jointe',
    'required' => false,
    'multiple' => false,
    'limit'    => 1,
]);

// Multi-fichiers avec limite
$builder->add('documents', FileDropzoneType::class, [
    'label'    => 'Documents',
    'multiple' => true,
    'limit'    => 5,
    'constraints' => [
        new File(mimeTypes: ['application/pdf', 'image/jpeg', 'image/png']),
    ],
]);
```

> Voir la documentation complète dans [`component-file-dropzone.md`](components/component-file-dropzone.md).

---

## Date / Plage de dates — `DateRangePickerType`

Type Symfony custom. Géré par le contrôleur Stimulus `components/twig/form-field-datepicker`.

```php
use App\Form\Type\DateRangePickerType;

// Date unique
$builder->add('birthDate', DateRangePickerType::class, [
    'label'       => 'Date de naissance',
    'single_date' => true,
    'format'      => 'DD/MM/YYYY',
]);

// Plage de dates avec limites
$builder->add('period', DateRangePickerType::class, [
    'label'    => 'Période de surveillance',
    'opens'    => 'left',
    'min_date' => (new \DateTime())->format('Y-m-d'),
]);
```

> Voir la documentation complète dans [`component-datepicker.md`](components/component-datepicker.md).

---

## Champ conditionnel — `ConditionalField`

Le module JS `ConditionalField` permet d'afficher ou masquer un champ en fonction de la valeur d'un autre. Il ne dépend d'aucun FormType spécifique — il s'applique à n'importe quel wrapper de champ.

```twig
{# Dans le template, après le rendu des champs #}
<script type="module">
import { ConditionalField } from '/assets/js/modules/form-fields/condition/condition-field.js';

const typeField  = document.querySelector('#alert_type');
const notesGroup = document.querySelector('#alert_notes').closest('.form-group');

new ConditionalField(notesGroup, {
    fieldsTracked:    ['#alert_type'],
    resetValueOnShow: true,
    handle: (instance, field, values) => {
        return values['#alert_type'] === 'custom';
    },
});
</script>
```

### Options de `ConditionalField`

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `fieldsTracked` | `string[]` | `[]` | Sélecteurs (`#id` ou `name`) des champs observés |
| `handle` | `Function` | `() => {}` | Retourne `true` (afficher) ou `false` (masquer) |
| `resetValueOnShow` | `boolean` | `false` | Remet la valeur par défaut du champ à l'affichage |
| `requiredOnShow` | `boolean` | auto | Rend le champ `required` quand il est visible |

Le champ ciblé est l'élément passé en premier argument. Si c'est un `div.form-group`, tous les `input/select/textarea` qu'il contient sont contrôlés. Si c'est un `input` directement, seul cet input est géré.

---

## Template complet — exemple réel

```php
// src/Form/Type/AlertCreateType.php
$builder
    ->add('practitioner', ChoiceType::class, [
        'label'       => 'Praticien',
        'placeholder' => 'Rechercher…',
        'choices'     => $practitionerChoices,
        'attr'        => ['data-search' => 'true'],
    ])
    ->add('consultationType', ChoiceType::class, [
        'label'    => 'Type',
        'choices'  => ['Cabinet' => 'office', 'Téléconsult' => 'teleconsult'],
        'expanded' => true,
        'multiple' => false,
    ])
    ->add('timeSlots', ChoiceType::class, [
        'label'    => 'Créneaux',
        'choices'  => ['Matin' => 'morning', 'Après-midi' => 'afternoon'],
        'expanded' => true,
        'multiple' => true,
    ])
    ->add('email', EmailType::class, ['label' => 'Email de notification'])
    ->add('phone', TextType::class, [
        'label'    => 'Téléphone (optionnel)',
        'required' => false,
        'attr'     => ['data-mask' => json_encode(['mask' => '00 00 00 00 00'])],
    ])
    ->add('emailNotifications', CheckboxType::class, [
        'label'    => 'Activer les notifications email',
        'required' => false,
    ])
;
```

```twig
{# templates/alerts/new.html.twig #}
<twig:Form :form="form" classCard="max-w-2xl">
    <twig:block name="title">
        <i class="fa-solid fa-bell mr-2 text-azur-600"></i>
        Créer une alerte
    </twig:block>

    <twig:block name="fields">
        {{ form_row(form.practitioner) }}

        <div class="grid grid-cols-2 gap-4">
            {{ form_row(form.consultationType) }}
            {{ form_row(form.timeSlots) }}
        </div>

        {{ form_row(form.email) }}
        {{ form_row(form.phone) }}
        {{ form_row(form.emailNotifications) }}
    </twig:block>

    <twig:block name="controls">
        <a href="{{ path('app_alerts_index') }}" class="da-btn da-btn-ghost da-btn-lg">
            Annuler
        </a>
        <button type="submit" class="da-btn da-btn-primary da-btn-lg">
            <i class="fa-solid fa-bell mr-1"></i>
            Créer l'alerte
        </button>
    </twig:block>
</twig:Form>
```

---

## Erreurs et aide

Le form theme gère automatiquement :
- Les erreurs de validation → `p.da-field-error` avec icône `fa-circle-exclamation`
- La classe `da-input--error` / `da-select--error` sur le widget en erreur
- Le texte d'aide (`help`) → `p.da-field-help`

```php
$builder->add('email', EmailType::class, [
    'label' => 'Email',
    'help'  => 'Utilisé uniquement pour les notifications de disponibilité.',
    'constraints' => [new NotBlank(), new Email()],
]);
```

---

## Notes

- **`form_row` vs manuel** : préférer `form_row()` — il applique le form theme complet. N'utiliser `form_label()` + `form_widget()` + `form_errors()` séparément que pour des mises en page personnalisées.
- **`form_rest()`** : le composant `<twig:Form>` appelle `form_rest()` automatiquement pour rendre les champs cachés résiduels (CSRF token, champs `mapped: false` non rendus).
- **Contrôleur Stimulus** : le `data-controller="components--forms--form"` est posé par le composant `<twig:Form>`. Sans lui, Selectize, MaskField, Rating et FileField ne s'initialisent pas. Pour un formulaire sans `<twig:Form>`, l'ajouter manuellement : `{{ stimulus_controller('components/forms/form') }}`.
- **Opt-out Selectize** : `attr['data-da-selectize'] = 'false'` pour conserver le `<select>` natif sur un champ précis.
