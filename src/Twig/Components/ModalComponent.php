<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

/**
 * Composant modale générique pilotée par le contrôleur Stimulus `components--twig--modal`.
 * Le contenu est rendu côté serveur puis passé au module JS Modal pour affichage.
 *
 * Usage minimal :
 *
 * ```twig
 * <twig:Modal title="Confirmation" icon="fa-circle-check" iconVariant="success">
 *     <twig:block name="content">
 *         <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
 *     </twig:block>
 *     <twig:block name="footer">
 *         <button class="da-btn da-btn-danger">Supprimer</button>
 *         <button class="da-btn da-btn-ghost">Annuler</button>
 *     </twig:block>
 * </twig:Modal>
 * ```
 *
 * Usage complet :
 *
 * ```twig
 * <twig:Modal
 *     id="modal-confirm"
 *     title="Titre de la modale"
 *     showOnLoad="true"
 *     icon="fa-triangle-exclamation"
 *     iconPosition="center"
 *     iconVariant="warning"
 *     canClose="false"
 *     backdrop="true"
 *     canMove="true"
 *     width="700px"
 *     height="400px"
 * >
 *     <twig:block name="content">
 *         <p>Contenu principal de la modale.</p>
 *         <p>Tout HTML est accepté ici.</p>
 *     </twig:block>
 *
 *     <twig:block name="footer">
 *         <a href="{{ path('app_home') }}" class="da-btn da-btn-primary">Confirmer</a>
 *         <button class="da-btn da-btn-ghost"
 *                 data-action="components--twig--modal#close">Annuler</button>
 *     </twig:block>
 * </twig:Modal>
 * ```
 *
 * Ouvrir/fermer depuis l'extérieur :
 *
 * ```twig
 * {# Bouton déclencheur #}
 * <button data-action="components--twig--modal#open"
 *         data-components--twig--modal-outlet="#modal-confirm">
 *     Ouvrir
 * </button>
 *
 * {# Ou via JS #}
 * {# document.getElementById('modal-confirm')
 *      .dispatchEvent(new Event('components--twig--modal:open')) #}
 * ```
 *
 * Props disponibles :
 *
 * @property string $id Identifiant HTML (pour cibler la modale depuis l'extérieur)
 * @property string $title Titre affiché dans l'en-tête de la modale
 * @property bool $showOnLoad Ouvrir automatiquement au chargement de la page (défaut : false)
 * @property string $icon Classe FontAwesome sans le préfixe `fa-` (ex : `circle-check`)
 * @property string $iconPosition Position de l'icône : `left` (défaut) ou `center`
 * @property string $iconVariant Variante colorée : `success`, `warning`, `danger`, `info`, `primary`, `secondary`
 * @property bool $canClose Afficher la croix de fermeture (défaut : true)
 * @property bool $backdrop Afficher le fond sombre (défaut : true)
 * @property bool $canMove Rendre la modale déplaçable (défaut : false)
 * @property string $width Largeur CSS personnalisée (ex : `600px`, `80vw`)
 * @property string $height Hauteur CSS personnalisée
 *
 * Blocs disponibles : `content`, `footer`
 *
 * Événements Stimulus émis :
 *   `components--twig--modal:ready`  — après instanciation (detail.modal = instance Modal)
 *   `components--twig--modal:open`   — à l'ouverture
 *   `components--twig--modal:close`  — à la fermeture
 */
#[AsTwigComponent('Modal', template: 'components/modal.html.twig')]
class ModalComponent
{
    public string $id = '';
    public string $title = '';
    public bool $showOnLoad = false;

    // Icône
    public string $icon = '';
    public string $iconPosition = 'left';
    public string $iconVariant = '';
    public int $iconSize = 0;

    // Comportement
    public bool $canClose = true;
    public bool $backdrop = true;

    // Dimensions
    public string $width = '';
    public string $height = '';
}
