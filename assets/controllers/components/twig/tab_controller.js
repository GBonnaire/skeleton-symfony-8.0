import { Controller } from '@hotwired/stimulus';
import { TabManager } from '../../../js/modules/tab/tab';
import '../../../styles/components/twig/tab.css';

/*
 * data-controller="components--twig--tab"
 *
 * Initialise un groupe d'onglets via le module TabManager, scoped à l'élément hôte.
 * Généré par le composant Twig #[AsTwigComponent('Tab')] —
 * utiliser <twig:Tab /> plutôt que de poser les attributs à la main.
 *
 * Structure attendue (rendue automatiquement par les composants) :
 *   <div data-controller="components--twig--tab">
 *     <ul class="tab">           ← twig:Tab — barre de navigation
 *       <li data-tab-target="tab-1" class="active">Onglet 1</li>
 *       <li data-tab-target="tab-2">Onglet 2</li>
 *     </ul>
 *     <div class="tab-content" id="tab-1">...</div>  ← twig:TabContent
 *     <div class="tab-content" id="tab-2">...</div>
 *   </div>
 *
 * Exemple via composant Twig (recommandé) :
 *   <twig:Tab :tabs="[{id:'tab-1', label:'Infos'}, {id:'tab-2', label:'Config', icon:'fa-gear'}]" activeTab="tab-1">
 *       <twig:block name="content">
 *           <twig:TabContent id="tab-1">
 *               <twig:block name="content"><p>Contenu 1</p></twig:block>
 *           </twig:TabContent>
 *           <twig:TabContent id="tab-2">
 *               <twig:block name="content"><p>Contenu 2</p></twig:block>
 *           </twig:TabContent>
 *       </twig:block>
 *   </twig:Tab>
 */
export default class extends Controller {

    connect() {
        this.tabManager = new TabManager(this.element);
    }

    disconnect() {
        this.tabManager = null;
    }
}
