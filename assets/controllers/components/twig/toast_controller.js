import { Controller } from '@hotwired/stimulus';
import { ToastManager } from '../../../js/modules/toaster/toast-manager';

/*
 * data-controller="components--twig--toast"
 *
 * Déclenche un toast JS au montage via le module ToastManager.
 * Généré par le composant Twig #[AsTwigComponent('Toast')] —
 * utiliser <twig:Toast /> plutôt que de poser les attributs à la main.
 *
 * Valeurs Stimulus (préfixe : data-components--twig--toast-*-value) :
 *   type-value     — success | danger | warning | info | notice (défaut : info)
 *   message-value  — texte du toast
 *   title-value    — titre (optionnel, généré depuis le type sinon)
 *   url-value      — URL de redirection si le toast est cliquable (optionnel)
 *
 * Exemple via composant Twig (recommandé) :
 *   <twig:Toast type="success" message="Alerte créée avec succès." />
 *   <twig:Toast type="warning" message="Session bientôt expirée." title="Attention" />
 *   <twig:Toast type="info" message="Créneau trouvé." url="{{ path('app_slot_show', {id: 1}) }}" />
 */
export default class extends Controller {

    static values = {
        type:    { type: String, default: 'info' },
        message: String,
        title:   String,
        url:     String,
        show:    { type: Boolean, default: true },
    };

    initialize() {
        super.initialize();
        ToastManager.get();
    }

    connect() {
        if(this.showValue) {
            this.show();
        }
    }

    show() {
        ToastManager.get().flash(
            this.messageValue,
            this.typeValue,
            this.hasTitleValue ? this.titleValue : '',
            this.hasUrlValue   ? this.urlValue   : null
        );
    }
}
