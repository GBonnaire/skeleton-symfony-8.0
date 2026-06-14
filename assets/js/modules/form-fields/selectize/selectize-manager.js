import { isDomLoaded } from '../../../utils/helper';
import { Selectize } from './selectize';

/**
 * SelectizeManager — initialise automatiquement tous les select.da-select.
 *
 * Sélecteur par défaut : select.da-select:not([data-da-selectize="false"])
 * Opt-out par élément  : data-da-selectize="false"
 *
 * Usage :
 *   import { SelectizeManager } from '.../selectize-manager';
 *   new SelectizeManager();                        // sélecteur par défaut
 *   new SelectizeManager('select.my-class');       // sélecteur personnalisé
 *
 * Chaque élément initialisé expose son instance via el._selectize.
 */
export class SelectizeManager {

    constructor(selector = 'select.da-select:not([data-da-selectize="false"])') {
        if (isDomLoaded()) {
            this._init(selector);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                this._init(selector);
            });
        }
    }

    _init(selector) {
        document.querySelectorAll(selector).forEach(el => {
            if (!el._selectize) {
                el._selectize = new Selectize(el);
            }
        });
    }
}
