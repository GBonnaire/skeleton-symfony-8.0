<?php

namespace App\Util\Enum;

use BackedEnum;
use ReflectionEnumBackedCase;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Utilitaires pour les BackedEnum : noms, valeurs, traductions.
 * À utiliser sur un enum backed (string ou int).
 */
trait EnumTrait
{
    /** @return string[] Noms de toutes les cases */
    public static function names(): array
    {
        return array_column(self::cases(), 'name');
    }

    /** @return string[] Valeurs de toutes les cases */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /** @return string[] Tableau associatif valeur => nom */
    public static function array(): array
    {
        return array_combine(self::values(), self::names());
    }

    /** Indique si une valeur existe parmi les cases. */
    public static function containValue(string $value): bool
    {
        return \in_array($value, self::values());
    }

    /** Indique si un nom existe parmi les cases. */
    public static function containName(string $name): bool
    {
        return \in_array($name, self::names());
    }

    /**
     * Traduit la case courante via l'attribut #[EnumTranslation] si présent,
     * sinon utilise le nom de la case comme clé de traduction.
     */
    public function trans(TranslatorInterface $translator, ?string $locale = null): string
    {
        $reflection = new ReflectionEnumBackedCase($this, $this->name);
        $attributes = $reflection->getAttributes(Attribute\EnumTranslation::class);

        if (empty($attributes)) {
            return $translator->trans($this->name, locale: $locale);
        }

        return $translator->trans($attributes[0]->newInstance()->key, domain: $attributes[0]->newInstance()->domain, locale: $locale);
    }

    /**
     * Retourne un tableau indexé par libellé traduit vers la case enum.
     *
     * @return mixed[]
     */
    public static function casesTranslated(?TranslatorInterface $translator = null, ?string $domainTranslation = null): array
    {
        $constantsTranslated = self::getConstants($translator, $domainTranslation);

        return array_combine($constantsTranslated, self::cases());
    }

    /**
     * Retourne un tableau indexé par libellé traduit vers valeur brute.
     * Utile pour alimenter des choices de formulaire Symfony.
     *
     * @return string[]
     */
    public static function getFormValues(?TranslatorInterface $translator = null, ?string $domainTranslation = null): array
    {
        $constants = self::getConstants();
        $constantsTranslated = self::getConstants($translator, $domainTranslation);

        return array_combine($constantsTranslated, $constants);
    }

    /**
     * Résout une case depuis son nom ; tente tryFrom() en fallback.
     * Retourne null si introuvable.
     */
    public static function fromName(string $name): ?BackedEnum
    {
        $data = array_combine(self::names(), self::values());
        if (\array_key_exists($name, $data)) {
            return self::from($data[$name]);
        }

        return self::tryFrom($name);
    }

    /**
     * Retourne les libellés des cases : traduits si un translator est fourni,
     * sinon les valeurs brutes.
     *
     * @return string[]
     */
    private static function getConstants(?TranslatorInterface $translator = null, ?string $domainTranslation = null): array
    {
        if (null != $translator) {
            if (null == $domainTranslation) {
                $constants = self::cases();

                $constantsTranslated = [];
                foreach ($constants as $constant) {
                    $constantsTranslated[] = $constant->trans($translator);
                }
            } else {
                $constants = self::values();

                $constantsTranslated = [];
                foreach ($constants as $constant) {
                    $constantsTranslated[] = $translator->trans($constant, [], $domainTranslation);
                }
            }

            return $constantsTranslated;
        }

        return self::values();
    }
}
