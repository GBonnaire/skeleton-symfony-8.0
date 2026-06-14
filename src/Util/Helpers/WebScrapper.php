<?php

namespace App\Util\Helpers;

use DOMDocument;

/**
 * Utilitaires de scraping HTTP : accessibilité, extraction de contenu HTML,
 * métadonnées, images et liens vers les réseaux sociaux.
 * Utilise cURL avec un User-Agent navigateur pour limiter les blocages.
 */
class WebScrapper
{
    public const string USERAGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

    public const array HTTP_HEADERS = [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding: deflate gzip',
        'Accept-Language:fr-FR;q=0.9,fr;q=0.8',
        'Cache-Control: max-age=0',
        'Connection: keep-alive',
        'Content-type: text/html; charset=UTF-8',
    ];

    /**
     * Vérifie qu'une URL est accessible via cURL (timeout 5s).
     * Retente une fois en cas d'échec ($isRetry empêche la récursion infinie).
     * Accepte les réponses 403 dont le corps ne contient pas "forbidden".
     */
    public static function isUrlReachable(string $url, bool $isRetry = false): bool
    {
        if (str_starts_with($url, '//')) {
            $url = 'https:' . $url;
        }
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_COOKIESESSION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, self::USERAGENT);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, self::HTTP_HEADERS);

        $html = curl_exec($ch);

        curl_close($ch);

        if (curl_getinfo($ch, CURLINFO_HTTP_CODE) < 300 && false !== $html && '' !== trim($html)) {
            return true;
        } elseif (403 == curl_getinfo($ch, CURLINFO_HTTP_CODE) && false !== $html && false === stripos('forbidden', $html)) {
            return true;
        }

        if (!$isRetry) {
            return self::isUrlReachable($url, true);
        }

        return false;
    }

    /**
     * Extrait les liens vers les réseaux sociaux depuis une URL ou un corps HTML brut.
     * Retourne un tableau indexé par nom de réseau (ex: "Facebook" => ["https://..."]).
     *
     * @return array<string, string[]>
     */
    public static function extractSocialMediaLinks(string $url_or_body): array
    {
        if (str_starts_with($url_or_body, 'http')) {
            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url_or_body);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_USERAGENT, self::USERAGENT);
            curl_setopt($ch, CURLOPT_COOKIESESSION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_HTTPHEADER, self::HTTP_HEADERS);

            $html = curl_exec($ch);

            curl_close($ch);
        } else {
            $html = $url_or_body;
        }

        if (false === $html || '' == trim($html)) {
            return [];
        }

        $socialNetworks = [
            'facebook' => 'Facebook',
            'twitter' => 'Twitter',
            'x.com' => 'Twitter',
            'instagram' => 'Instagram',
            'linkedin' => 'LinkedIn',
            'youtube' => 'YouTube',
            'pinterest' => 'Pinterest',
            'tiktok' => 'TikTok',
            'snapchat' => 'Snapchat',
            'reddit' => 'Reddit',
            'tumblr' => 'Tumblr',
            'medium' => 'Medium',
            'discord' => 'Discord',
            'telegram' => 'Telegram',
            'whatsapp' => 'WhatsApp',
            'github' => 'GitHub',
            'vimeo' => 'Vimeo',
            'twitch' => 'Twitch',
            'threads' => 'Threads',
        ];

        $results = [];
        $dom = new DOMDocument();

        @$dom->loadHTML($html);

        $links = $dom->getElementsByTagName('a');

        foreach ($links as $link) {
            $href = $link->getAttribute('href');

            if (str_starts_with($href, 'http://') || str_starts_with($href, 'https://')) {
                $parsedUrl = parse_url($href);

                if (isset($parsedUrl['host']) && isset($parsedUrl['path']) && '/' !== $parsedUrl['path']) {
                    $host = $parsedUrl['host'];

                    foreach ($socialNetworks as $domain => $networkName) {
                        if (false !== stripos($host, $domain)) {
                            if (!isset($results[$networkName])) {
                                $results[$networkName] = [];
                            }

                            if (!in_array($href, $results[$networkName])) {
                                $results[$networkName][] = $href;
                            }

                            break; // Go next link
                        }
                    }
                }
            }
        }

        return $results;
    }

    /**
     * Tente d'extraire l'URL de l'image représentative d'une page web.
     * Priorité : balise og:image > icônes <link rel="icon"> (plus grande) > première <img>.
     * En cas d'échec, réessaie sur le domaine racine puis sur www.domaine.
     */
    public static function extractImagesLinks(string $url): string
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, self::USERAGENT);
        curl_setopt($ch, CURLOPT_COOKIESESSION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, self::HTTP_HEADERS);

        $html = curl_exec($ch);

        curl_close($ch);

        if (200 !== curl_getinfo($ch, CURLINFO_HTTP_CODE)) {
            return '';
        }

        if (false !== $html && '' !== trim($html)) {
            $dom = new DOMDocument();
            @$dom->loadHTML($html); // Utilisation du @ pour supprimer les erreurs HTML

            $metas = $dom->getElementsByTagName('meta');
            if ($metas->count() > 0) {
                foreach ($metas as $meta) {
                    if ('og:image' == strtolower($meta->getAttribute('property')) || 'msapplication-tileimage' == strtolower($meta->getAttribute('name')) || 'image' == strtolower($meta->getAttribute('itemprop'))) {
                        $urlImage = Web::getAbsoluteUrl($meta->getAttribute('content'), $url);
                        if (self::isUrlReachable($urlImage)) {
                            return $urlImage;
                        }
                    }
                }
            }

            $icons = $dom->getElementsByTagName('link');
            $iconFoundUrl = '';
            $iconFoundSize = 0;
            if ($icons->count() > 0) {
                foreach ($icons as $icon) {
                    if (false !== stripos(strtolower($icon->getAttribute('rel')), 'icon') && '' != $icon->getAttribute('href')) {
                        if ('' == $icon->getAttribute('sizes')) {
                            $urlImage = $icon->getAttribute('href');
                            if (self::isUrlReachable($urlImage)) {
                                return $urlImage;
                            }
                        } elseif ('any' == $icon->getAttribute('sizes')) {
                            $urlImage = Web::getAbsoluteUrl($icon->getAttribute('href'), $url);
                            if (self::isUrlReachable($urlImage)) {
                                return $urlImage;
                            }
                        } else {
                            $size = intval(explode('x', $icon->getAttribute('sizes'))[0]);
                            if ('' != $size && $size > $iconFoundSize) {
                                $urlImage = $icon->getAttribute('href');
                                if (false === str_starts_with(strtolower($urlImage), 'http')) {
                                    $urlImage = trim($url, '/') . '/' . $urlImage;
                                }
                                if (self::isUrlReachable($urlImage)) {
                                    $iconFoundSize = $size;
                                    $iconFoundUrl = $urlImage;
                                }
                            }
                        }
                    }
                }

                if ('' != $iconFoundUrl) {
                    return $iconFoundUrl;
                }
            }

            $imgs = $dom->getElementsByTagName('img');
            if ($imgs->count() > 0) {
                foreach ($imgs as $img) {
                    if (str_starts_with($img->getAttribute('src'), 'data:image/svg')) {
                        continue;
                    }
                    $urlImage = Web::getAbsoluteUrl($img->getAttribute('src'), $url);
                    if (self::isUrlReachable($urlImage)) {
                        return $urlImage;
                    }
                }
            }
        }

        if ($url !== Web::extractDomain($url, true)) {
            return self::extractImagesLinks(Web::extractDomain($url, true));
        }
        $infoUrl = parse_url($url);
        if (!str_starts_with(strtolower($infoUrl['host']), 'www.')) {
            return self::extractImagesLinks($infoUrl['scheme'] . '://www.' . $infoUrl['host'] . ($infoUrl['path'] ?? ''));
        }

        return '';
    }

    /**
     * Extrait la valeur d'un attribut (ou le nodeValue) d'une balise <meta> identifiée par son name.
     * Retourne une chaîne vide si la balise est introuvable.
     */
    public static function extractMetaData(string $url, string $tagName, string $attributeName = ''): string
    {
        $tagName = strtolower($tagName);
        $attributeName = strtolower($attributeName);

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, self::USERAGENT);
        curl_setopt($ch, CURLOPT_COOKIESESSION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, self::HTTP_HEADERS);

        $html = curl_exec($ch);

        curl_close($ch);

        if (false !== $html && '' !== trim($html)) {
            $dom = new DOMDocument();
            @$dom->loadHTML($html); // Utilisation du @ pour supprimer les erreurs HTML
            $metaTags = $dom->getElementsByTagName('meta');

            foreach ($metaTags as $tag) {
                if (strtolower($tag->getAttribute('name')) == $tagName) {
                    if ('' != $attributeName) {
                        return $tag->getAttribute($attributeName);
                    }

                    return $tag->nodeValue;
                }
            }
        }

        return '';
    }

    /**
     * Extrait le texte brut du <body> d'une URL (scripts, styles et templates supprimés).
     * Si $filtersTag est fourni, ne conserve que le texte des balises correspondantes.
     * Gère l'encodage automatiquement (UTF-8, ISO-8859-1, Windows-1252).
     *
     * @param string[]|null $filtersTag Balises HTML à conserver (null = tout le texte)
     */
    public static function extractBodyDataOfUrl(string $url, ?array $filtersTag = null): string
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, self::USERAGENT);
        curl_setopt($ch, CURLOPT_COOKIESESSION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, self::HTTP_HEADERS);

        $htmlPage = curl_exec($ch);

        if (false === $htmlPage) {
            dump("getBodyDataOfUrl : Error retrieve data on $url : " . curl_error($ch));
        }

        // Détecter et normaliser l'encodage
        $encoding = mb_detect_encoding($htmlPage, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
        if ($encoding && 'UTF-8' !== $encoding) {
            $htmlPage = mb_convert_encoding($htmlPage, 'UTF-8', $encoding);
        }

        // Nettoyer les caractères problématiques courants
        $html = str_replace(["\xC2\xA0", 'â€™', 'â€', 'â€'], [' ', "'", '–', '—'], $htmlPage);

        curl_close($ch);

        if (curl_getinfo($ch, CURLINFO_HTTP_CODE) < 300 && false !== $html && '' !== trim($html)) {
            $dom = new DOMDocument('1.0', 'UTF-8');
            @$dom->loadHTML($html);

            $body = $dom->getElementsByTagName('body');
            if (0 < $body->length) {
                $body = $body->item(0);
                $bodyHtml = $dom->savehtml($body);

                if (null == $bodyHtml) {
                    return '';
                }

                // Clean body HTML
                $bodyHtml = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i', '', $bodyHtml);
                $bodyHtml = preg_replace('/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/i', '', $bodyHtml);
                $bodyHtml = preg_replace('/<template\b[^<]*(?:(?!<\/template>)<[^<]*)*<\/template>/i', '', $bodyHtml);

                if (null == $filtersTag) {
                    $result = trim(str_replace(["\t\n", "\t", "\n\n"], '', strip_tags($bodyHtml)));
                } else {
                    $htmlCleaned = strip_tags($bodyHtml, $filtersTag);

                    preg_match_all('/<[^>]+>([^<]+)<\/[^>]+>/', $htmlCleaned, $matches);

                    $result = '';
                    foreach ($matches[1] as $text) {
                        $result .= $text . PHP_EOL;
                    }

                    $result = trim(str_replace(["\t\n", "\t", "\n\n"], '', $result));
                }

                return $result;
            }
        }

        return '';
    }

    /**
     * Retourne le HTML brut du <body> (scripts, styles et templates supprimés).
     * Gère l'encodage et le double-encodage UTF-8 via fixUtf8Encoding().
     */
    public static function extractBodyHTML(string $url): string
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, self::USERAGENT);
        curl_setopt($ch, CURLOPT_COOKIESESSION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, self::HTTP_HEADERS);

        // Important : gérer l'encodage automatiquement
        curl_setopt($ch, CURLOPT_ENCODING, ''); // Gère automatiquement gzip/deflate

        $htmlPage = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (false === $htmlPage) {
            dump("extractBodyDataOfUrl : Error retrieve data on $url : " . curl_error($ch));
            curl_close($ch);

            return '';
        }

        curl_close($ch);

        if ($httpCode >= 300 || '' === trim($htmlPage)) {
            return '';
        }

        // Détecter et normaliser l'encodage
        $encoding = mb_detect_encoding($htmlPage, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
        if ($encoding && 'UTF-8' !== $encoding) {
            $htmlPage = mb_convert_encoding($htmlPage, 'UTF-8', $encoding);
        }

        // Nettoyer les caractères problématiques courants
        $htmlPage = self::fixUtf8Encoding($htmlPage);

        // Parser avec DOMDocument
        $dom = new DOMDocument('1.0', 'UTF-8');
        // Charger en spécifiant UTF-8 dans le HTML
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $htmlPage, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        // Supprimer le nœud XML ajouté
        foreach ($dom->childNodes as $node) {
            if (XML_PI_NODE === $node->nodeType) {
                $dom->removeChild($node);
                break;
            }
        }

        $body = $dom->getElementsByTagName('body');
        if (0 === $body->length) {
            return '';
        }

        $bodyHtml = $dom->saveHTML($body->item(0));

        if (false === $bodyHtml) {
            return '';
        }

        // Nettoyer le HTML
        $bodyHtml = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $bodyHtml);
        $bodyHtml = preg_replace('/<style\b[^>]*>.*?<\/style>/is', '', $bodyHtml);
        $bodyHtml = preg_replace('/<template\b[^>]*>.*?<\/template>/is', '', $bodyHtml);

        return $bodyHtml;
    }

    /**
     * Retourne le DOMDocument parsé depuis une URL, ou null en cas d'échec HTTP.
     * Gère l'encodage et injecte une déclaration UTF-8 avant parsing.
     */
    public static function extractDomHTML(string $url): ?DOMDocument
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_USERAGENT, self::USERAGENT);
        curl_setopt($ch, CURLOPT_COOKIESESSION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, self::HTTP_HEADERS);

        // Important : gérer l'encodage automatiquement
        curl_setopt($ch, CURLOPT_ENCODING, ''); // Gère automatiquement gzip/deflate

        $htmlPage = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (false === $htmlPage) {
            dump("extractBodyDataOfUrl : Error retrieve data on $url : " . curl_error($ch));
            curl_close($ch);

            return null;
        }

        curl_close($ch);

        if ($httpCode >= 300 || '' === trim($htmlPage)) {
            return null;
        }

        // Détecter et normaliser l'encodage
        $encoding = mb_detect_encoding($htmlPage, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
        if ($encoding && 'UTF-8' !== $encoding) {
            $htmlPage = mb_convert_encoding($htmlPage, 'UTF-8', $encoding);
        }

        // Nettoyer les caractères problématiques courants
        $htmlPage = self::fixUtf8Encoding($htmlPage);

        // Parser avec DOMDocument
        $dom = new DOMDocument('1.0', 'UTF-8');
        // Charger en spécifiant UTF-8 dans le HTML
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $htmlPage, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        // Supprimer le nœud XML ajouté
        foreach ($dom->childNodes as $node) {
            if (XML_PI_NODE === $node->nodeType) {
                $dom->removeChild($node);
                break;
            }
        }

        return $dom;
    }

    /**
     * @return string[]
     */
    public static function getKeywordsInMetaFromUrl(string $url): array
    {
        $keywordsString = self::extractMetaData($url, 'keywords', 'content');
        $keywords = explode(',', $keywordsString);
        $keywords = array_map('trim', $keywords);
        $keywords = array_filter($keywords);

        return $keywords;
    }

    /**
     * Corrige les corruptions UTF-8 fréquentes dues à un double-encodage
     * (ex: "Ã©" → "é", "â€™" → "'"). À appliquer avant le parsing HTML.
     */
    private static function fixUtf8Encoding(string $text): string
    {
        // Table de correspondance des corruptions UTF-8 courantes
        $replacements = [
            // Espaces et ponctuation
            'â' => ' ',           // espace insécable corrompu
            'Â ' => ' ',
            'â€™' => "'",         // apostrophe
            'â€˜' => "'",
            'â€"' => '—',         // tiret cadratin
            'â€¦' => '…',         // points de suspension
            'â€œ' => '"',         // guillemets
            'â€' => '"',
            'â€¢' => '•',         // puce

            // Caractères accentués courants
            'Ã©' => 'é',
            'Ã¨' => 'è',
            'Ãª' => 'ê',
            'Ã ' => 'à',
            'Ã¢' => 'â',
            'Ã§' => 'ç',
            'Ã´' => 'ô',
            'Ã»' => 'û',
            'Ã¯' => 'ï',
            'Ã«' => 'ë',

            // Majuscules accentuées
            'Ã‰' => 'É',
            'Ãˆ' => 'È',
            'Ã€' => 'À',
            'Ã‡' => 'Ç',
        ];

        $text = str_replace(array_keys($replacements), array_values($replacements), $text);

        return $text;
    }
}
