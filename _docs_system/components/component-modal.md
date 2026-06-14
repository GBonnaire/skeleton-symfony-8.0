# Composant Twig — `<twig:Modal>`

Fenêtre modale générique pilotée par Stimulus. Le contenu est rendu côté serveur (blocs Twig),
puis passé au module JS `Modal` pour l'affichage dynamique. Supporte les icônes colorées,
la confirmation, le déplacement et les dimensions personnalisées.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Composant PHP | `src/Twig/Components/ModalComponent.php` |
| Bouton PHP | `src/Twig/Components/ModalButtonComponent.php` |
| Template Twig | `templates/components/modal.html.twig` |
| Template bouton | `templates/components/modal_button.html.twig` |
| Contrôleur Stimulus | `assets/controllers/components/twig/modal_controller.js` |
| Contrôleur déclencheur | `assets/controllers/modal-action_controller.js` |
| Module JS | `assets/js/modules/modal/modal.js` |
| CSS | `assets/js/modules/modal/modal.css` |

---

## Props — `<twig:Modal>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `string` | `''` | Identifiant HTML — requis pour cibler la modale depuis l'extérieur |
| `title` | `string` | `''` | Titre affiché dans l'en-tête |
| `showOnLoad` | `bool` | `false` | Ouvrir automatiquement au chargement de la page |
| `icon` | `string` | `''` | Classe FontAwesome (ex : `fa-circle-check`) |
| `iconPosition` | `string` | `'left'` | `left` · `center` |
| `iconVariant` | `string` | `''` | `success` · `warning` · `danger` · `info` · `primary` · `secondary` |
| `iconSize` | `int` | `0` | Taille de l'icône en px — `0` utilise la valeur CSS par défaut |
| `canClose` | `bool` | `true` | Afficher la croix de fermeture et fermer au clic backdrop |
| `backdrop` | `bool` | `true` | Afficher le fond sombre semi-transparent |
| `width` | `string` | `''` | Largeur CSS personnalisée (ex : `'600px'`, `'80vw'`) |
| `height` | `string` | `''` | Hauteur CSS personnalisée |

---

## Blocs Twig

| Bloc | Description |
|------|-------------|
| `content` | Corps de la modale — tout HTML est accepté |
| `footer` | Boutons d'action — rendu dans un bandeau grisé en bas |

---

## Props — `<twig:ModalButton>`

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | `string` | — | Texte du bouton |
| `class` | `string` | `da-btn da-btn-ghost` | Classes CSS du bouton |
| `modalId` | `string` | — | `id` de la modale à fermer au clic |
| `actionController` | `string` | `''` | Identifiant Stimulus d'un controller supplémentaire à déclencher |
| `actionMethod` | `string` | `''` | Méthode à appeler sur ce controller au clic |
| `actionParam` | `array` | `[]` | Paramètres transmis via `data-*-param` (clés camelCase) |

---

## Événements Stimulus

| Événement | Détail | Description |
|-----------|--------|-------------|
| `components--twig--modal:ready` | `{ modal }` | Émis après instanciation JS |
| `components--twig--modal:open` | `{ modal }` | Émis à l'ouverture |
| `components--twig--modal:close` | `{ modal }` | Émis à la fermeture |

---

## Variantes d'icônes

| Valeur `iconVariant` | Couleur appliquée |
|----------------------|-------------------|
| `success` | `--color-success-500` |
| `warning` | `--color-warning-500` |
| `danger` | `--color-danger-500` |
| `info` | `--color-info-500` |
| `primary` | `--da-brand` |
| `secondary` | `--da-text-secondary` |

---

## Exemples d'utilisation

### Modale simple

```twig
<twig:Modal id="modal-info" title="Information">
    <twig:block name="content">
        <p>Votre alerte a bien été enregistrée.</p>
    </twig:block>
    <twig:block name="footer">
        <twig:ModalButton label="Compris" class="da-btn da-btn-primary" modalId="modal-info" />
    </twig:block>
</twig:Modal>
```

### Modale avec icône centrée (confirmation)

```twig
<twig:Modal
    id="modal-success"
    title="Alerte créée !"
    icon="fa-circle-check"
    iconVariant="success"
    iconPosition="center"
>
    <twig:block name="content">
        <p>Dr. Dubois est maintenant surveillé. La veille est active 24h/24.</p>
    </twig:block>
    <twig:block name="footer">
        <twig:ModalButton label="Parfait" class="da-btn da-btn-primary" modalId="modal-success" />
    </twig:block>
</twig:Modal>
```

### Modale de danger (suppression)

