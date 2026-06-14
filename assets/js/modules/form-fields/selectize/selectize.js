import 'choices.js/public/assets/styles/choices.css';
import './selectize.css';
import Choices from 'choices.js';
import { EventsDispatcher } from '../../../utils/events-dispatcher';
import Translator from '../../../utils/translator';

Translator.get()
    .load({
        noResultsText:          'Aucun résultat',
        noChoicesText:          'Aucune option disponible',
        itemSelectText:         '',
        uniqueItemText:         'Seules des valeurs uniques peuvent être ajoutées',
        customAddItemText:      'Seules des valeurs correspondant aux conditions requises peuvent être ajoutées',
        addItemText:            'Appuyez sur Entrée pour ajouter "{value}"',
        removeItemIconText:     'Supprimer',
        removeItemLabelText:    'Supprimer : {label}',
        maxItemText:            'Maximum {max} valeur(s) autorisée(s)',
    }, 'selectize', 'fr')
    .load({
        noResultsText:          'No results found',
        noChoicesText:          'No choices to choose from',
        itemSelectText:         '',
        uniqueItemText:         'Only unique values can be added',
        customAddItemText:      'Only values matching specific conditions can be added',
        addItemText:            'Press Enter to add "{value}"',
        removeItemIconText:     'Remove item',
        removeItemLabelText:    'Remove item: {label}',
        maxItemText:            'Only {max} values can be added',
    }, 'selectize', 'en');

/**
 * Selectize — wraps Choices.js.
 *
 * Cas gérés :
 *   - select simple           → dropdown avec chevron, pas de recherche (défaut)
 *   - select simple + search  → activé via data-search="true"
 *   - select multiple         → tags supprimables, recherche activée
 *   - optgroup                → headings stylisés, lu depuis le <select> natif
 *   - placeholder             → option[value=""] ou data-placeholder
 *   - disabled                → global ou par option
 *   - erreur                  → classe da-select--error → is-invalid sur le conteneur
 *
 * Événements (EventsDispatcher) :
 *   change(value)       — valeur modifiée
 *   open()              — dropdown ouvert
 *   close()             — dropdown fermé
 *   addItem(detail)     — item ajouté (multiple)
 *   removeItem(detail)  — item supprimé (multiple)
 *
 * API publique :
 *   getValue()          → string | string[]
 *   setValue(v)         → this
 *   clearValue()        → this
 *   setChoices(arr)     → this  (arr: [{value, label, disabled?}])
 *   enable()            → this
 *   disable()           → this
 *   setError(bool)      → this
 *   destroy()
 */
export class Selectize extends EventsDispatcher {

    constructor(element, options = {}) {
        super();
        if (typeof element === 'string') element = document.querySelector(element);
        this.element = element;
        this._init(options);
    }

    _init(userOptions) {
        const el = this.element;
        const isMultiple = el.multiple;
        const hasSearch  = isMultiple || el.dataset.search === 'true';
        const hasError   = el.classList.contains('da-select--error');
        const maxItems   = parseInt(el.dataset.maxItems, 10) || -1;
        const tr         = Translator.get();
        const t          = (key, vars = {}) => {
            let s = tr.trans(key, 'selectize');
            for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
            return s;
        };

        const opts = Object.assign({
            searchEnabled:          hasSearch,
            searchPlaceholderValue: 'Rechercher…',
            removeItemButton:       isMultiple,
            placeholder:            true,
            noResultsText:          t('noResultsText'),
            noChoicesText:          t('noChoicesText'),
            itemSelectText:         t('itemSelectText'),
            uniqueItemText:         t('uniqueItemText'),
            customAddItemText:      t('customAddItemText'),
            addItemText:            (value) => t('addItemText', { value }),
            removeItemIconText:     () => t('removeItemIconText'),
            removeItemLabelText:    (value, _raw, i) => t('removeItemLabelText', { label: i ? i.label : value }),
            maxItemText:            (max) => t('maxItemText', { max }),
            allowHTML:              false,
            shouldSort:             false,
            shouldSortItems:        false,
            maxItemCount:           maxItems,
            classNames: {
                containerOuter: ['choices', 'da-selectize'],
            },
        }, userOptions);

        this._choices = new Choices(el, opts);

        if (hasError) {
            this._outerEl().classList.add('is-invalid');
        }

        this._bindEvents();
    }

    _outerEl() {
        return this._choices.containerOuter.element;
    }

    _bindEvents() {
        const el = this.element;

        el.addEventListener('change', () => {
            this._dispatchEvent('change', this.getValue());
        });

        el.addEventListener('showDropdown', () => {
            this._dispatchEvent('open');
        });

        el.addEventListener('hideDropdown', () => {
            this._dispatchEvent('close');
        });

        el.addEventListener('addItem', (e) => {
            this._dispatchEvent('addItem', e.detail);
        });

        el.addEventListener('removeItem', (e) => {
            this._dispatchEvent('removeItem', e.detail);
        });
    }

    // ── API ──────────────────────────────────────────────────────────────────

    getValue() {
        return this._choices.getValue(true);
    }

    setValue(value) {
        const values = Array.isArray(value) ? value : [value];
        this._choices.removeActiveItems();
        values.forEach(v => this._choices.setChoiceByValue(String(v)));
        return this;
    }

    clearValue() {
        this._choices.removeActiveItems();
        return this;
    }

    /**
     * Remplace les options de la liste.
     * @param {Array<{value: string, label: string, disabled?: boolean, selected?: boolean}>} choices
     */
    setChoices(choices) {
        this._choices.setChoices(choices, 'value', 'label', true);
        return this;
    }

    enable() {
        this._choices.enable();
        return this;
    }

    disable() {
        this._choices.disable();
        return this;
    }

    setError(hasError) {
        this._outerEl().classList.toggle('is-invalid', Boolean(hasError));
        return this;
    }

    destroy() {
        this._choices.destroy();
        delete this.element._selectize;
        this._dispatchEvent('destroy');
    }

    // ── Accès à l'instance Choices.js sous-jacente ───────────────────────────

    get instance() {
        return this._choices;
    }
}
