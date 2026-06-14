<?php

namespace App\Util\Helpers;

/** Utilitaires de normalisation de numéros de téléphone. */
class PhoneNumber
{
    /**
     * Normalise un numéro de téléphone au format France (10 chiffres, préfixe 0).
     * Gère les préfixes +33, 0033 et les variantes avec ou sans indicatif pays.
     *
     * @param string $value Numéro brut
     * @param string $separator Séparateur entre groupes (ex: " ", ".", "")
     * @param string $countrycode Indicatif à substituer au "0" initial (ex: "+33")
     */
    public static function phoneNumberFr(string $value, string $separator = '', string $countrycode = ''): string
    {
        if ('' == $value) {
            return $value;
        }

        $value_prepared = str_replace('+33', '0', $value);
        if ('33' === substr($value_prepared, 0, 2)) {
            $value_prepared = '0' . substr($value_prepared, 2);
        }
        $value_normalize = preg_replace('/[^0-9]/', '', $value_prepared);

        if ('00' == substr($value_normalize, 0, 2)) {
            return self::phoneNumberFr(substr($value_normalize, 1), $separator, $countrycode);
        }

        $value_normalize = str_pad($value_normalize, 10, '0', STR_PAD_LEFT);

        if (strlen($value_normalize) >= 11) {
            $value_normalize = substr($value_normalize, -10);
        }

        if ('0' !== substr($value_normalize, 0, 1)) {
            $value_normalize = '0' . substr($value_normalize, 0, 9);
        }

        if (10 == strlen($value_normalize)) {
            $res = substr($value_normalize, 0, 2) . $separator;
            $res .= substr($value_normalize, 2, 2) . $separator;
            $res .= substr($value_normalize, 4, 2) . $separator;
            $res .= substr($value_normalize, 6, 2) . $separator;
            $res .= substr($value_normalize, 8, 2);

            if ('' != $countrycode) {
                $res = $countrycode . substr($res, 1);
            }

            return $res;
        }

        return $value;
    }

    /**
     * Normalise un numéro de téléphone au format Belgique (9 ou 10 chiffres).
     * Gère le préfixe +32.
     *
     * @param string $value Numéro brut
     * @param string $separator Séparateur entre groupes
     * @param string $countrycode Indicatif à substituer au "0" initial (ex: "+32")
     */
    public static function phoneNumberBe(string $value, string $separator = '', string $countrycode = ''): string
    {
        if ('' == $value) {
            return $value;
        }

        $value_prepared = str_replace('+32', '0', $value);
        $value_normalize = preg_replace('/[^0-9]/', '', $value_prepared);

        if ('00' == substr($value_normalize, 0, 2)) {
            $value_normalize = substr($value_normalize, 1);
        }

        if (9 == strlen($value_normalize)) {
            $res = substr($value_normalize, 0, 2) . $separator;
            $res .= substr($value_normalize, 2, 3) . $separator;
            $res .= substr($value_normalize, 5, 2) . $separator;
            $res .= substr($value_normalize, 7, 2);

            if ('' != $countrycode) {
                $res = $countrycode . substr($res, 1);
            }

            return $res;
        } elseif (10 == strlen($value_normalize)) {
            $res = substr($value_normalize, 0, 4) . $separator;
            $res .= substr($value_normalize, 4, 2) . $separator;
            $res .= substr($value_normalize, 6, 2) . $separator;
            $res .= substr($value_normalize, 8, 2);

            if ('' != $countrycode) {
                $res = $countrycode . substr($res, 1);
            }

            return $res;
        }

        return $value;
    }
}
