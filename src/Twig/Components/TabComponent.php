<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

/**
 * Composant onglets (tabs) piloté par le module JS TabManager.
 * Utiliser en combinaison avec <twig:TabContent> pour les panneaux de contenu.
 *
 * Usage minimal :
 *
 * ```twig
 * <twig:Tab :tabs="[{id:'tab-1', label:'Infos'}, {id:'tab-2', label:'Config'}]" activeTab="tab-1">
 *     <twig:block name="content">
 *         <twig:TabContent id="tab-1">
 *             <twig:block name="content"><p>Contenu 1</p></twig:block>
 *         </twig:TabContent>
 *         <twig:TabContent id="tab-2">
 *             <twig:block name="content"><p>Contenu 2</p></twig:block>
 *         </twig:TabContent>
 *     </twig:block>
 * </twig:Tab>
 * ```
 *
 * Avec icônes :
 *
 * ```twig
 * <twig:Tab :tabs="[
 *     {id: 'tab-info',   label: 'Informations', icon: 'fa-circle-info'},
 *     {id: 'tab-config', label: 'Configuration', icon: 'fa-gear'},
 * ]" activeTab="tab-info">
 * ```
 *
 * Props disponibles :
 *
 * @property string $id Identifiant HTML du wrapper (optionnel)
 * @property array $tabs Tableau d'onglets : [{id: string, label: string, icon?: string}]
 * @property string $activeTab Id de l'onglet actif par défaut (défaut : premier onglet)
 */
#[AsTwigComponent('Tab', template: 'components/tab.html.twig')]
class TabComponent
{
    public string $id = '';
    public array $tabs = [];
    public string $activeTab = '';
}
