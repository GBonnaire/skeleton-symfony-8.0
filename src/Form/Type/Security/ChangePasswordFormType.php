<?php

declare(strict_types=1);

namespace App\Form\Type\Security;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class ChangePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        if ($options['require_current_password']) {
            $builder->add('currentPassword', PasswordType::class, [
                'label' => 'Mot de passe actuel',
                'mapped' => false,
                'attr' => [
                    'class' => 'input',
                    'placeholder' => 'Saisir votre mot de passe actuel',
                    'autocomplete' => 'current-password',
                ],
                'constraints' => [
                    new Assert\NotBlank(
                        message: 'change_password.current_password.not_blank',
                    ),
                ],
            ]);
        }

        $builder
            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'invalid_message' => 'change_password.plain_password.mismatch',
                'options' => [
                    'attr' => [
                        'class' => 'input',
                        'autocomplete' => 'new-password',
                    ],
                ],
                'first_options' => [
                    'label' => 'Nouveau mot de passe',
                    'attr' => [
                        'placeholder' => 'Saisir votre nouveau mot de passe',
                    ],
                ],
                'second_options' => [
                    'label' => 'Confirmer le nouveau mot de passe',
                    'attr' => [
                        'placeholder' => 'Confirmer votre nouveau mot de passe',
                    ],
                ],
                'mapped' => false,
                'constraints' => [
                    new Assert\NotBlank(
                        message: 'user.password.not_blank',
                    ),
                    new Assert\Length(
                        min: 6,
                        minMessage: 'user.password.min_length',
                        max: 4096,
                    ),
                ],
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'require_current_password' => true,
        ]);
        $resolver->setAllowedTypes('require_current_password', 'bool');
    }
}
