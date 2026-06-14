<?php

namespace App\Util\Helpers;

/** Utilitaires de formatage d'adresses postales. */
class Address
{
    /**
     * Normalise un code postal : supprime les non-chiffres, padde ou tronque à $length.
     *
     * @param string $zip Code postal brut
     * @param int $length Longueur cible (5 pour la France)
     */
    public static function zipcode(string $zip, int $length = 5): string
    {
        $value_prepared = preg_replace('/[^0-9]/', '', $zip);
        if (strlen($value_prepared) < $length) {
            $value_normalize = str_pad($value_prepared, $length, '0', STR_PAD_LEFT);
        } elseif (strlen($value_prepared) > $length) {
            $value_normalize = substr($value_prepared, 0, $length);
        } else {
            $value_normalize = $value_prepared;
        }

        return $value_normalize;
    }
}
