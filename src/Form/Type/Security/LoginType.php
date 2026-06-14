<?php

namespace App\Form\Type\Security;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Email;
use Symfony\Component\Validator\Constraints\NotBlank;

class LoginType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('_username', EmailType::class, [
                'label' => 'form_security.email.label',
                'attr' => ['name' => '_username'],
                'constraints' => [
                    new NotBlank(
                        message: 'form_security.email.error.required'
                    ),
                    new Email(
                        message: 'form_security.email.error.invalid'
                    ),
                ],
            ])
            ->add('_password', PasswordType::class, [
                'label' => 'form_security.password.label',
                'attr' => ['autocomplete' => 'current-password'],
                'constraints' => [
                    new NotBlank(
                        message: 'form_security.password.error.required'
                    ),
                ],
                'mapped' => false,
            ])
            ->add('_remember_me', CheckboxType::class, [
                'label' => 'form_security.remember_me.label',
                'required' => false,
                'mapped' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => true,
            'translation_domain' => 'form_security',
            // keep default form CSRF for standard protection; security login additionally expects _csrf_token which we'll add in the template
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'account_security';
    }
}
