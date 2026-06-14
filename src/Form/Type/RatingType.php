<?php

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\IntegerType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Champ de notation par étoiles piloté par le composant Rating JS.
 *
 * Usage dans un FormType PHP :
 *
 * ```php
 * use App\Form\Type\RatingType;
 *
 * $builder->add('note', RatingType::class, [
 *     'label'  => 'Votre note',
 *     'number' => 5,
 * ]);
 *
 * // Lecture seule (affichage d'une note existante)
 * $builder->add('note', RatingType::class, [
 *     'label'           => 'Note du praticien',
 *     'number'          => 5,
 *     'rating_readonly' => true,
 *     'show_score'      => true,
 * ]);
 * ```
 *
 * @option int  $number          Nombre d'étoiles (défaut : 5)
 * @option bool $show_score      Affiche le score textuel ex: "3/5" (défaut : false)
 * @option bool $rating_readonly Désactive la sélection (défaut : false)
 */
class RatingType extends AbstractType
{
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['number'] = $options['number'];
        $view->vars['show_score'] = $options['show_score'];
        $view->vars['rating_readonly'] = $options['rating_readonly'];
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'number' => 5,
            'show_score' => false,
            'rating_readonly' => false,
        ]);

        $resolver->setAllowedTypes('number', 'int');
        $resolver->setAllowedTypes('show_score', 'bool');
        $resolver->setAllowedTypes('rating_readonly', 'bool');
    }

    public function getParent(): string
    {
        return IntegerType::class;
    }

    public function getBlockPrefix(): string
    {
        return 'rating';
    }
}
