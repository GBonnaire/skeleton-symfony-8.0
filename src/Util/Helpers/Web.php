<?php

namespace App\Util\Helpers;

/** Utilitaires de manipulation d'URLs et de domaines. */
class Web
{
    /**
     * Extrait le domaine de chaque URL du tableau ; retire les entrées null.
     *
     * @param array<?string> $urls
     *
     * @return string[]
     */
    public static function extractDomainFromUrls(array $urls): array
    {
        foreach ($urls as $index => $url) {
            if (is_string($url)) {
                $urls[$index] = self::extractDomain($url);
            } else {
                unset($urls[$index]);
            }
        }

        return $urls;
    }

    /**
     * Extrait le domaine d'une URL (sans chemin ni paramètres).
     * Si $keepProtocol est false, supprime aussi le préfixe "www.".
     *
     * @param bool $keepProtocol Conserve le schéma (http:// / https://) dans le résultat
     */
    public static function extractDomain(string $url, bool $keepProtocol = false): string
    {
        $domainSanitize = strtolower($url);
        $protocol = '';
        if ($keepProtocol) {
            if (false !== strpos($domainSanitize, '://')) {
                $protocol = explode('://', $domainSanitize)[0] . '://';
            } else {
                $protocol = 'https://';
            }
            $domainSanitize = str_replace(['http://', 'https://'], '', $domainSanitize);
        } else {
            $domainSanitize = str_replace(['http://', 'https://', 'www.'], '', $domainSanitize);
        }

        $partOfDomaine = explode('/', $domainSanitize);

        return $protocol . $partOfDomaine[0];
    }

    /**
     * Construit une URL absolue depuis un chemin relatif et l'URL de la page source.
     * Gère les chemins déjà absolus, les chemins depuis la racine (/) et les chemins relatifs.
     */
    public static function getAbsoluteUrl(string $path, string $urlSource): string
    {
        $path = strtolower($path);
        if ('http://' == substr($path, 0, 7) || 'https://' == substr($path, 0, 8)) {
            return $path;
        }

        if ('/' == substr($path, 0, 1)) {
            $domain = self::extractDomain($urlSource, true);

            return trim($domain, '/') . $path;
        }

        return trim($urlSource, '/') . '/' . $path;
    }

    /**
     * Compare deux domaines en ignorant le préfixe "www." et l'extension TLD.
     * Utilise similar_text() avec un seuil de 95% pour tolérer les variantes mineures.
     */
    public static function compareDomain(string $domainA, string $domainB): bool
    {
        $domainA = strtolower($domainA);
        $domainB = strtolower($domainB);
        if (str_starts_with($domainA, 'www.')) {
            $domainA = substr($domainA, strlen('www.'));
        }
        if (str_starts_with($domainB, 'www.')) {
            $domainB = substr($domainB, strlen('www.'));
        }
        $domainAParts = explode('.', $domainA);
        $extDomainA = array_pop($domainAParts);
        $domainA = implode('.', $domainAParts);
        $domainBParts = explode('.', $domainB);
        $extDomainB = array_pop($domainBParts);
        $domainB = implode('.', $domainBParts);
        similar_text($domainA, $domainB, $pct);

        if ($pct >= 95) {
            return true;
        }

        return false;
    }

    /** Retourne true si $domainA correspond à l'un des domaines du tableau (via compareDomain). */
    public static function inDomains(string $domainA, array $domains): bool
    {
        foreach ($domains as $domain) {
            if (self::compareDomain($domain, $domainA)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Ajoute ou remplace un paramètre dans la query string d'une URL.
     * Reconstruit l'URL complète en préservant tous ses composants.
     *
     * @return string
     */
    public static function addParamOnURL(string $url, string $paramName, $paramValue)
    {
        $parsedUrl = parse_url($url);

        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $queryParams);
        } else {
            $queryParams = [];
        }

        $queryParams[$paramName] = $paramValue;

        $parsedUrl['query'] = http_build_query($queryParams);

        $scheme = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] . '://' : '';
        $host = isset($parsedUrl['host']) ? $parsedUrl['host'] : '';
        $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
        $user = isset($parsedUrl['user']) ? $parsedUrl['user'] : '';
        $pass = isset($parsedUrl['pass']) ? ':' . $parsedUrl['pass'] : '';
        $pass = ($user || $pass) ? "$pass@" : '';
        $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';
        $query = isset($parsedUrl['query']) ? '?' . $parsedUrl['query'] : '';
        $fragment = isset($parsedUrl['fragment']) ? '#' . $parsedUrl['fragment'] : '';

        return "$scheme$user$pass$host$port$path$query$fragment";
    }
}
