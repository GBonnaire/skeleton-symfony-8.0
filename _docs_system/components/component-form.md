# Composant Twig — `<twig:Form>`

Mise en page carte centrée pour les formulaires Symfony, avec sidebar optionnelle sticky,
gestion automatique de `form_start` / `form_end`, et zone de boutons flexible.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Composant PHP | `src/Twig/Components/FormComponent.php` |
| Template Twig | `templates/components/form.html.twig` |
| Contrôleur Stimulus | `assets/controllers/components/twig/form_controller.js` |
| CSS (chargé à la demande) | `assets/styles/components/twig/form.css` |

---

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `form` | `FormView\|null` | `null` | FormView Symfony — optionnel, gère `form_start`/`form_end` automatiquement |
| `classCard` | `string` | `''` | Classes CSS additionnelles sur la colonne principale (ex : `max-w-md mx-auto`) |
| `submitClass` | `string` | `da-btn da-btn-primary da-btn-lg w-full` | Classes CSS du bouton submit par défaut |

---

## Blocs Twig

| Bloc | Requis | Description |
|------|--------|-------------|
| `title` | non | Contenu du `<h2>` en en-tête de carte |
| `subtitle` | non | Paragraphe affiché sous le titre |
| `header` | non | Contenu avant les champs (alertes, messages d'intro) |
| `fields` | oui | Champs du formulaire — `form_start`/`form_end` gérés par le composant |
| `label` | non | Libellé du bouton submit (défaut : `Envoyer`) — ignoré si `controls` est défini |
| `controls` | non | Remplace **entièrement** la zone de boutons — `label` ignoré si défini |
| `footer` | non | Contenu après le formulaire (liens, notes de bas de page) |
| `sidebar` | non | Colonne latérale optionnelle — visible uniquement si non vide |

> **Priorité `controls` / `label`** : si le bloc `controls` est défini, il remplace le bouton
> submit par défaut et le bloc `label` n'est pas rendu.

---

## Structure du rendu

```
container (mx-auto)
└── flex row (col sur mobile, row sur lg)
    ├── colonne principale  (flex-1, classCard)
    │   └── card
    │       ├── header  [si titre non vide]
    │       │   ├── <h2> [titre]
    │       │   └── [sous-titre]
    │       └── section
    │           ├── [bloc header]
    │           ├── form_start  [si form fourni]
    │           ├── [bloc fields]
    │           ├── form_rest   [si form fourni]
    │           ├── .controls
    │           │   └── [bloc controls → défaut : bouton submit + bloc label]
    │           ├── form_end    [si form fourni]
    │           └── [bloc footer]
    └── sidebar  [si bloc sidebar non vide]
        └── lg:sticky lg:top-4, w-80
```

---

## Exemples d'utilisation

### Formulaire Symfony minimal

```twig
{# src/Controller/Admin/PractitionerController.php #}
return $this->render('admin/practitioners/new.html.twig', [
    'form' => $form->createView(),
]);
```

```twig
{# templates/admin/practitioners/new.html.twig #}
<twig:Form :form="form" classCard="max-w-2xl">
    <twig:block name="title">
        <i class="fa-solid fa-user-doctor mr-2 text-azur-600"></i>
        Ajouter un praticien
    </twig:block>

    <twig:block name="fields">
        <div class="form-group">
            {{ form_label(form.lastName,  null, {label_attr: {class: 'da-label'}}) }}
            {{ form_widget(form.lastName, {attr: {class: 'da-input'}}) }}
            {{ form_errors(form.lastName) }}
        </div>
        <div class="form-group">
            {{ form_label(form.specialty, null, {label_attr: {class: 'da-label'}}) }}
            {{ form_widget(form.specialty, {attr: {class: 'da-select'}}) }}
            {{ form_errors(form.specialty) }}
        </div>
    </twig:block>
</twig:Form>
```

---

### Libellé du bouton personnalisé

```twig
<twig:Form :form="form">
    <twig:block name="title">Créer une alerte</twig:block>

    <twig:block name="fields">
        {# … champs … #}
    </twig:block>

    <twig:block name="label">
        <i class="fa-solid fa-bell mr-2"></i>
        Activer la surveillance
    </twig:block>
</twig:Form>
```

---

### Zone de boutons entièrement remplacée (`controls`)

```twig
<twig:Form :form="form" classCard="max-w-xl">
    <twig:block name="title">Modifier le praticien</twig:block>

    <twig:block name="fields">
        {# … champs … #}
    </twig:block>

    <twig:block name="controls">
        <a href="{{ path('app_admin_practitioners_index') }}"
           class="da-btn da-btn-ghost da-btn-lg">
            Annuler
        </a>
        <button type="submit" class="da-btn da-btn-primary da-btn-lg">
            <i class="fa-solid fa-floppy-disk mr-2"></i>
            Enregistrer
        </button>
    </twig:block>
</twig:Form>
```

---

### Bloc `header` — alerte ou message d'introduction

```twig
<twig:Form :form="form">
    <twig:block name="title">Renouveler l'alerte</twig:block>

    <twig:block name="header">
        <div class="bg-warning-50 border border-warning-500/20 text-warning-700 px-4 py-3 mb-6 rounded">
            <div class="flex items-start gap-2">
                <i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
                <p class="da-body">Cette alerte expire dans 2 jours.</p>
            </div>
        </div>
    </twig:block>

    <twig:block name="fields">
        {# … #}
    </twig:block>
</twig:Form>
```

---

### Bloc `footer` — liens secondaires

```twig
<twig:Form :form="form" classCard="max-w-md mx-auto mt-12">
    <twig:block name="title">Connexion</twig:block>

    <twig:block name="fields">
        <div class="form-group">
            {{ form_widget(form.email,    {attr: {class: 'da-input'}}) }}
        </div>
        <div class="form-group">
            {{ form_widget(form.password, {attr: {class: 'da-input'}}) }}
        </div>
    </twig:block>

    <twig:block name="label">Se connecter</twig:block>

    <twig:block name="footer">
        <p class="text-center da-caption mt-4">
            <a href="{{ path('app_password_reset') }}" class="text-azur-600 hover:underline">
                Mot de passe oublié ?
            </a>
        </p>
    </twig:block>
</twig:Form>
```

---

### Avec sidebar

La sidebar est automatiquement masquée si son bloc est vide. Sur desktop elle est sticky (`top-4`),
sur mobile elle passe en pleine largeur sous la carte.

```twig
<twig:Form :form="form" classCard="max-w-2xl">
    <twig:block name="title">
        <i class="fa-solid fa-bell mr-2 text-azur-600"></i>
        Créer une alerte
    </twig:block>

    <twig:block name="fields">
        <div class="form-group">
            {{ form_label(form.practitioner, null, {label_attr: {class: 'da-label'}}) }}
            {{ form_widget(form.practitioner, {attr: {class: 'da-select'}}) }}
        </div>
        <div class="form-group">
            {{ form_label(form.email, null, {label_attr: {class: 'da-label'}}) }}
            {{ form_widget(form.email, {attr: {class: 'da-input'}}) }}
        </div>
    </twig:block>

    <twig:block name="controls">
        <a href="{{ path('app_alerts_index') }}" class="da-btn da-btn-ghost da-btn-lg">Annuler</a>
        <button type="submit" class="da-btn da-btn-primary da-btn-lg">
            <i class="fa-solid fa-bell mr-1"></i>
            Créer l'alerte
        </button>
    </twig:block>

    <twig:block name="sidebar">
        <div class="card w-full p-5">
            <p class="da-h3 mb-3">Prochain créneau</p>
            <div class="da-card-slot">
                <p class="da-caption text-ink-400 mb-1">{{ practitioner.fullName }}</p>
                <p class="da-body font-semibold">
                    {{ nextSlot ? nextSlot|date('d/m/Y à H:i') : 'Aucun créneau connu' }}
                </p>
            </div>
        </div>
    </twig:block>
</twig:Form>
```

---

### Classe du bouton submit personnalisée

```twig
<twig:Form
    :form="form"
    submitClass="da-btn da-btn-danger da-btn-lg"
    classCard="max-w-md"
>
    <twig:block name="title">Supprimer le compte</twig:block>
    <twig:block name="fields">{# … #}</twig:block>
    <twig:block name="label">Confirmer la suppression</twig:block>
</twig:Form>
```

---

## Notes

- **`form_start` / `form_end`** sont générés automatiquement par le composant dès que la prop
  `form` est fournie — ne pas les ajouter manuellement dans le bloc `fields`.
- **`form_rest`** est également appelé automatiquement pour rendre les champs cachés résiduels.
- **CSS chargé à la demande** via le contrôleur Stimulus — aucun import CSS manuel requis.
- La classe `.controls` applique un `display: flex; flex-wrap: wrap; gap: 0.75rem` avec
  `flex: 1 1 auto` sur chaque enfant direct — les boutons s'étendent naturellement.
