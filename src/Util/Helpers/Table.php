<?php

namespace App\Util\Helpers;

use Doctrine\Common\Collections\Collection;

/** Utilitaires de manipulation de tableaux et collections Doctrine. */
class Table
{
    /**
     * Accède à une valeur imbriquée dans un tableau via une notation pointée (ex: "user.address.city").
     * Retourne null si un niveau intermédiaire est absent ou n'est pas un tableau.
     *
     * @param string $path Chemin pointé
     * @param mixed[] $values Tableau source
     */
    public static function getValueInArrayByPath(string $path, array $values): mixed
    {
        $pathPart = explode('.', $path);
        if (1 == count($pathPart)) {
            if (array_key_exists($path, $values)) {
                return $values[$path];
            }

            return null;
        }
        $part = array_shift($pathPart);
        if (array_key_exists($part, $values) && is_array($values[$part])) {
            return self::getValueInArrayByPath(implode('.', $pathPart), $values[$part]);
        }

        return null;
    }

    /** Retire toutes les occurrences de $value dans $array et réindexe le tableau. */
    public static function removeElementOnArray(array $array, mixed $value): array
    {
        return array_values(array_filter($array, function ($item) use ($value) {
            return $item !== $value;
        }));
    }

    /**
     * Fusionne les éléments de $from dans $to (Collection Doctrine).
     * Les clés numériques sont ajoutées via add(), les clés string via set().
     *
     * @param Collection<int|string, mixed> $from
     * @param Collection<int|string, mixed> $to
     */
    public static function mergeArrayCollection(Collection $from, Collection $to): void
    {
        foreach ($from as $key => $item) {
            if (is_numeric($key)) {
                $to->add($item);
            } else {
                $to->set($key, $item);
            }
        }
    }

    /** Retourne true si $key existe dans $data avec une valeur non-null et non vide. */
    public static function isDefinedInArray(array $data, string $key): bool
    {
        if (!array_key_exists($key, $data)) {
            return false;
        }
        if (null === $data[$key]) {
            return false;
        }
        if ('' === $data[$key]) {
            return false;
        }

        return true;
    }

    /**
     * Vérifie si $value est présente dans $values par comparaison stricte.
     * Si $valueNormalized est false, normalise d'abord $value via Text::normalize().
     */
    public static function matchValueInArray($value, array $values, bool $valueNormalized = true): bool
    {
        if (!$valueNormalized) {
            $value = Text::normalize($value);
        }
        foreach ($values as $v) {
            if ($v === $value) {
                return true;
            }
        }

        return false;
    }
}
