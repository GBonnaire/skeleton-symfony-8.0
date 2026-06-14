<?php

declare(strict_types=1);

namespace App\Form\Type\Security;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\NotCompromisedPassword;
use Symfony\Component\Validator\Constraints\Regex;

class RegistrationFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'label' => 'security.register.email_label',
                'constraints' => [
                    new NotBlank(
                        message: 'security.register.email_required'
                    ),
                    new Email(
                        message: 'security.register.email_invalid'
                    ),
                ],
                'attr' => [
                    'autocomplete' => 'email',
                    'placeholder' => 'security.register.email_placeholder',
                ],
            ])
            ->add('plainPassword', RepeatedType::class, [
                'type' => PasswordType::class,
                'mapped' => false,
                'first_options' => [
                    'label' => 'security.register.password_label',
                    'constraints' => [
                        new NotBlank(
                            message: 'security.register.password_required'
                        ),
                        new Length(
                            min: 8,
                            max: 24,
                            minMessage: 'security.register.password_min_length',
                            maxMessage: 'security.register.password_max_length',
                        ),
                        new Regex(
                            pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/',
                            message: 'security.register.password_complexity',
                        ),
                        new NotCompromisedPassword(
                            message: 'security.register.password_compromised'
                        ),
                    ],
                    'attr' => [
                        'autocomplete' => 'new-password',
                        'placeholder' => '••••••••',
                    ],
                ],
                'second_options' => [
                    'label' => 'security.register.password_confirm_label',
                    'attr' => [
                        'autocomplete' => 'new-password',
                        'placeholder' => '••••••••',
                    ],
                ],
                'invalid_message' => 'security.register.password_mismatch',
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
            'validation_groups' => ['Default', 'register'],
            'translation_domain' => 'form_security',
        ]);
    }
}
