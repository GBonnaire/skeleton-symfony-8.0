<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

/**
 * Composant toast déclenché côté serveur, rendu par le contrôleur Stimulus `components--twig--toast`.
 * Le contrôleur lit les valeurs au montage et appelle `ToastManager.get().flash()`.
 *
 * Usage minimal :
 *
 * ```twig
 * <twig:Toast type="success" message="Alerte créée avec succès." />
 * ```
 *
 * Avec titre et lien cliquable :
 *
 * ```twig
 * <twig:Toast
 *     type="success"
 *     message="Créneau trouvé — cliquez pour réserver."
 *     title="Nouveau créneau"
 *     url="{{ path('app_slot_show', {id: slot.id}) }}"
 * />
 * ```
 *
 * Depuis un contrôleur Symfony (via flash messages) :
 *
 * ```php
 * $this->addFlash('success', 'Votre alerte a été créée.');
 * ```
 *
 * Props disponibles :
 *
 * @property string $type Variante : success | danger | warning | info | notice (défaut : info)
 * @property string $message Texte du toast (obligatoire)
 * @property string $title Titre affiché en gras (optionnel, généré automatiquement sinon)
 * @property string $url URL de redirection si le toast est cliquable (optionnel)
 * @property bool $show Show option
 */
#[AsTwigComponent('Toast', template: 'components/toast.html.twig')]
class ToastComponent
{
    public string $type = 'info';
    public string $message = '';
    public string $title = '';
    public string $url = '';
    public bool $show = true;
}
