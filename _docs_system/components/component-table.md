# Composant Twig — `<twig:Table>`

Tableau DataTables alimenté soit par des données rendues côté serveur (SSR), soit par un
appel AJAX. Gère automatiquement le tri, la pagination, l'export XLSX, la copie presse-papiers,
le mode responsive et la localisation fr/en.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Composant PHP | `src/Twig/Components/TableComponent.php` |
| Template Twig | `templates/components/table.html.twig` |
| Contrôleur Stimulus | `assets/controllers/components/twig/table_controller.js` |
| Module JS | `assets/js/modules/table/table.js` |
| Modèle de données | `src/Model/TableView/TableViewModel.php` |
| Modèle de ligne | `src/Model/TableView/TableViewRowModel.php` |

---

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `data` | `TableViewModel\|null` | `null` | Données SSR — exclusif avec `url` |
| `url` | `string` | `''` | URL AJAX pour charger les données JSON |
| `id` | `string` | `''` | Attribut `id` HTML du tableau |
| `class` | `string` | `''` | Classes CSS additionnelles sur `<table>` |
| `title` | `string` | `''` | Titre affiché dans le bouton "Copier" DataTables |
| `newUrl` | `string` | `''` | URL du bouton "Ajouter" dans la barre de contrôle |
| `newTitle` | `string` | `''` | Libellé du bouton "Ajouter" |
| `header` | `bool` | `true` | Afficher les contrôles en-tête (filtre, boutons) |
| `footer` | `bool` | `true` | Afficher les contrôles pied (pagination, info) |
| `responsive` | `bool` | `true` | Mode responsive DataTables — `false` active le scroll horizontal |

---

## Événements Stimulus

| Événement | Détail | Description |
|-----------|--------|-------------|
| `components--twig--table:load` | `{ table }` | Émis après le chargement initial des données |

## Actions Stimulus exposées

```html
<button data-action="components--twig--table#refresh"
        data-components--twig--table-outlet="#mon-tableau">
    Rafraîchir
</button>
```

---

## API — `TableViewModel`

### `addColumn(fieldName, label, class, type, order, width, tooltip, responsivePriority)`

Ajoute une colonne au tableau.

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `fieldName` | `string` | — | Clé de champ (doit correspondre à `addField`) |
| `label` | `string` | — | En-tête de colonne |
| `class` | `string` | `''` | Classes CSS sur `<th>` et `<td>` |
| `type` | `string` | `COLUMN_TYPE_TEXT` | `numeric` · `html` · `date` |
| `order` | `string\|null` | `null` | Tri initial : `asc` · `desc` |
| `width` | `string\|null` | `null` | Largeur CSS (ex : `'120px'`) |
| `tooltip` | `string\|null` | `null` | Info-bulle sur l'en-tête |
| `responsivePriority` | `int\|null` | `null` | Priorité d'affichage responsive DataTables |

**Constantes de type :**
- `TableViewModel::COLUMN_TYPE_NUMERIC` → `"numeric"`
- `TableViewModel::COLUMN_TYPE_TEXT` → `"html"`
- `TableViewModel::COLUMN_TYPE_DATE` → `"date"`

**Constantes d'ordre :**
- `TableViewModel::COLUMN_ORDER_ASC` → `"asc"`
- `TableViewModel::COLUMN_ORDER_DESC` → `"desc"`

### Autres méthodes

```php
$table->addRow(TableViewRowModel $row): self
$table->addRows(array $rows): self
$table->setActiveModeResponsive(bool): self  // ajoute la colonne col-responsive
$table->setShowColumnActions(bool): self
$table->sortColumnsPerFieldnames(array $order): self
$table->setTranslator(TranslatorInterface, string $domain): self
$table->toArray(): array  // sérialisation JSON pour la route AJAX
```

---

## API — `TableViewRowModel`

### `addField(fieldName, label, value?, class?)`

| Paramètre | Type | Description |
|-----------|------|-------------|
| `fieldName` | `string` | Doit correspondre à un `addColumn()` |
| `label` | `string\|int\|float` | Valeur affichée (peut contenir du HTML) |
| `value` | `string\|int\|float\|null` | Valeur brute pour le tri — si `null`, utilise `label` |
| `class` | `string` | Classe CSS dynamique appliquée à `<td>` |

### `addAction(url, icon, label?, confirmAction?, isConfirmRemove?, class?)`

Ajoute un lien d'action dans la colonne `__ACTIONS` (créée automatiquement).

| Paramètre | Type | Description |
|-----------|------|-------------|
| `url` | `string` | Href du lien |
| `icon` | `string` | Classe FontAwesome (ex : `fas fa-pencil`) |
| `label` | `string` | Texte optionnel à côté de l'icône |
| `confirmAction` | `string` | Message de confirmation |
| `isConfirmRemove` | `bool` | `true` → style danger sur la confirmation |
| `class` | `string` | Classe CSS sur la cellule d'actions |

### `setHref(url)`

Rend toute la ligne cliquable (navigation vers `url`).

---

## Mode SSR

