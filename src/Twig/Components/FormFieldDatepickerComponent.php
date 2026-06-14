<?php

namespace App\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;
use Symfony\UX\TwigComponent\Attribute\PostMount;

/**
 * Champ de sélection de date ou plage de dates, piloté par DateRangePicker (vanilla JS).
 *
 * Usage minimal — plage de dates :
 *
 * ```twig
 * <twig:FormFieldDatepicker
 *     name="dateRange"
 *     label="Période"
 *     placeholder="JJ/MM/AAAA — JJ/MM/AAAA"
 * />
 * ```
 *
 * Date unique :
 *
 * ```twig
 * <twig:FormFieldDatepicker
 *     name="date"
 *     label="Date de début"
 *     :singleDate="true"
 *     placeholder="JJ/MM/AAAA"
 * />
 * ```
 *
 * Avec plages prédéfinies et limites :
 *
 * ```twig
 * <twig:FormFieldDatepicker
 *     name="periode"
 *     label="Filtrer par période"
 *     :showRanges="true"
 *     minDate="01/01/2024"
 *     maxDate="31/12/2026"
 *     opens="left"
 * />
 * ```
 *
 * Avec valeur initiale et état d'erreur :
 *
 * ```twig
 * <twig:FormFieldDatepicker
 *     name="periode"
 *     label="Période de surveillance"
 *     value="01/05/2026 — 31/05/2026"
 *     error="La date de fin doit être postérieure à la date de début."
 *     help="La surveillance s'arrête automatiquement à la date de fin."
 * />
 * ```
 *
 * Props disponibles :
 *
 * @property string $id Identifiant HTML (auto-généré si absent)
 * @property string $name Attribut name de l'input
 * @property string $label Texte du label
 * @property string $placeholder Placeholder de l'input
 * @property string $value Valeur initiale pré-remplie
 * @property bool $required Marque le champ comme obligatoire
 * @property bool $disabled Désactive le champ
 * @property string $help Texte d'aide affiché sous le champ
 * @property string $error Message d'erreur (affiche da-input--error)
 * @property bool $singleDate Mode date unique (défaut : false = plage)
 * @property string $opens Côté d'ouverture du calendrier : 'left'|'center'|'right' (défaut : 'right')
 * @property string $drops Sens d'ouverture : 'up'|'down'|'auto' (défaut : 'down')
 * @property string $format Format de date moment.js (défaut : 'DD/MM/YYYY')
 * @property string $separator Séparateur entre les deux dates (défaut : ' — ')
 * @property string $minDate Date minimum sélectionnable (format correspondant à $format)
 * @property string $maxDate Date maximum sélectionnable (format correspondant à $format)
 * @property bool $autoApply Applique automatiquement dès la sélection (défaut : false)
 * @property bool $showRanges Affiche les raccourcis de plages prédéfinies (défaut : false)
 */
#[AsTwigComponent('FormFieldDatepicker', template: 'components/form_field_datepicker.html.twig')]
class FormFieldDatepickerComponent
{
    public string $id = '';
    public string $name = '';
    public string $label = '';
    public string $placeholder = '';
    public string $value = '';
    public bool $required = false;
    public bool $disabled = false;
    public string $help = '';
    public string $error = '';

    public bool $singleDate = false;
    public string $opens = 'right';
    public string $drops = 'down';
    public string $format = 'DD/MM/YYYY';
    public string $separator = ' — ';
    public string $minDate = '';
    public string $maxDate = '';
    public bool $autoApply = false;
    public bool $showRanges = false;

    #[PostMount]
    public function postMount(): void
    {
        if ('' === $this->id) {
            $this->id = 'drp_' . substr(uniqid(), -8);
        }
    }
}
