# Composants Twig — `<twig:Tab>` + `<twig:TabContent>`

Système d'onglets piloté par le module JS `TabManager`.
`<twig:Tab>` pose la barre de navigation ; `<twig:TabContent>` enveloppe chaque panneau de contenu.
Les deux composants sont toujours utilisés ensemble : les `id` des onglets doivent correspondre entre la prop `tabs` et les composants `TabContent`.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Composant PHP Tab | `src/Twig/Components/TabComponent.php` |
| Composant PHP TabContent | `src/Twig/Components/TabContentComponent.php` |
| Template Tab | `templates/components/tab.html.twig` |
| Template TabContent | `templates/components/tab_content.html.twig` |
| Contrôleur Stimulus | `assets/controllers/components/twig/tab_controller.js` |
| Module JS | `assets/js/modules/tab/tab.js` |
| CSS module | `assets/js/modules/tab/tab.css` |
| CSS composant | `assets/styles/components/twig/tab.css` |

---

## Props — `<twig:Tab>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `string` | `''` | Identifiant HTML du wrapper — optionnel, utile pour cibler depuis l'extérieur |
| `tabs` | `array` | `[]` | Tableau d'onglets — chaque entrée est `{id: string, label: string, icon?: string}` |
| `activeTab` | `string` | premier onglet | `id` de l'onglet actif au chargement — défaut : premier élément de `tabs` |

### Structure d'un onglet (`tabs`)

| Clé | Type | Requis | Description |
|-----|------|--------|-------------|
| `id` | `string` | oui | Identifiant unique — doit correspondre à l'`id` du `TabContent` associé |
| `label` | `string` | oui | Texte affiché dans la barre de navigation |
| `icon` | `string` | non | Classe FontAwesome (ex : `fa-gear`) — affichée à gauche du label |

---

## Props — `<twig:TabContent>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `string` | — | Identifiant HTML du panneau — **doit correspondre** à un `id` déclaré dans `tabs` du `<twig:Tab>` parent |

---

## Bloc Twig

| Composant | Bloc | Description |
|-----------|------|-------------|
| `<twig:Tab>` | `content` | Zone de contenu — y placer les `<twig:TabContent>` |
| `<twig:TabContent>` | `content` | Contenu du panneau — tout HTML est accepté |

---

## Comportement

- Au montage Stimulus, `TabManager` masque tous les panneaux (`display: none`) sauf celui dont le bouton porte la classe `active`.
- Au clic sur un onglet : l'onglet précédent est masqué et dés-activé, le nouvel onglet est affiché et marqué `active`.
- L'onglet actif par défaut est déterminé par `activeTab` — si absent, le premier onglet est sélectionné automatiquement.
- Les attributs ARIA (`role="tab"`, `aria-selected`, `tabindex`) sont posés par le template pour l'accessibilité.

---

## Exemples d'utilisation

### Minimal — deux onglets

```twig
<twig:Tab :tabs="[
    {id: 'tab-infos',  label: 'Informations'},
    {id: 'tab-config', label: 'Configuration'},
]" activeTab="tab-infos">
    <twig:TabContent id="tab-infos">
        <p>Contenu de l'onglet Informations.</p>
    </twig:TabContent>
    <twig:TabContent id="tab-config">
        <p>Contenu de l'onglet Configuration.</p>
    </twig:TabContent>
</twig:Tab>
```

### Avec icônes

```twig
<twig:Tab :tabs="[
    {id: 'tab-info',    label: 'Informations',  icon: 'fa-circle-info'},
    {id: 'tab-config',  label: 'Configuration', icon: 'fa-gear'},
    {id: 'tab-history', label: 'Historique',    icon: 'fa-clock-rotate-left'},
]" activeTab="tab-info">
    <twig:TabContent id="tab-info">
        <p>Détails du médecin.</p>
    </twig:TabContent>
    <twig:TabContent id="tab-config">
        <p>Paramètres de surveillance.</p>
    </twig:TabContent>
    <twig:TabContent id="tab-history">
        <p>Journal des événements.</p>
    </twig:TabContent>
</twig:Tab>
```

### Avec identifiant HTML (pour cibler depuis JS)

```twig
<twig:Tab
    id="tabs-medecin"
    :tabs="[
        {id: 'tab-profil',  label: 'Profil'},
        {id: 'tab-alertes', label: 'Alertes'},
    ]"
    activeTab="tab-profil"
>
    <twig:TabContent id="tab-profil">
        {{ include('partials/_profil.html.twig') }}
    </twig:TabContent>
    <twig:TabContent id="tab-alertes">
        {{ include('partials/_alertes.html.twig') }}
    </twig:TabContent>
</twig:Tab>
```

### Onglet actif déterminé dynamiquement (depuis le contrôleur)

```twig
{# Dans le contrôleur PHP : #}
{# return $this->render('...', ['activeTab' => 'tab-alertes']); #}

<twig:Tab
    :tabs="[
        {id: 'tab-profil',  label: 'Profil'},
        {id: 'tab-alertes', label: 'Alertes'},
    ]"
    activeTab="{{ activeTab }}"
>
    <twig:TabContent id="tab-profil">
       ...
    </twig:TabContent>
    <twig:TabContent id="tab-alertes">
        ...
    </twig:TabContent>
</twig:Tab>
```

### Contenu riche avec formulaire dans un panneau

```twig
<twig:Tab :tabs="[
    {id: 'tab-form',    label: 'Formulaire', icon: 'fa-pen'},
    {id: 'tab-preview', label: 'Aperçu',     icon: 'fa-eye'},
]" activeTab="tab-form">
    <twig:TabContent id="tab-form">
        {{ form_start(form) }}
        {{ form_widget(form) }}
        <button type="submit" class="da-btn da-btn-primary">Enregistrer</button>
        {{ form_end(form) }}
    </twig:TabContent>
    <twig:TabContent id="tab-preview">
        <p class="da-body">Aperçu des données saisies.</p>
    </twig:TabContent>
</twig:Tab>
```

---

## Activer un onglet depuis JavaScript

```js
// Simuler un clic sur le bouton de navigation de l'onglet cible
const btn = document.querySelector('[data-tab-target="tab-alertes"]');
btn?.click();
```

---

## Classes CSS de référence

| Classe | Rôle |
|--------|------|
| `.da-tab__nav` | Barre de navigation horizontale (flex, scroll horizontal) |
| `.da-tab__item` | Bouton d'onglet individuel |
| `.da-tab__item.active` | État actif — bordure inférieure colorée (`--da-brand`) |
| `.da-tab__panel` | Panneau de contenu d'un onglet |
| `.tab` | Marqueur JS utilisé par `TabManager` pour détecter la barre de navigation |
| `.tab-content` | Marqueur JS utilisé par `TabManager` pour détecter les panneaux |

> `.tab` et `.tab-content` sont des sélecteurs internes de `TabManager` — ne pas les retirer.

---

## Règle de correspondance des `id`

L'attribut `data-tab-target` du bouton et l'`id` du `TabContent` doivent être **identiques**.

```
tabs prop       → [{id: 'tab-stats', label: 'Statistiques'}]
                        ↓
data-tab-target → "tab-stats"
                        ↓
TabContent id   → "tab-stats"      ← même valeur obligatoire
```

Un `id` manquant ou non correspondant empêche le panneau de s'afficher.
