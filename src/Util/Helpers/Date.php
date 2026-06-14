<?php

namespace App\Util\Helpers;

use DateTime;
use InvalidArgumentException;

/** Utilitaires de manipulation et de parsing de dates. */
class Date
{
    /**
     * Crée un DateTime depuis une chaîne absolue (ex: "2024-01-15")
     * ou relative (ex: "+3 months", "-1 year").
     */
    public static function create(string $date): DateTime
    {
        if (!self::isRelative($date)) {
            return new DateTime($date);
        }

        $today = new DateTime('today');

        return self::modify($today, $date);
    }

    /**
     * Applique un modificateur relatif à une date en corrigeant les débordements de mois
     * (ex: 31 janvier + 1 mois → 28/29 février plutôt que 3 mars).
     *
     * @throws InvalidArgumentException si le modificateur est invalide
     */
    public static function modify(
        DateTime $date,
        string $modifier,
    ): DateTime {
        $expectedMonth = self::getExpectedMonth($date, $modifier);
        $result = $date->modify($modifier);

        if (false === $result) {
            throw new InvalidArgumentException(sprintf('Modificateur invalide : "%s"', $modifier));
        }

        if (null !== $expectedMonth && (int) $result->format('n') !== $expectedMonth) {
            $result = $result->modify('last day of last month');
        }

        return $result;
    }

    /**
     * Retourne true si la date est un jour férié en France.
     *
     * @param bool $unemployed Si true, les jours fériés sont ceux des employés, sinon ceux des chômeurs
     */
    public static function isPublicHolidayInFrance(DateTime $dateTest, bool $unemployed = false): bool
    {
        $date = $dateTest->getTimestamp();
        $ref = $unemployed ? 'unemployed' : 'employed';

        $year = $dateTest->format('Y');

        if (defined('HOLIDAYS_' . $ref . '_' . $year)) {
            $holidays = constant('HOLIDAYS_' . $ref . '_' . $year);
        } else {
            $easterDate = easter_date($year);
            $easterDay = intval(date('j', $easterDate));
            $easterMonth = intval(date('n', $easterDate));
            $easterYear = intval(date('Y', $easterDate));

            $holidays = [
                // Dates fixes
                mktime(0, 0, 0, 1, 1, $year),  // 1er janvier
                mktime(0, 0, 0, 5, 1, $year),  // Fête du travail
                mktime(0, 0, 0, 5, 8, $year),  // Victoire des alliés
                mktime(0, 0, 0, 7, 14, $year),  // Fête nationale
                mktime(0, 0, 0, 8, 15, $year),  // Assomption
                mktime(0, 0, 0, 11, 1, $year),  // Toussaint
                mktime(0, 0, 0, 11, 11, $year),  // Armistice
                mktime(0, 0, 0, 12, 25, $year),  // Noel
            ];

            // Dates variables
            $holidays[] = mktime(0, 0, 0, $easterMonth, $easterDay + 1, $easterYear); // Lundi de paque
            $holidays[] = mktime(0, 0, 0, $easterMonth, $easterDay + 39, $easterYear); // Ascension
            if (false == $unemployed) {
                $holidays[] = mktime(0, 0, 0, $easterMonth, $easterDay + 50, $easterYear); // Pentecote
            }

            define('HOLIDAYS_' . $ref . '_' . $year, $holidays);
        }

        return in_array($date, $holidays);
    }

    /**
     * Est dimanche
     * @param DateTime $dateTest
     * @return bool
     */
    public static function isSunday(DateTime $dateTest): bool
    {
        $weekDay = $dateTest->format('w');

        return 0 == $weekDay;
    }

    /**
     * est Weekend
     * @param DateTime $dateTest
     * @return bool
     */
    public static function isWeekend(DateTime $dateTest): bool
    {
        $weekDay = $dateTest->format('w');

        return 0 == $weekDay || 6 == $weekDay;
    }

    /** Retourne true si la chaîne est un modificateur relatif (ex: "+3 months"). */
    private static function isRelative(string $date): bool
    {
        return (bool) preg_match('/^[+-]\d+\s+\w+$/i', trim($date));
    }

    /**
     * Calcule le mois attendu après ajout de N mois, pour détecter les débordements.
     * Retourne null si le modificateur n'est pas un ajout de mois.
     */
    private static function getExpectedMonth(
        DateTime $date,
        string $modifier,
    ): ?int {
        if (!preg_match('/^([+-]\d+)\s+months?$/i', trim($modifier), $matches)) {
            return null;
        }

        $delta = (int) $matches[1];
        $totalMonths = ((int) $date->format('Y') * 12 + (int) $date->format('n') - 1) + $delta;
        $expected = ($totalMonths % 12) + 1;

        return $expected <= 0 ? $expected + 12 : $expected;
    }

