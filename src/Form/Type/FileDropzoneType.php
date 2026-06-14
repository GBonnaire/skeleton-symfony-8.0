<?php

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Champ d'upload de fichiers avec zone de glisser-déposer (drag & drop).
 *
 * Hérite de FileType : la valeur est un UploadedFile (ou un tableau si multiple).
 * Les types MIME acceptés sont automatiquement déduits depuis la contrainte File/Image.
 * Le rendu est délégué au form theme via le bloc `file_dropzone_widget`.
 *
 * Usage dans un FormType PHP :
 *
 * ```php
 * use App\Form\Type\FileDropzoneType;
 * use Symfony\Component\Validator\Constraints\File;
 *
 * // Fichier unique
 * $builder->add('photo', FileDropzoneType::class, [
 *     'label'       => 'Photo de profil',
 *     'constraints' => [new File(['mimeTypes' => ['image/jpeg', 'image/png']])],
 * ]);
 *
 * // Plusieurs fichiers (jusqu'à 3)
 * $builder->add('documents', FileDropzoneType::class, [
 *     'label'    => 'Pièces jointes',
 *     'multiple' => true,
 *     'limit'    => 3,
 * ]);
 * ```
 *
 * @option bool     $multiple Autorise plusieurs fichiers (défaut : false)
 * @option int|null $limit    Nombre maximum de fichiers — null = 1 si !multiple, 5 si multiple
 */
class FileDropzoneType extends AbstractType
{
    public function buildView(FormView $view, FormInterface $form, array $options): void
    {
        $view->vars['multiple'] = $options['multiple'];
        $view->vars['limit'] = $options['limit'] ?? ($options['multiple'] ? 5 : 1);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'limit' => null,
        ]);

        $resolver->setAllowedTypes('limit', ['null', 'int']);
    }

    public function getParent(): string
    {
        return FileType::class;
    }

    public function getBlockPrefix(): string
    {
        return 'file_dropzone';
    }
}
