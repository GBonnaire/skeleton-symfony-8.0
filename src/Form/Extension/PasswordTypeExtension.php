<?php

namespace App\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\UX\StimulusBundle\Dto\StimulusAttributes;
use Twig\Environment;

class PasswordTypeExtension extends AbstractTypeExtension
{
    public function __construct(private Environment $twig)
    {
    }

    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $stimulusAttributes = new StimulusAttributes($this->twig);

        $strenghtMode = false;
        if (\array_key_exists('strenghtMode', $view->vars['attr']) && \in_array($view->vars['attr']['strenghtMode'], [true, 'true', 1, '1'])) {
            $strenghtMode = true;
        }

        $stimulusAttributes->addController('components/forms/password/password', ['strenghtMode' => $strenghtMode]);

        if ($strenghtMode) {
            $stimulusAttributes->addAction('components/forms/password/password', 'onChange', 'input');
        }

        $attr = $stimulusAttributes->toArray();
        $view->vars['attr'] = array_merge($view->vars['row_attr'], $attr);
    }

    public static function getExtendedTypes(): iterable
    {
        return [PasswordType::class];
    }
}