```twig
<twig:Modal
    id="modal-delete"
    title="Supprimer l'alerte ?"
    icon="fa-trash"
    iconVariant="danger"
>
    <twig:block name="content">
        <p class="da-body text-center">
            Cette action est irréversible. L'alerte pour Dr. Bernard sera définitivement supprimée.
        </p>
    </twig:block>
    <twig:block name="footer">
        <twig:ModalButton label="Supprimer" class="da-btn da-btn-danger" modalId="modal-delete" />
        <twig:ModalButton label="Annuler"                                 modalId="modal-delete" />
    </twig:block>
</twig:Modal>
```

### Modale avec icône de taille personnalisée

```twig
<twig:Modal
    id="modal-alert"
    title="Attention"
    icon="fa-triangle-exclamation"
    iconVariant="warning"
    iconSize="48"
>
    <twig:block name="content">
        <p>Cette alerte expire dans 2 jours.</p>
    </twig:block>
</twig:Modal>
```

### Modale ouverte automatiquement au chargement

```twig
<twig:Modal
    id="modal-welcome"
    title="Bienvenue"
    showOnLoad="true"
    :canClose="false"
>
    <twig:block name="content">
        <p>Veuillez compléter votre profil avant de continuer.</p>
    </twig:block>
    <twig:block name="footer">
        <a href="{{ path('app_profile_edit') }}" class="da-btn da-btn-primary">
            Compléter mon profil
        </a>
    </twig:block>
</twig:Modal>
```

### Modale avec dimensions personnalisées

```twig
<twig:Modal
    id="modal-large"
    title="Aperçu du document"
    width="900px"
    height="600px"
>
    <twig:block name="content">
        <iframe src="{{ path('app_document_preview', {id: document.id}) }}"
                class="w-full h-full border-0">
        </iframe>
    </twig:block>
</twig:Modal>
```

---

## Déclencheurs

### Via `twig:ModalButton` (recommandé dans le footer)

```twig
<twig:block name="footer">
    <twig:ModalButton label="Confirmer" class="da-btn da-btn-primary" modalId="modal-delete" />
    <twig:ModalButton label="Annuler"                                 modalId="modal-delete" />
</twig:block>
```

### Via un bouton externe (`modal-action` controller)

```twig
<button class="da-btn da-btn-outline"
    {{ stimulus_controller('modal-action', {id: 'modal-delete'}) }}
    {{ stimulus_action('modal-action', 'open', 'click') }}>
    Supprimer
</button>
```

### Via un lien

```twig
<a href="#"
   {{ stimulus_controller('modal-action', {id: 'modal-info'}) }}
   {{ stimulus_action('modal-action', 'open', 'click') }}>
    En savoir plus
</a>
```

### Via JavaScript

```js
// Ouvrir
document.getElementById('modal-delete')
    .dispatchEvent(new CustomEvent('components--twig--modal:open'));

// Fermer
document.getElementById('modal-delete')
    .dispatchEvent(new CustomEvent('components--twig--modal:close'));
```

---

## Fermer depuis l'intérieur du contenu

```twig
<twig:block name="content">
    <p>Êtes-vous sûr ?</p>
    <button class="da-btn da-btn-ghost"
            data-action="components--twig--modal#close">
        Annuler
    </button>
</twig:block>
```

---

## `twig:ModalButton` avec action Stimulus supplémentaire

Déclenche une méthode sur un autre controller en plus de fermer la modale.

```twig
<twig:Modal id="modal-confirm-delete" title="Confirmer la suppression">
    <twig:block name="content">
        <p>Cette action est irréversible.</p>
    </twig:block>
    <twig:block name="footer">
        <twig:ModalButton
            label="Supprimer"
            class="da-btn da-btn-danger"
            modalId="modal-confirm-delete"
            actionController="alert-list"
            actionMethod="deleteItem"
            :actionParam="{itemId: alert.id}"
        />
        <twig:ModalButton label="Annuler" modalId="modal-confirm-delete" />
    </twig:block>
</twig:Modal>
```

---

## Écouter les événements

```js
const el = document.getElementById('modal-delete');

el.addEventListener('components--twig--modal:open', () => {
    console.log('Modale ouverte');
});

el.addEventListener('components--twig--modal:close', () => {
    console.log('Modale fermée');
});
```

---

## Modale sans fond sombre ni fermeture

Utile pour les écrans de chargement ou les étapes obligatoires.

```twig
<twig:Modal
    id="modal-loading"
    :backdrop="false"
    :canClose="false"
    showOnLoad="true"
>
    <twig:block name="content">
        <div class="flex items-center gap-3">
            <span class="da-pulse">
                <span class="da-pulse__ring"></span>
                <span class="da-pulse__dot"></span>
            </span>
            <p>Chargement en cours…</p>
        </div>
    </twig:block>
</twig:Modal>
```
