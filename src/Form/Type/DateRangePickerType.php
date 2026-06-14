<?php

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Champ de sélection de plage de dates (ou date unique) piloté par DateRangePicker.
 *
 * Hérite de TextType : la valeur stockée est une chaîne dans le format choisi.
 * Le rendu est délégué au form theme via le bloc `date_range_picker_widget`.
 *
 * Usage dans un FormType PHP :
 *
 * ```php
 * use App\Twig\Form\Type\DateRangePickerType;
 *
 * $builder->add('periode', DateRangePickerType::class, [
 *     'label'       => 'Période de surveillance',
 *     'show_ranges' => true,
 *     'required'    => false,
 * ]);
 *
 * // Date unique
 * $builder->add('date', DateRangePickerType::class, [
 *     'label'       => 'Date de début',
 *     'single_date' => true,
 *     'min_date'    => (new \DateTime())->format('d/m/Y'),
 * ]);
 * ```
 *
 * Options disponibles :
 *
 * @see TextType pour les options de base (label, help, required, disabled…)
 *
 * @option bool   $single_date  Mode date unique (défaut : false)
 * @option string $opens        Côté d'ouverture : 'left'|'center'|'right' (défaut : 'right')
 * @option string $drops        Sens d'ouverture : 'up'|'down'|'auto' (défaut : 'down')
 * @option string $format       Format moment.js (défaut : 'DD/MM/YYYY')
 * @option string $separator    Séparateur plage (défaut : ' — ')
 * @option string $min_date     Date minimum (au format $format)
 * @option string $max_date     Date maximum (au format $format)
 * @option bool   $auto_apply   Application automatique à la sélection (défaut : false)
 * @option bool   $show_ranges  Affiche les raccourcis de plages (défaut : false)
 */
class DateRangePickerType extends AbstractType
{
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['single_date'] = $options['single_date'];
        $view->vars['opens'] = $options['opens'];
        $view->vars['drops'] = $options['drops'];
        $view->vars['format'] = $options['format'];
        $view->vars['separator'] = $options['separator'];
        $view->vars['min_date'] = $options['min_date'];
        $view->vars['max_date'] = $options['max_date'];
        $view->vars['auto_apply'] = $options['auto_apply'];
        $view->vars['show_ranges'] = $options['show_ranges'];
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'single_date' => false,
            'opens' => 'right',
            'drops' => 'down',
            'format' => 'DD/MM/YYYY',
            'separator' => ' — ',
            'min_date' => '',
            'max_date' => '',
            'auto_apply' => false,
            'show_ranges' => false,
        ]);

        $resolver->setAllowedTypes('single_date', 'bool');
        $resolver->setAllowedTypes('auto_apply', 'bool');
        $resolver->setAllowedTypes('show_ranges', 'bool');
        $resolver->setAllowedValues('opens', ['left', 'center', 'right']);
        $resolver->setAllowedValues('drops', ['up', 'down', 'auto']);
    }

    public function getParent(): string
    {
        return TextType::class;
    }

    public function getBlockPrefix(): string
    {
        return 'date_range_picker';
    }
}
