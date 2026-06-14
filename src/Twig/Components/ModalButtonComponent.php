<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

/**
 * Bouton d'action à placer dans le bloc `footer` d'un composant `twig:Modal`.
 *
 * Par défaut, le bouton ferme la modale identifiée par `modalId`.
 * Un contrôleur Stimulus supplémentaire peut être déclenché simultanément
 * via `actionController`, `actionMethod` et `actionParam`.
 *
 * Usage minimal (bouton Annuler) :
 *
 * ```twig
 * <twig:ModalButton label="Annuler" modalId="modal-confirm" />
 * ```
 *
 * Usage avec action supplémentaire :
 *
 * ```twig
 * <twig:ModalButton
 *     label="Supprimer"
 *     class="da-btn da-btn-danger"
 *     modalId="modal-confirm"
 *     actionController="entity-delete"
 *     actionMethod="delete"
 *     :actionParam="{ id: entity.id }"
 * />
 * ```
 *
 * Props disponibles :
 *
 * @property string $label Texte affiché sur le bouton
 * @property string $class Classes CSS du bouton (défaut : da-btn da-btn-ghost)
 * @property string $modalId Id HTML de la twig:Modal parente (nécessaire pour le close)
 * @property string $actionController Identifiant Stimulus du contrôleur supplémentaire
 * @property string $actionMethod Méthode à appeler sur ce contrôleur au clic
 * @property array $actionParam Paramètres Stimulus transmis à la méthode (clés en camelCase)
 */
#[AsTwigComponent('ModalButton', template: 'components/modal_button.html.twig')]
class ModalButtonComponent
{
    public string $label = '';
    public string $class = 'da-btn da-btn-ghost';
    public string $modalId = '';

    public string $actionController = '';
    public string $actionMethod = '';
    public array $actionParam = [];
}
