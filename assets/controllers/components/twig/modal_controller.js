import { Controller } from '@hotwired/stimulus';
import { ModalManager } from '../../../js/modules/modal/modal-manager';

/*
 * data-controller="components--twig--modal"
 *
 * Instancie un Modal JS sur la balise hôte générée par le composant Twig
 * #[AsTwigComponent('Modal')] — utiliser <twig:Modal /> plutôt que de poser
 * les attributs à la main.
 *
 * Valeurs Stimulus (préfixe : data-components--twig--modal-*-value) :
 *   title-value          — titre de la modale
 *   show-on-load-value   — ouvrir automatiquement au montage (défaut : false)
 *   icon-value           — classe FontAwesome (ex : fa-circle-check)
 *   icon-position-value  — 'left' (défaut) | 'center'
 *   icon-variant-value   — success | warning | danger | info | primary | secondary
 *   can-close-value      — afficher la croix de fermeture (défaut : true)
 *   backdrop-value       — afficher le fond sombre (défaut : true)
 *   can-move-value       — modale déplaçable (défaut : false)
 *   width-value          — largeur CSS personnalisée (ex : '600px')
 *   height-value         — hauteur CSS personnalisée
 *
 * Blocs Twig disponibles : content, footer
 *
 *
 * Exemple via composant Twig (recommandé) :
 *   <twig:Modal title="Succès" showOnLoad="true" icon="fa-circle-check" iconVariant="success">
 *       <twig:block name="content"><p>Opération réussie.</p></twig:block>
 *   </twig:Modal>
 */
export default class extends Controller {

    static values = {
        title:        String,
        showOnLoad:   { type: Boolean, default: false },
        icon:         String,
        iconPosition: { type: String,  default: 'left' },
        iconVariant:  String,
        iconSize:     { type: Number,  default: 0 },
        canClose:     { type: Boolean, default: true },
        backdrop:     { type: Boolean, default: true },
        width:        String,
        height:       String
    };

    initialize() {
        super.initialize();
        this.modal = null;
    }

    connect() {
        const contentEl  = this.element.querySelector('[data-modal-target="content"]');
        const footerEl   = this.element.querySelector('[data-modal-target="footer"]');
        const footerHtml = footerEl?.innerHTML?.trim();


        ModalManager.get().custom(
            contentEl?.innerHTML     ?? '',
            this.hasTitleValue       ? this.titleValue       : null,
            null,
            (modal) => {
                this.modal = modal;
            },
            {
                footer:       footerHtml               || null,
                icon:         this.hasIconValue        ? this.iconValue        : null,
                iconPosition: this.iconPositionValue,
                iconVariant:  this.hasIconVariantValue ? this.iconVariantValue : null,
                iconSize:     this.iconSizeValue       || null,
                canClose:     this.canCloseValue,
                backdrop:     this.backdropValue,
                width:        this.hasWidthValue       ? this.widthValue       : null,
                height:       this.hasHeightValue      ? this.heightValue      : null,
                closed:       !this.showOnLoadValue,
            },
            this.element.id ?? null
        );
    }
}