    /**
     * Teste si une date est au format ISO (YYYY-MM-DD).
     *
     * @return bool
     */
    public static function isDateISO(string $date)
    {
        if (preg_match('/^([0-9]{4})-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/', $date)) {
            return true;
        }

        return false;
    }

    /**
     * Convertit une date dans n'importe quel format reconnu vers ISO (YYYY-MM-DD).
     * Si $date est un entier < 100, il est interprété comme un âge en années.
     *
     * @param string $format Format source (détecté automatiquement si vide)
     *
     * @return string Date ISO ou chaîne vide si la conversion échoue
     */
    public static function stringToDateISO(string $date, string $format = ''): string
    {
        if (intval($date) . '' === $date . '' && intval($date) < 100) {
            // Is number age
            $date = self::generateBirthdayDate(intval($date));
        }

        if (false !== strpos($date, 'T')) {
            $partD = explode('T', $date);
            $date = $partD[0];
        }

        if ('' === $format) {
            $format = self::dateExtractFormat($date);
        }

        $newDate = DateTime::createFromFormat($format, $date);
        if (false === $newDate) {
            return '';
        }

        return $newDate->format('Y-m-d');
    }

    /**
     * Retourne le nombre de mois entre 2 dates.
     * Si $dateEnd est null, utilise la date du jour. Gère l'ordre des dates.
     *
     * @return int
     */
    public static function getCountMonthsBetweenDates(string $dateStart, ?string $dateEnd = null)
    {
        if (!self::isDateISO($dateStart)) {
            $dateStart = self::stringToDateISO($dateStart);
        }
        $start = new DateTime($dateStart);

        if (null == $dateEnd) {
            $end = new DateTime('NOW');
        } else {
            if (!self::isDateISO($dateEnd)) {
                $dateEnd = self::stringToDateISO($dateEnd);
            }
            $end = new DateTime($dateEnd);
        }

        if ($end < $start) {
            $tmp = $end;
            $end = $start;
            $start = $tmp;
            $tmp = null;
        }

        $diff = $start->diff($end);

        return $diff->y * 12 + $diff->m;
    }

