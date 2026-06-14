<?php

namespace App\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\FormType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;

class ConditionalFieldExtension extends AbstractTypeExtension
{
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        if (array_key_exists('conditional-field', $view->vars['attr']) && $view->vars['attr']['conditional-field']) {
            if (!array_key_exists('style', $view->vars['row_attr'])) {
                $view->vars['row_attr']['style'] = '';
            }
            $style = explode(';', $view->vars['row_attr']['style']);
            if (!in_array('display: none', $style)) {
                $style[] = 'display: none';
                $view->vars['row_attr']['style'] = ltrim(implode(';', $style) . ';', ';');
            }
            unset($view->vars['attr']['conditional-field']);
        }
    }

    public static function getExtendedTypes(): iterable
    {
        return [FormType::class];
    }
}
