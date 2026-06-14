<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

/**
 * Panneau de contenu pour le composant <twig:Tab>.
 * Doit être placé à l'intérieur du bloc `content` d'un <twig:Tab>.
 *
 * Usage :
 *
 * ```twig
 * <twig:TabContent id="tab-1">
 *     <twig:block name="content">
 *         <p>Contenu de l'onglet.</p>
 *     </twig:block>
 * </twig:TabContent>
 * ```
 *
 * Props disponibles :
 *
 * @property string $id Identifiant HTML — doit correspondre à l'id déclaré dans tabs de <twig:Tab>
 */
#[AsTwigComponent('TabContent', template: 'components/tab_content.html.twig')]
class TabContentComponent
{
    public string $id = '';
}