    /**
     * Détecte et retourne le format PHP (ex: "Y-m-d", "d/m/Y") d'une chaîne de date.
     * Retourne $null si aucun format n'est reconnu.
     *
     * @param string $null Valeur retournée si le format est inconnu
     */
    public static function dateExtractFormat(string $d, string $null = ''): string
    {
        if (false !== strpos($d, 'T')) {
            $partD = explode('T', $d);
            $d = $partD[0];
        }

        // check Day -> (0[1-9]|[1-2][0-9]|3[0-1])
        // check Month -> (0[1-9]|1[0-2])
        // check Year -> [0-9]{4} or \d{4}
        $patterns = [
            '/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3,8}Z\b/' => 'Y-m-d\TH:i:s.u\Z', // format DATE ISO 8601
            '/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\b/' => 'Y-m-d\TH:i:s', // format DATE ISO 8601
            '/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}\b/' => 'Y-m-d\TH:i', // format DATE ISO 8601
            '/\b\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])\b/' => 'Y-m-d',
            '/\b\d{4}-(0?[1-9]|[1-2][0-9]|3[0-1])-(0?[1-9]|1[0-2])\b/' => 'Y-d-m',
            '/\b(0?[1-9]|[1-2][0-9]|3[0-1])-(0?[1-9]|1[0-2])-\d{4}\b/' => 'd-m-Y',
            '/\b(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])-\d{4}\b/' => 'm-d-Y',

            '/\b\d{4}\/(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\b/' => 'Y/d/m',
            '/\b\d{4}\/(0?[1-9]|1[0-2])\/(0?[1-9]|[1-2][0-9]|3[0-1])\b/' => 'Y/m/d',
            '/\b(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}\b/' => 'd/m/Y',
            '/\b(0?[1-9]|1[0-2])\/(0?[1-9]|[1-2][0-9]|3[0-1])\/\d{4}\b/' => 'm/d/Y',

            '/\b\d{4}\.(0?[1-9]|1[0-2])\.(0?[1-9]|[1-2][0-9]|3[0-1])\b/' => 'Y.m.d',
            '/\b\d{4}\.(0?[1-9]|[1-2][0-9]|3[0-1])\.(0?[1-9]|1[0-2])\b/' => 'Y.d.m',
            '/\b(0?[1-9]|[1-2][0-9]|3[0-1])\.(0?[1-9]|1[0-2])\.\d{4}\b/' => 'd.m.Y',
            '/\b(0?[1-9]|1[0-2])\.(0?[1-9]|[1-2][0-9]|3[0-1])\.\d{4}\b/' => 'm.d.Y',

            '/\b\d{4}\s(0?[1-9]|1[0-2])\s(0?[1-9]|[1-2][0-9]|3[0-1])\b/' => 'Y m d',
            '/\b\d{4}\s(0?[1-9]|[1-2][0-9]|3[0-1])\s(0?[1-9]|1[0-2])\b/' => 'Y d m',
            '/\b(0?[1-9]|[1-2][0-9]|3[0-1])\s(0?[1-9]|1[0-2])\s\d{4}\b/' => 'd m Y',
            '/\b(0?[1-9]|1[0-2])\s(0?[1-9]|[1-2][0-9]|3[0-1])\s\d{4}\b/' => 'm d Y',

            '/\b(0?[1-9]|[1-2][0-9]|3[0-1])(0?[1-9]|1[0-2])\d{4}\b/' => 'dmY',
            '/\b\d{4}(0?[1-9]|1[0-2])(0?[1-9]|[1-2][0-9]|3[0-1])\b/' => 'Ymd',

            // for 24-hour | hours seconds
            '/\b(?:2[0-3]|[01][0-9]):[0-5][0-9](:[0-5][0-9])\.\d{3,6}\b/' => 'H:i:s.u',
            '/\b(?:2[0-3]|[01][0-9]):[0-5][0-9](:[0-5][0-9])\b/' => 'H:i:s',
            '/\b(?:2[0-3]|[01][0-9]):[0-5][0-9]\b/' => 'H:i',

            // for 12-hour | hours seconds
            '/\b(?:1[012]|0[0-9]):[0-5][0-9](:[0-5][0-9])\.\d{3,6}\b/' => 'h:i:s.u',
            '/\b(?:1[012]|0[0-9]):[0-5][0-9](:[0-5][0-9])\b/' => 'h:i:s',
            '/\b(?:1[012]|0[0-9]):[0-5][0-9]\b/' => 'h:i',

            '/\.\d{3}\b/' => '.v',
        ];
        $d = preg_replace(array_keys($patterns), array_values($patterns), $d);

        return preg_match('/\d/', $d) ? $null : $d;
    }

    /**
     * Génère une date approximative à partir d'un nombre de mois en arrière
     * (décalage aléatoire de 2 à 27 jours pour éviter le 1er du mois).
     *
     * @param int $month Nombre de mois à soustraire depuis aujourd'hui
     * @param int|null $firstDay Jour fixe du mois à forcer (null = jour aléatoire)
     */
    public static function generateDateFromCountMonths(int $month, ?int $firstDay = null): string
    {
        $birthday = new DateTime('now');
        $birthday->modify('-' . $month . ' months');
        $birthday->modify('-' . (rand(2, 27) . ' days'));
        if (null == $firstDay) {
            $birthday->format('Y-m-d');
        }

        return $birthday->format('Y-m-' . $firstDay);
    }

    /**
     * Calcule l'âge en années à partir d'une date de naissance.
     * Si $date est un entier pur, il est retourné tel quel (déjà un âge).
     *
     * @param string $date Date de naissance (format auto-détecté)
     * @param string $format Format source (détecté automatiquement si vide)
     *
     * @return int Âge en années, ou -1 si la date est invalide
     */
    public static function getAge(string $date, string $format = ''): int
    {
        if (intval($date) . '' === '' . $date) {
            return $date;
        }
        if (false !== strpos($date, 'T')) {
            $partDate = explode('T', $date);
            $date = $partDate[0];
        }
        if ('' === $format) {
            $format = self::dateExtractFormat($date);
        }
        if ('' === $format) {
            return -1;
        }
        $age = DateTime::createFromFormat($format, $date);

        if (false !== $age) {
            $age = $age->diff(new DateTime('now'))->y;
        } else {
            return -1;
        }

        return $age;
    }

    /**
     * Génère une date de naissance fictive cohérente avec l'âge fourni
     * (décalage aléatoire de 2 à 360 jours pour plus de réalisme).
     *
     * @param int $age Âge en années
     */
    public static function generateBirthdayDate(int $age): string
    {
        $birthday = new DateTime('now');
        $birthday->modify('-' . $age . ' years');
        $birthday->modify('-' . (rand(2, 360) . ' days'));

        return $birthday->format('Y-m-d');
    }
}
