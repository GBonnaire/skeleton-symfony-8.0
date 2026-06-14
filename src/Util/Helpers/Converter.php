<?php

namespace App\Util\Helpers;

use App\Util\Helpers\HelpersEnum\DataTypeEnum;

/** Utilitaires de conversion de types et de formatage de listes textuelles. */
class Converter
{
    /**
     * Convertit une valeur vers le type cible.
     * Si $convertNull est false et que $value est null, retourne null sans conversion.
     * Les chaînes et tableaux sont extraits via Number::getNumberMax pour INTEGER/FLOAT.
     */
    public static function convertTo(mixed $value, DataTypeEnum $type, bool $convertNull = false): mixed
    {
        if (!$convertNull && is_null($value)) {
            return null;
        }

        return match ($type) {
            DataTypeEnum::INTEGER => match (true) {
                is_null($value) => 0,
                is_string($value) => Number::getNumberMax($value),
                is_array($value) => Number::getNumberMax(implode('|', $value)),
                default => (int) $value,
            },

            DataTypeEnum::FLOAT => match (true) {
                is_null($value) => 0.0,
                is_string($value) => Number::getNumberMax($value, true),
                is_array($value) => Number::getNumberMax(implode('|', $value), true),
                default => (float) $value,
            },

            DataTypeEnum::STRING => match (true) {
                is_null($value) => '',
                is_array($value) => implode(',', $value),
                is_bool($value) => $value ? 'Yes' : 'No',
                default => (string) $value,
            },

            DataTypeEnum::TEXT => match (true) {
                is_null($value) => '',
                is_array($value) => self::generateList($value),
                is_bool($value) => $value ? 'Yes' : 'No',
                default => (string) $value,
            },

            DataTypeEnum::BOOLEAN => match (true) {
                is_null($value) => false,
                is_string($value) => (in_array(strtolower(trim($value)), ['true', '1', 'yes', 'on', 'y'], true)
                    || (is_numeric($value) && 0.0 !== (float) $value)),
                default => (bool) $value,
            },

            DataTypeEnum::ARRAY => match (true) {
                is_null($value) => [],
                is_array($value) => $value,
                is_string($value) && str_contains($value, ',') => array_map('trim', explode(',', $value)),
                default => [$value],
            },
        };
    }

    /**
     * Génère une liste textuelle à partir d'un tableau.
     * Si $method est fourni, appelle cette méthode (ou "get"+ucfirst) sur chaque élément objet.
     *
     * @param string[] $items
     * @param bool $withNumber Préfixe chaque ligne d'un numéro ordinal
     * @param string $method Nom de méthode à appeler sur les objets du tableau
     */
    public static function generateList(array $items, bool $withNumber = false, string $method = ''): string
    {
        if (0 == count($items)) {
            return '';
        }
        $num = 1;

        if ('' == $method) {
            if ($withNumber) {
                foreach ($items as $index => $item) {
                    $items[$index] = $num . '. ' . $item;
                    $num++;
                }
            } else {
                foreach ($items as $index => $item) {
                    $items[$index] = ' - ' . $item;
                }
            }
        } else {
            if ($withNumber) {
                foreach ($items as $index => $item) {
                    if (method_exists($item, $method)) {
                        $items[$index] = $num . '. ' . call_user_func([$item, $method]);
                        $num++;
                    } elseif (method_exists($item, 'get' . ucfirst(strtolower($method)))) {
                        $items[$index] = $num . '. ' . call_user_func([$item, 'get' . ucfirst(strtolower($method))]);
                        $num++;
                    }
                }
            } else {
                foreach ($items as $index => $item) {
                    if (method_exists($item, $method)) {
                        $items[$index] = ' - ' . call_user_func([$item, $method]);
                    } elseif (method_exists($item, 'get' . ucfirst(strtolower($method)))) {
                        $items[$index] = ' - ' . call_user_func([$item, 'get' . ucfirst(strtolower($method))]);
                    }
                }
            }
        }

        return implode("\n", $items);
    }
}
