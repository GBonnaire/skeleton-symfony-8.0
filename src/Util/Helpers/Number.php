<?php

namespace App\Util\Helpers;

/** Utilitaires de formatage et d'extraction de valeurs numériques. */
class Number
{
    /**
     * Formate un nombre avec un suffixe abrégé (K, M, B, T).
     * Supprime les zéros décimaux inutiles : "1.0K" → "1K".
     *
     * @param int|float $n
     * @param int $precision Nombre de décimales
     *
     * @return string
     */
    public static function numberFormatShort($n, $precision = 1)
    {
        if ($n < 900) {
            // 0 - 900
            $n_format = number_format($n, $precision);
            $suffix = '';
        } elseif ($n < 900000) {
            // 0.9k-850k
            $n_format = number_format($n / 1000, $precision);
            $suffix = 'K';
        } elseif ($n < 900000000) {
            // 0.9m-850m
            $n_format = number_format($n / 1000000, $precision);
            $suffix = 'M';
        } elseif ($n < 900000000000) {
            // 0.9b-850b
            $n_format = number_format($n / 1000000000, $precision);
            $suffix = 'B';
        } else {
            // 0.9t+
            $n_format = number_format($n / 1000000000000, $precision);
            $suffix = 'T';
        }

        if ($precision > 0) {
            $dotzero = '.' . str_repeat('0', $precision);
            $n_format = str_replace($dotzero, '', $n_format);
        }

        return $n_format . $suffix;
    }

    /**
     * Extrait le nombre minimum d'une chaîne pouvant contenir plusieurs valeurs
     * séparées par des caractères non-numériques (ex: "10-20 km" → 10).
     *
     * @param string $value Chaîne source
     * @param bool $isFloat Retourne un float si true, sinon un int
     */
    public static function getNumberMin(string $value, bool $isFloat = false): int|float
    {
        $value_prepared = strtolower($value);
        $value_normalize = str_replace(' ', '', $value_prepared);
        $value_normalize = preg_replace('/[^0-9.,]/', '_', $value_normalize);
        $value_normalize = str_replace('__', '_', $value_normalize);
        if (false !== strpos($value_normalize, '_')) {
            $values = explode('_', $value_normalize);
            foreach ($values as $i => $v) {
                if ('' == $v) {
                    unset($values[$i]);
                } else {
                    if ($isFloat) {
                        $values[$i] = floatval(str_replace(',', '.', $v));
                    } else {
                        $values[$i] = intval($v);
                    }
                }
            }
            if (0 == count($values)) {
                $min = 0;
            } else {
                $min = min($values);
            }
        } else {
            if ($isFloat) {
                $min = floatval(str_replace(',', '.', $value_normalize));
            } else {
                $min = intval($value_normalize);
            }
        }

        return $min;
    }

    /**
     * Extrait le nombre maximum d'une chaîne pouvant contenir plusieurs valeurs
     * séparées par des caractères non-numériques (ex: "10-20 km" → 20).
     *
     * @param string $value Chaîne source
     * @param bool $isFloat Retourne un float si true, sinon un int
     */
    public static function getNumberMax(string $value, bool $isFloat = false): int|float
    {
        $value_prepared = strtolower($value);
        $value_normalize = str_replace(' ', '', $value_prepared);
        $value_normalize = preg_replace('/[^0-9.,]/', '_', $value_normalize);
        $value_normalize = str_replace('__', '_', $value_normalize);
        if (false !== strpos($value_normalize, '_')) {
            $values = explode('_', $value_normalize);
            foreach ($values as $i => $v) {
                if ('' == $v) {
                    unset($values[$i]);
                } else {
                    if ($isFloat) {
                        $values[$i] = floatval(str_replace(',', '.', $v));
                    } else {
                        $values[$i] = intval($v);
                    }
                }
            }
            if (0 == count($values)) {
                $max = 0;
            } else {
                $max = max($values);
            }
        } else {
            if ($isFloat) {
                $max = floatval(str_replace(',', '.', $value_normalize));
            } else {
                $max = intval($value_normalize);
            }
        }

        return $max;
    }
}
