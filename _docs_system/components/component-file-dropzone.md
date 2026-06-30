# Module JS — FileField / FileDropzoneType

Zone de dépôt de fichiers (drag & drop) avec prévisualisation par icônes MIME. Remplace un `<input type="file">` classique par une interface visuelle : glisser-déposer, parcourir, liste de fichiers sélectionnés, validation du type MIME, suppression individuelle.

L'initialisation est automatique via le contrôleur Stimulus `components/forms/form` — aucune configuration JavaScript n'est requise avec `FileDropzoneType`.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Classe principale | `assets/js/modules/form-fields/file/file-field.js` |
| Icônes MIME | `assets/js/modules/form-fields/file/mime-icons.js` |
| Auto-initialiseur | `assets/js/modules/form-fields/file/file-field-manager.js` |
| CSS | `assets/js/modules/form-fields/file/file-field.css` |
| Classe de base | `assets/js/modules/form-fields/abstract/abstract-field.js` |
| Contrôleur Stimulus | `assets/controllers/components/forms/form_controller.js` |
| FormType Symfony | `src/Form/Type/FileDropzoneType.php` |
| Extension Symfony | `src/Form/Extension/FileAcceptExtension.php` |
| Bloc form theme | `templates/form/da_form_theme.html.twig` → `file_dropzone_widget` |
| Dépendance | `mime` (^4.1) |

---

## Initialisation automatique

`FileFieldManager` est instancié dans `initialize()` du contrôleur Stimulus `components/forms/form`. Tous les éléments `[data-file-dropzone]` de la page sont initialisés automatiquement.

```twig
{# Suffit à déclencher l'initialisation de tous les [data-file-dropzone] de la page #}
<form {{ stimulus_controller('components/forms/form') }}>
    …
</form>
```

Chaque élément initialisé expose son instance via `el._fileField`. La double initialisation est protégée (`if (!el._fileField)`).

---

## Variantes — `data-*` sur le wrapper

| Attribut | Valeur | Effet |
|----------|--------|-------|
| `data-file-dropzone` | _(attribut vide)_ | Déclenche l'initialisation par `FileFieldManager` |
| `data-name` | `string` | Nom HTML des inputs fichiers créés dynamiquement (ex : `form[photo]`) |
| `data-accept` | `string` | Types MIME acceptés, séparés par des virgules (ex : `image/jpeg,image/png`) |
| `data-multiple` | `"multiple"` | Autorise plusieurs fichiers |
| `data-limit` | entier | Nombre maximum de fichiers (défaut : 1, ou 5 si `data-multiple="multiple"`) |

---

## Exemples HTML

### Fichier unique (image)

```html
<div class="file-dropzone"
     data-file-dropzone
     data-name="form[photo]"
     data-accept="image/jpeg,image/png,image/webp"
     data-limit="1">
</div>
```

### Plusieurs fichiers (PDF ou Word)

```html
<div class="file-dropzone"
     data-file-dropzone
     data-name="form[documents][]"
     data-accept="application/pdf,application/msword"
     data-multiple="multiple"
     data-limit="5">
</div>
```

### Sans restriction de type

```html
<div class="file-dropzone"
     data-file-dropzone
     data-name="form[fichier]"
     data-limit="1">
</div>
```

---

## Utilisation — Symfony FormType

`FileDropzoneType` hérite de `FileType`. La valeur reçue par Symfony est un `UploadedFile` (ou `UploadedFile[]` si `multiple`).

Les types MIME acceptés sont injectés automatiquement via `FileAcceptExtension` depuis la contrainte `File` ou `Image` — aucune configuration manuelle de `data-accept` n'est nécessaire.

### Déclaration dans un FormType PHP

```php
use App\Form\Type\FileDropzoneType;
use Symfony\Component\Validator\Constraints\File;

// Fichier unique avec validation de type
$builder->add('photo', FileDropzoneType::class, [
    'label'       => 'Photo de profil',
    'required'    => false,
    'constraints' => [
        new File([
            'maxSize'   => '2M',
            'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
        ]),
    ],
]);

// Plusieurs fichiers (jusqu'à 3 PDF)
$builder->add('documents', FileDropzoneType::class, [
    'label'    => 'Pièces justificatives',
    'multiple' => true,
    'limit'    => 3,
    'constraints' => [
        new File(['mimeTypes' => ['application/pdf']]),
    ],
]);

// N'importe quel fichier, sans limite de type
$builder->add('fichier', FileDropzoneType::class, [
    'label'    => 'Fichier joint',
    'required' => false,
]);
```

### Options disponibles (`FileDropzoneType`)

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `multiple` | `bool` | `false` | Autorise plusieurs fichiers |
| `limit` | `int\|null` | `null` | Nombre max de fichiers — `null` = 1 si `!multiple`, 5 si `multiple` |