Les données sont pré-rendues dans le HTML. Idéal pour les petits jeux de données ou quand
le SEO / le rendu initial est important.

### 1 — Contrôleur

```php
use App\Model\TableView\TableViewModel;
use App\Model\TableView\TableViewRowModel;

$table = new TableViewModel();
$table->setActiveModeResponsive(true);

$table->addColumn('id',     'ID',        'w-12',          TableViewModel::COLUMN_TYPE_NUMERIC, TableViewModel::COLUMN_ORDER_ASC);
$table->addColumn('name',   'Praticien', 'font-semibold', TableViewModel::COLUMN_TYPE_TEXT);
$table->addColumn('status', 'Statut',    '');
$table->addColumn('date',   'Date',      '',              TableViewModel::COLUMN_TYPE_DATE, TableViewModel::COLUMN_ORDER_DESC);

foreach ($practitioners as $p) {
    $row = new TableViewRowModel();
    $row->addField('id',     (string) $p->getId(),   $p->getId());
    $row->addField('name',   $p->getFullName());
    $row->addField('status', $this->renderStatus($p->getStatus()),  $p->getStatus());
    $row->addField('date',   $p->getCreatedAt()->format('Y-m-d'),   $p->getCreatedAt()->getTimestamp());
    $table->addRow($row);
}

return $this->render('admin/practitioners/index.html.twig', [
    'tableData' => $table,
]);
```

### 2 — Template

```twig
<twig:Table
    :data="tableData"
    title="Praticiens"
    newUrl="{{ path('app_admin_practitioners_new') }}"
    newTitle="Ajouter un praticien"
/>
```

---

## Mode AJAX

Le tableau est rendu vide ; les données sont chargées en JavaScript via un appel JSON.
Idéal pour les grandes volumétries ou les tableaux rafraîchissables.

### 1 — Route de données (JSON)

```php
#[Route('/admin/practitioners/data', name: 'app_admin_practitioners_data', methods: 'GET')]
public function data(): JsonResponse
{
    $table = new TableViewModel();
    $table->setActiveModeResponsive(true);
    $table->addColumn('id',     'ID',        'w-12',          TableViewModel::COLUMN_TYPE_NUMERIC, TableViewModel::COLUMN_ORDER_ASC);
    $table->addColumn('name',   'Praticien', 'font-semibold', TableViewModel::COLUMN_TYPE_TEXT);
    $table->addColumn('status', 'Statut',    '');
    $table->addColumn('date',   'Date',      '',              TableViewModel::COLUMN_TYPE_DATE, TableViewModel::COLUMN_ORDER_DESC);

    foreach ($this->repository->findAll() as $p) {
        $row = new TableViewRowModel();
        $row->addField('id',     (string) $p->getId(),  $p->getId());
        $row->addField('name',   $p->getFullName());
        $row->addField('status', $p->getStatus());
        $row->addField('date',   $p->getCreatedAt()->format('Y-m-d'), $p->getCreatedAt()->getTimestamp());
        $table->addRow($row);
    }

    return $this->json($table->toArray());
}
```

### 2 — Template

```twig
<twig:Table
    url="{{ path('app_admin_practitioners_data') }}"
    title="Praticiens"
    newUrl="{{ path('app_admin_practitioners_new') }}"
    newTitle="Ajouter un praticien"
/>
```

---

## Lignes cliquables

```php
$row->setHref($this->generateUrl('app_admin_practitioners_show', ['id' => $p->getId()]));
```

La ligne entière devient cliquable. La classe `table-row-clickable` est ajoutée automatiquement
sur `<table>` pour le curseur pointer.

---

## Actions par ligne

```php
$row->addField('name', $p->getFullName());

$row->addAction(
    $this->generateUrl('app_admin_practitioners_edit', ['id' => $p->getId()]),
    'fas fa-pencil',
    'Modifier'
);
$row->addAction(
    $this->generateUrl('app_admin_practitioners_delete', ['id' => $p->getId()]),
    'fas fa-trash',
    'Supprimer',
    'Confirmer la suppression ?',
    true  // isConfirmRemove → style danger
);
```

---

## Rafraîchissement depuis l'extérieur

```twig
<twig:Table
    id="table-practitioners"
    url="{{ path('app_admin_practitioners_data') }}"
/>

<button
    data-action="components--twig--table#refresh"
    data-components--twig--table-outlet="#table-practitioners">
    Rafraîchir
</button>
```

---

## Écouter l'événement de chargement

```js
document.querySelector('#table-practitioners')
    .addEventListener('components--twig--table:load', (e) => {
        const dtInstance = e.detail.table; // instance Table JS
        console.log('Tableau chargé', dtInstance);
    });
```

---

## Options avancées

### Sans contrôles (tableau minimaliste)

```twig
<twig:Table
    :data="tableData"
    :header="false"
    :footer="false"
/>
```

### Scroll horizontal au lieu du responsive

```twig
<twig:Table
    url="{{ path('app_api_data') }}"
    :responsive="false"
/>
```

### Avec traduction

```php
$table->setTranslator($translator, 'admin');
// Les labels des colonnes et tooltips passent automatiquement par le translator
```
