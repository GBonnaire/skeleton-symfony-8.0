<?php

namespace App\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

class RowClassExtension extends AbstractTypeExtension
{
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $attr = ['class' => 'grid gap-2'];
        if (!isset($view->vars['row_attr'])) {
            $view->vars['row_attr'] = $attr;
        } elseif (isset($view->vars['row_attr']['class'])) {
            $classes = explode(' ', $view->vars['row_attr']['class']);
            $classesToAdd = explode(' ', $attr['class']);
            $classes = array_merge($classes, $classesToAdd);

            $view->vars['row_attr']['class'] = implode(' ', $classes);
        } else {
            $view->vars['row_attr'] = array_merge($view->vars['row_attr'], $attr);
        }
    }

    public static function getExtendedTypes(): iterable
    {
        return [FormType::class];
    }
}
