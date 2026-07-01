<?php

namespace App\Twig\Extension;

use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Attribute\AsTwigFilter;

class TranslationExtension
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    /**
     * Traduit un message flash (ou un tableau de messages) via le domaine « flash ».
     *
     * @param mixed        $messages   Clé de traduction, BackedEnum ou tableau (récursif) de ceux-ci
     * @param string[]     $parameters Paramètres de traduction
     */
    #[AsTwigFilter('transFlash')]
    public function transFlash(mixed $messages, array $parameters = [], string $domain = 'flash'): mixed
    {
        if (\is_array($messages)) {
            foreach ($messages as $key => $message) {
                $messages[$key] = $this->transFlash($message, $parameters, $domain);
            }

            return $messages;
        }

        if ($messages instanceof \BackedEnum) {
            return $this->translator->trans((string) $messages->value, $parameters, $domain);
        }

        if (\is_string($messages)) {
            return $this->translator->trans($messages, $parameters, $domain);
        }

        return $messages;
    }
}
