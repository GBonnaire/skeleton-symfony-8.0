import { Controller } from '@hotwired/stimulus';
import DateRangePicker from '../../../js/modules/form-fields/daterangepicker/daterangepicker.js';
import '../../../js/modules/form-fields/daterangepicker/daterangepicker.css';
import moment from 'moment';
import 'moment/locale/fr';

/*
 * data-controller="components--twig--form-field-datepicker"
 *
 * Initialise un DateRangePicker (vanilla JS, sans jQuery) sur l'input texte du composant.
 * Généré par <twig:FormFieldDatepicker /> — ne pas poser les attributs à la main.
 *
 * Valeurs Stimulus (préfixe : data-components--twig--form-field-datepicker-*-value) :
 *   single-date-value   — mode date unique (défaut : false)
 *   opens-value         — côté d'ouverture : 'left'|'center'|'right' (défaut : 'right')
 *   drops-value         — sens : 'up'|'down'|'auto' (défaut : 'down')
 *   format-value        — format moment.js (défaut : 'DD/MM/YYYY')
 *   separator-value     — séparateur entre les deux dates (défaut : ' — ')
 *   min-date-value      — date minimum (même format que format-value)
 *   max-date-value      — date maximum (même format que format-value)
 *   auto-apply-value    — applique dès la sélection (défaut : false)
 *   show-ranges-value   — affiche les raccourcis prédéfinis (défaut : false)
 *
 * Événements natifs émis sur l'input :
 *   apply.daterangepicker   — une plage est confirmée  (e.detail = instance)
 *   cancel.daterangepicker  — annulation
 *   show.daterangepicker    — calendrier ouvert
 *   hide.daterangepicker    — calendrier fermé
 *   change                  — valeur mise à jour (compatible formulaires Symfony)
 */

moment.locale('fr');

const LOCALE_FR = {
    applyLabel:       'Appliquer',
    cancelLabel:      'Annuler',
    weekLabel:        'S',
    customRangeLabel: 'Période personnalisée',
    daysOfWeek:       ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
    monthNames:       ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    firstDay:         1,
};

export default class extends Controller {

    static values = {
        singleDate: { type: Boolean, default: false },
        opens:      { type: String,  default: 'right' },
        drops:      { type: String,  default: 'down' },
        format:     { type: String,  default: 'DD/MM/YYYY' },
        separator:  { type: String,  default: ' — ' },
        minDate:    { type: String,  default: '' },
        maxDate:    { type: String,  default: '' },
        autoApply:  { type: Boolean, default: false },
        showRanges: { type: Boolean, default: false },
    };

    connect() {
        this._input = this.element.querySelector('input[type="text"]');
        if (!this._input) return;

        const locale = Object.assign({}, LOCALE_FR, {
            format:    this.formatValue,
            separator: this.separatorValue,
        });

        const options = {
            locale,
            singleDatePicker: this.singleDateValue,
            opens:            this.opensValue,
            drops:            this.dropsValue,
            autoApply:        this.autoApplyValue,
            autoUpdateInput:  false,
        };

        if (this.minDateValue) options.minDate = this.minDateValue;
        if (this.maxDateValue) options.maxDate = this.maxDateValue;

        if (this.showRangesValue && !this.singleDateValue) {
            options.ranges = {
                "Aujourd'hui":      [moment(), moment()],
                'Cette semaine':    [moment().startOf('isoWeek'),                        moment().endOf('isoWeek')],
                'Semaine dernière': [moment().subtract(1, 'week').startOf('isoWeek'),    moment().subtract(1, 'week').endOf('isoWeek')],
                'Ce mois':          [moment().startOf('month'),                          moment().endOf('month')],
                'Mois dernier':     [moment().subtract(1, 'month').startOf('month'),     moment().subtract(1, 'month').endOf('month')],
                '3 derniers mois':  [moment().subtract(3, 'month').startOf('day'),       moment()],
            };
        }

        DateRangePicker.init(this._input, options, (start, end) => {
            this._input.value = this.singleDateValue
                ? start.format(this.formatValue)
                : start.format(this.formatValue) + this.separatorValue + end.format(this.formatValue);

            this._input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    disconnect() {
        this._input?._daterangepicker?.remove();
        this._input = null;
    }
}
