<?php

namespace App\Util\Helpers;

/** Utilitaires de génération de tokens et mots de passe sécurisés. */
class Password
{
    /**
     * Génère un token aléatoire.
     * Sans $chars : retourne $strength octets aléatoires en hexadécimal (longueur = $strength × 2).
     * Avec $chars : pioche $strength caractères dans le tableau fourni.
     *
     * @param int $strength Longueur / entropie du token
     * @param string[]|null $chars Jeu de caractères à utiliser (null = hex)
     *
     * @throws \Random\RandomException
     */
    public static function generateToken(int $strength = 32, ?array $chars = null): string
    {
        if (null != $chars) {
            $token = '';
            $countChar = \count($chars);
            for ($i = 0; $i < $strength; $i++) {
                $token .= $chars[random_int(0, $countChar - 1)];
            }

            return $token;
        }

        return bin2hex(random_bytes($strength));
    }

    /**
     * Génère un mot de passe respectant chaque catégorie de $charsPattern.
     * Un caractère de chaque catégorie est garanti, puis les positions sont mélangées.
     *
     * @param int $length Longueur totale du mot de passe
     * @param string[] $charsPattern Catégories de caractères ; au moins un caractère de chacune sera inclus
     */
    public static function generatePassword(
        int $length = 12,
        array $charsPattern = [
            'abcdefghijklmnopqrstuvwxyz',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            '0123456789',
            '!@#$%&*()-_=+;:,.?',
        ]): string
    {
        $password = '';

        if (!array_is_list($charsPattern)) {
            $charsPattern = array_values($charsPattern);
        }

        /* Add one representation of category */
        foreach ($charsPattern as $categoryOfChars) {
            $password .= $categoryOfChars[rand(0, \strlen($categoryOfChars) - 1)];
        }

        /* Add more random characters */
        for ($index = \strlen($password); $index < $length; $index++) {
            $indexChar = rand(0, \count($charsPattern) - 1);
            $password .= $charsPattern[$indexChar][rand(0, \strlen($charsPattern[$indexChar]) - 1)];
        }

        /* Randomize password chars */
        return str_shuffle($password);
    }
}
