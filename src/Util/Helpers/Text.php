<?php

namespace App\Util\Helpers;

/** Utilitaires de manipulation et de normalisation de chaînes de caractères. */
class Text
{
    /** Convertit une chaîne en snake_case. */
    public static function convertToSnakeCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $result = strtolower($input[0]);

        for ($i = 1; $i < strlen($input); $i++) {
            if (ctype_upper($input[$i])) {
                $result .= '_' . strtolower($input[$i]);
            } else {
                $result .= $input[$i];
            }
        }

        return $result;
    }

    /** Convertit une chaîne en camelCase. */
    public static function convertToCamelCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/[-_\s]+/', ' ', $input);
        $words = explode(' ', $input);

        $result = strtolower($words[0]);
        for ($i = 1; $i < count($words); $i++) {
            $result .= ucfirst(strtolower($words[$i]));
        }

        return $result;
    }

    /** Convertit une chaîne en PascalCase. */
    public static function convertToPascalCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/[-_\s]+/', ' ', $input);
        $words = explode(' ', $input);

        $result = '';
        foreach ($words as $word) {
            $result .= ucfirst(strtolower($word));
        }

        return $result;
    }

    /** Convertit une chaîne en kebab-case. Gère le passage depuis camelCase/PascalCase. */
    public static function convertToKebabCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/([a-z])([A-Z])/', '$1-$2', $input);
        $input = preg_replace('/[_\s]+/', '-', $input);

        return strtolower($input);
    }

    /** Convertit une chaîne en SCREAMING_SNAKE_CASE. */
    public static function convertToScreamingSnakeCase(string $input): string
    {
        return strtoupper(self::convertToSnakeCase($input));
    }

    /** Convertit une chaîne en SCREAMING-KEBAB-CASE. */
    public static function convertToScreamingKebabCase(string $input): string
    {
        return strtoupper(self::convertToKebabCase($input));
    }

    /** Convertit une chaîne en dot.case. Gère le passage depuis camelCase/PascalCase. */
    public static function convertToDotCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/([a-z])([A-Z])/', '$1.$2', $input);
        $input = preg_replace('/[-_\s]+/', '.', $input);

        return strtolower($input);
    }

    /** Convertit une chaîne en path/case. Gère le passage depuis camelCase/PascalCase. */
    public static function convertToPathCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/([a-z])([A-Z])/', '$1/$2', $input);
        $input = preg_replace('/[-_\s]+/', '/', $input);

        return strtolower($input);
    }

    /** Convertit une chaîne en Train-Case. Gère le passage depuis camelCase/PascalCase. */
    public static function convertToTrainCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/([a-z])([A-Z])/', '$1-$2', $input);
        $input = preg_replace('/[_\s]+/', '-', $input);

        return implode('-', array_map('ucfirst', explode('-', strtolower($input))));
    }

    /** Convertit une chaîne en Title Case. */
    public static function convertToTitleCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/[-_]+/', ' ', $input);
        $input = preg_replace('/([a-z])([A-Z])/', '$1 $2', $input);

        return ucwords(strtolower($input));
    }

    /** Convertit une chaîne en Sentence case. */
    public static function convertToSentenceCase(string $input): string
    {
        if (empty($input)) {
            return $input;
        }

        $input = preg_replace('/[-_]+/', ' ', $input);
        $input = preg_replace('/([a-z])([A-Z])/', '$1 $2', $input);

        return ucfirst(strtolower($input));
    }

    /**
     * Détecte automatiquement le type de casse d'une chaîne.
     * Retourne une chaîne parmi : snake_case, camelCase, PascalCase, kebab-case,
     * SCREAMING_SNAKE_CASE, SCREAMING-KEBAB-CASE, dot.case, path/case,
     * Train-Case, Title Case, Sentence case, empty, unknown.
     */
    public static function detectCase(string $input): string
    {
        if (empty($input)) {
            return 'empty';
        }

        // SCREAMING_SNAKE_CASE
        if (preg_match('/^[A-Z][A-Z0-9_]*$/', $input) && false !== strpos($input, '_')) {
            return 'SCREAMING_SNAKE_CASE';
        }

        // SCREAMING-KEBAB-CASE
        if (preg_match('/^[A-Z][A-Z0-9-]*$/', $input) && false !== strpos($input, '-')) {
            return 'SCREAMING-KEBAB-CASE';
        }

        // snake_case
        if (preg_match('/^[a-z][a-z0-9_]*$/', $input) && false !== strpos($input, '_')) {
            return 'snake_case';
        }

        // kebab-case
        if (preg_match('/^[a-z][a-z0-9-]*$/', $input) && false !== strpos($input, '-')) {
            return 'kebab-case';
        }

        // dot.case
        if (false !== strpos($input, '.') && preg_match('/^[a-z][a-z0-9.]*$/', $input)) {
            return 'dot.case';
        }

        // path/case
        if (false !== strpos($input, '/') && preg_match('/^[a-z][a-z0-9/]*$/', $input)) {
            return 'path/case';
        }

        // PascalCase
        if (preg_match('/^[A-Z][a-zA-Z0-9]*$/', $input) && preg_match('/[A-Z]/', substr($input, 1))) {
            return 'PascalCase';
        }

        // camelCase
        if (preg_match('/^[a-z][a-zA-Z0-9]*$/', $input) && preg_match('/[A-Z]/', $input)) {
            return 'camelCase';
        }

        // Train-Case
        if (preg_match('/^[A-Z][a-zA-Z0-9-]*$/', $input) && false !== strpos($input, '-')) {
            return 'Train-Case';
        }

        // Title Case
        if (preg_match('/^[A-Z][a-zA-Z0-9\s]*$/', $input) && false !== strpos($input, ' ')) {
            return 'Title Case';
        }

        // Sentence case
        if (preg_match('/^[A-Z][a-z0-9\s]*$/', $input) && false !== strpos($input, ' ')) {
            return 'Sentence case';
        }

        return 'unknown';
    }

    /** Supprime les emojis Unicode (bloc Emoticons et autres symboles). */
    public static function removeEmoji(string $text): string
    {
        return preg_replace('/([\x{0001F000}-\x{0001FAFF}])/mu', '', $text);
    }

    /** Remplace les caractères accentués par leurs équivalents ASCII. */
    public static function removeAccentuations(string $value): string
    {
        $table = [
            'Š' => 'S', 'š' => 's', 'Đ' => 'Dj', 'đ' => 'dj', 'Ž' => 'Z', 'ž' => 'z', 'Č' => 'C', 'č' => 'c', 'Ć' => 'C', 'ć' => 'c',
            'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A', 'Æ' => 'A', 'Ç' => 'C', 'È' => 'E', 'É' => 'E',
            'Ê' => 'E', 'Ë' => 'E', 'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I', 'Ñ' => 'N', 'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O',
            'Õ' => 'O', 'Ö' => 'O', 'Ø' => 'O', 'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U', 'Ý' => 'Y', 'Þ' => 'B', 'ß' => 'Ss',
            'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a', 'æ' => 'a', 'ç' => 'c', 'è' => 'e', 'é' => 'e',
            'ê' => 'e', 'ë' => 'e', 'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i', 'ð' => 'o', 'ñ' => 'n', 'ò' => 'o', 'ó' => 'o',
            'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o', 'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ÿ' => 'y', 'ý' => 'y', 'þ' => 'b',
            'Ŕ' => 'R', 'ŕ' => 'r',
        ];

        return strtr(html_entity_decode($value), $table);
    }

    /**
     * Remplace les caractères accentués, spéciaux et symboles monétaires par des équivalents ASCII
     * ou les supprime (ponctuation, caractères non alphanumériques).
     */
    public static function removeNonAlphaChar(string $value): string
    {
        $table = [
            'Š' => 'S', 'š' => 's', 'Đ' => 'Dj', 'đ' => 'dj', 'Ž' => 'Z', 'ž' => 'z', 'Č' => 'C', 'č' => 'c', 'Ć' => 'C', 'ć' => 'c',
            'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A', 'Æ' => 'A', 'Ç' => 'C', 'È' => 'E', 'É' => 'E',
            'Ê' => 'E', 'Ë' => 'E', 'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I', 'Ñ' => 'N', 'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O',
            'Õ' => 'O', 'Ö' => 'O', 'Ø' => 'O', 'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U', 'Ý' => 'Y', 'Þ' => 'B', 'ß' => 'Ss',
            'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a', 'æ' => 'a', 'ç' => 'c', 'è' => 'e', 'é' => 'e',
            'ê' => 'e', 'ë' => 'e', 'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i', 'ð' => 'o', 'ñ' => 'n', 'ò' => 'o', 'ó' => 'o',
            'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o', 'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ÿ' => 'y', 'ý' => 'y', 'þ' => 'b',
            'Ŕ' => 'R', 'ŕ' => 'r',
            '€' => 'E', '$' => 'S', '£' => 'L',
            '¨' => '', '^' => '', '°' => '', '?' => '', '!' => '', '#' => '', '&' => '', "'" => '', '"' => '',
            '%' => '', '(' => '', ')' => '', '{' => '', '}' => '', '[' => '', ']' => '', '*' => '', '=' => '',
            '/' => '', '\\' => '', ',' => '', '<' => '', '>' => '', '|' => '', '-' => '', ' ' => ' ', "\u{201C}" => '', "\u{201D}" => '',
            "\u{2018}" => '', "\u{2019}" => '', '.' => '', ';' => '', '`' => '', '§' => '', '@' => 'a', '+' => '', ':' => '', '»' => '',
        ];

        return strtr(html_entity_decode($value), $table);
    }

    /**
     * Normalise une chaîne : supprime accents, emojis, caractères non-alphanumériques
     * et retourne en minuscules. Utilisé pour les comparaisons insensibles à la casse et aux accents.
     */
    public static function normalize(string $value): string
    {
        if (!is_string($value)) {
            return $value;
        }

        $value_prepared = self::removeNonAlphaChar($value);
        $value_text = self::removeAccentuations($value_prepared);
        $value_normalize = self::removeEmoji($value_text);
        $value_normalize = preg_replace('/[^a-zA-Z0-9]/', '', $value_normalize);

        return strtolower(trim($value_normalize));
    }

    /**
     * Découpe un texte en mots en supprimant emojis et caractères non-alphanumériques
     * (hors lettres accentuées et tirets).
     *
     * @return string[]
     */
    public static function getWords(string $text): array
    {
        $textWithoutEmoji = self::removeEmoji($text);
        $textSanitized = preg_replace('/[^a-zA-Z0-9À-ú\-]/', ' ', $textWithoutEmoji);

        return explode(' ', $textSanitized);
    }

    /**
     * Corrige un double-encodage UTF-8 courant (ex: "Ã©" → "é").
     * À utiliser sur des chaînes mal encodées issues de sources externes.
     */
    public static function decodeString(string $value): string
    {
        $search = ['Ã', 'Ã', 'Ã', 'Ã‰', 'Ã©', 'Ãˆ', 'Ãª', 'Ã«', 'Ã¯', 'ÃŽ', 'Ã®', 'Ã´', 'Ã˜', 'Ã¹', 'Ã»', 'Ã›', 'Ã¼', 'ÃŸ', 'Ã¢', 'ÃÄ', 'Ã‡', 'Ã'];
        $replace = ['Ç', 'É', 'Ê', 'É', 'é', 'È', 'ê', 'ë', 'ï', 'Î', 'î', 'ô', 'Ø', 'ù', 'û', '›', 'ü', 'ß', 'â', 'Ä', 'Ç', 'à'];

        $decodedString = str_replace($search, $replace, $value);

        return $decodedString;
    }

    /**
     * Convertit les séquences d'échappement Unicode (\uXXXX) et hexadécimales (\xXX)
     * en caractères UTF-8 lisibles.
     */
    public static function convertUtf8ToANSI(string $value): string
    {
        $value = html_entity_decode(preg_replace('/\\\\u([\da-fA-F]{4})/', '&#x\1;', $value));
        $value = preg_replace_callback('/\\\\x([\da-fA-F]{2})/', function ($matches) {
            return mb_convert_encoding(chr(hexdec($matches[1])), 'UTF-8', 'ISO-8859-1');
        }, $value);
        $value = str_replace("\u009", 'œ', $value);
        $value = preg_replace('/\\\\u([\da-fA-F]{1,4})/', '', $value);

        return $value;
    }
}
