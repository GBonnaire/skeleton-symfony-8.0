# Composant Twig — `<twig:Toast>`

Notification flottante (toast) déclenchée côté serveur via un composant Twig.
Le composant pose un `<div>` invisible que le contrôleur Stimulus détecte au montage pour appeler `ToastManager.flash()`.
Les toasts s'affichent en bas à droite (desktop) ou en haut sur mobile, disparaissent après 7 secondes, et se ferment au clic de la croix.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Composant PHP | `src/Twig/Components/ToastComponent.php` |
| Template Twig | `templates/components/toast.html.twig` |
| Contrôleur Stimulus | `assets/controllers/components/twig/toast_controller.js` |
| Module JS `Toaster` | `assets/js/modules/toaster/toaster.js` |
| Singleton `ToastManager` | `assets/js/modules/toaster/toast-manager.js` |
| CSS | `assets/js/modules/toaster/toaster.css` |

---

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `type` | `string` | `'info'` | Variante visuelle : `success` · `danger` · `warning` · `info` · `notice` |
| `message` | `string` | `''` | Texte principal du toast — **obligatoire** |
| `title` | `string` | `''` | Titre en gras au-dessus du message — généré automatiquement depuis `type` si absent |
| `url` | `string` | `''` | URL de redirection : rend le toast entier cliquable |
| `show` | `bool` | `true` | Déclenche le toast au montage Stimulus — mettre `false` pour un rendu différé |

---

## Variantes

| `type` | Icône | Couleur barre | Titre automatique |
|--------|-------|---------------|-------------------|
| `success` | `fa-check` | vert `#0A8A55` | Succès |
| `danger` | `fa-circle-exclamation` | rouge `#C8323E` | Erreur |
| `warning` | `fa-triangle-exclamation` | orange `#C77F08` | Attention |
| `info` | `fa-circle-info` | bleu `#2563EB` | Information |
| `notice` | `fa-circle-info` | bleu `#2563EB` | Information |

> `error` est un alias de `danger` — les deux sont acceptés en JS mais `danger` est la valeur canonique en Twig.

---

## Comportement

- **Durée d'affichage** : 7 000 ms — une barre de progression en bas du toast visualise l'écoulement du délai.
- **Pause au survol** : survoler le conteneur de toasts suspend toutes les minuteries actives.
- **Fermeture manuelle** : bouton `×` en haut à droite.
- **Toast cliquable** : si `url` est fourni, cliquer n'importe où sur le toast (sauf la croix) redirige vers l'URL.
- **Empilement** : plusieurs toasts se superposent avec un décalage de 300 ms entre les apparitions.
- **Conteneur** : `#notifications-flash-toaster-container` — créé automatiquement par `ToastManager` s'il est absent du DOM.

---

## Exemples d'utilisation

### Toast minimal

```twig
<twig:Toast type="success" message="Alerte créée avec succès." />
```

### Toast avec titre personnalisé

```twig
<twig:Toast type="warning" message="Session bientôt expirée." title="Attention" />
```

### Toast cliquable (redirection)

```twig
<twig:Toast
    type="info"
    message="Créneau trouvé — cliquez pour réserver."
    title="Nouveau créneau"
    url="{{ path('app_slot_show', {id: slot.id}) }}"
/>
```

### Toast d'erreur

```twig
<twig:Toast type="danger" message="Une erreur est survenue, veuillez réessayer." />
```

### Toasts multiples (pile)

```twig
<twig:Toast type="success" message="Profil mis à jour." />
<twig:Toast type="info"    message="Un e-mail de confirmation a été envoyé." />
```

---

## Intégration via flash messages Symfony (recommandée)

Utiliser `$this->addFlash()` dans un contrôleur Symfony est la façon standard de déclencher des toasts après une redirection.

### Côté contrôleur PHP

```php
$this->addFlash('success', 'Votre alerte a été créée.');
$this->addFlash('danger',  'Impossible de supprimer cette alerte.');
$this->addFlash('warning', 'Quota de surveillances bientôt atteint.');
$this->addFlash('info',    'Aucun créneau détecté pour le moment.');

return $this->redirectToRoute('app_dashboard');
```

### Côté template de base (déjà en place)

```twig
{% for type, messages in app.flashes %}
    {% for message in messages %}
        <twig:Toast type="{{ type }}" message="{{ message }}" />
    {% endfor %}
{% endfor %}
```

---

## Utilisation depuis JavaScript

`ToastManager` est un singleton accessible globalement via `ToastManager.get()`.

```js
import { ToastManager } from '../js/modules/toaster/toast-manager';

const tm = ToastManager.get();

// Méthode générique
tm.flash('Alerte créée.', 'success');
tm.flash('Créneau trouvé.', 'info', 'Nouveau créneau', '/app/slot/42');

// Méthodes raccourcies
tm.success('Alerte créée.');
tm.error('Une erreur est survenue.');
tm.warning('Session bientôt expirée.');
tm.info('Aucun créneau disponible.');
```

### Signature de `flash()`

```js
ToastManager.get().flash(
    message,        // string  — texte principal
    level,          // string  — 'success' | 'danger' | 'warning' | 'info' | 'notice'
    title,          // string  — titre ('' = généré automatiquement)
    url             // string|null — URL de redirection (null = non cliquable)
);
```

---

## Classes CSS de référence

| Classe | Rôle |
|--------|------|
| `.da-toast` | Conteneur principal du toast |
| `.da-toast.active` | État visible — déclenche l'animation d'entrée |
| `.da-toast.paused` | Pause de la barre de progression (survol) |
| `.da-toast.clickable` | Toast cliquable (cursor pointer, listener click) |
| `.da-toast__icon` | Pastille d'icône |
| `.da-toast__icon--success/danger/warning/info` | Couleur de la pastille |
| `.da-toast__body` | Zone titre + description |
| `.da-toast__title` | Texte en gras |
| `.da-toast__desc` | Texte principal |
| `.da-toast__close` | Bouton de fermeture |
| `#notifications-flash-toaster-container` | Conteneur global (fixed, bas-droite desktop) |

---

## Positionnement

| Breakpoint | Position |
|------------|----------|
| Desktop (`≥ 768px`) | `bottom: 30px`, `right: 20px` — colonne verticale |
| Mobile (`< 640px`) | `top: 70px`, pleine largeur, sans border-radius |