> Les options standard de `FileType` (`label`, `help`, `required`, `disabled`, `attr`, `constraints`…) sont toutes supportées.
> Les types MIME acceptés (`data-accept`) sont déduits automatiquement de la contrainte `File` via `FileAcceptExtension`.

### Gestion de l'UploadedFile dans le contrôleur

```php
use Symfony\Component\HttpFoundation\File\UploadedFile;

// Fichier unique
/** @var UploadedFile|null $file */
$file = $form->get('photo')->getData();

if ($file instanceof UploadedFile) {
    $filename = uniqid() . 'type-info-extras' . $file->guessExtension();
    $file->move($this->getParameter('uploads_dir'), $filename);
}

// Plusieurs fichiers
/** @var UploadedFile[] $files */
$files = $form->get('documents')->getData();

foreach ($files as $file) {
    if ($file instanceof UploadedFile) {
        $file->move($this->getParameter('uploads_dir'), uniqid() . 'type-info-extras' . $file->guessExtension());
    }
}
```

---

## API JavaScript

L'instance est accessible via `el._fileField` (élément DOM) ou en instanciant la classe directement.

```js
import { FileField } from 'assets/js/modules/form-fields/file/file-field';

const dropzone = new FileField(document.querySelector('[data-file-dropzone]'), {
    limit:  3,
    accept: 'image/jpeg,image/png',
    name:   'form[photo]',
});

// ou via le manager automatique :
const dropzone = document.querySelector('[data-file-dropzone]')._fileField;
```

### Options du constructeur

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `limit` | `int` | `1` (ou `5` si `data-multiple`) | Nombre max de fichiers |
| `accept` | `string` | `''` | MIME types acceptés, séparés par virgules |
| `name` | `string` | `''` | `name` des inputs fichiers créés dynamiquement |

> En usage automatique (via `FileFieldManager`), les options sont lues depuis `data-limit`, `data-accept`, `data-name` sur l'élément.

---

## Icônes MIME (`MimeIcons`)

`MimeIcons` mappe les types MIME sur des classes FontAwesome. Utilisé automatiquement dans la liste de fichiers.

| Type | Icône FA |
|------|----------|
| `image/*` | `fa-regular fa-file-image` |
| `audio/*` | `fa-regular fa-file-audio` |
| `video/*` | `fa-regular fa-file-video` |
| `application/pdf` | `fa-regular fa-file-pdf` |
| `application/msword` / `…wordprocessingml` | `fa-regular fa-file-word` |
| `application/vnd.ms-excel` / `…spreadsheetml` | `fa-regular fa-file-excel` |
| `application/vnd.ms-powerpoint` / `…presentationml` | `fa-regular fa-file-powerpoint` |
| `text/plain` | `fa-regular fa-file-alt` |
| `text/html` / `application/json` | `fa-regular fa-file-code` |
| `application/gzip` / `application/zip` | `fa-regular fa-file-archive` |
| _(autres)_ | `fa-regular fa-file-o` |

---

## Traductions

Les textes sont gérés via le `Translator` JS (domaine `file-field`). La langue est résolue automatiquement depuis `document.documentElement.lang`.

| Clé | FR | EN |
|-----|----|----|
| `Drag & Drop` | Glisser & Déposer | Drag & Drop |
| `or` | ou | or |
| `browse` | Cliquer pour rechercher | Click for browse |
| `Files accepted` | Fichiers acceptés | Files accepted |
| `File rejected` | Fichier refusé | File rejected |
| `Limit of files reached` | Limite de fichiers atteinte | Limit of files reached |

---

## Classes CSS de référence

| Classe | Rôle |
|--------|------|
| `.file-dropzone` | Conteneur principal — bordure pointillée, flex colonne |
| `.file-dropzone.dragover` | Survol actif — bordure brand (`--da-brand`), 2px |
| `.file-dropzone .header` | Zone d'invite (icône + textes) — centrée, min-height 150px |
| `.file-dropzone .header .icon::before` | Icône fichier FontAwesome (`\f15b`) |
| `.file-dropzone .header .placeholder` | Textes d'invitation (couleur muted) |
| `.file-dropzone .header .support` | Types acceptés (gras, couleur muted) |
| `.file-dropzone .list-files` | Liste `<ul>` des fichiers sélectionnés |
| `.file-dropzone .list-files .file-item` | Ligne fichier — flex, gap 10px |
| `.file-dropzone .list-files .file-item .remove` | Bouton suppression (rouge, sans bordure) |
| `.file-dropzone .errors` | Zone d'erreurs — flex colonne, centrée |
| `.file-dropzone .errors .error` | Message d'erreur individuel (rouge, gras) |
