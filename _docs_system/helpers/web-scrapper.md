# Helper — WebScrapper

**Fichier :** `src/Util/Helpers/WebScrapper.php`  
**Namespace :** `App\Util\Helpers`  
**Dépendances :** `DOMDocument`, cURL, `Web`

Utilitaires de scraping HTTP : vérification d'accessibilité, extraction d'images, liens sociaux, métadonnées et contenu HTML.  
Utilise cURL avec un User-Agent navigateur pour limiter les blocages.

---

## Constantes

| Constante | Valeur |
|-----------|--------|
| `USERAGENT` | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 …` |
| `HTTP_HEADERS` | Accept, Accept-Encoding (deflate/gzip), Accept-Language (fr), Cache-Control, Connection, Content-type |

---

## Méthodes

### `isUrlReachable(string $url, bool $isRetry = false): bool`

Vérifie qu'une URL est accessible via cURL (timeout 5s).

**Conditions d'acceptation :**
- Code HTTP < 300, réponse non vide → `true`
- Code HTTP 403 dont le corps ne contient **pas** `"forbidden"` → `true` (certains CDN retournent 403 sur User-Agent inconnu)

Retente automatiquement une fois en cas d'échec. Le paramètre `$isRetry` empêche la récursion infinie.

Les URLs commençant par `//` sont automatiquement préfixées de `https:`.

```php
WebScrapper::isUrlReachable('https://example.com');  // true/false
```

---

### `extractSocialMediaLinks(string $url_or_body): array<string, string[]>`

Extrait les liens vers les réseaux sociaux depuis une URL ou un corps HTML brut.

**Si `$url_or_body` commence par `http`**, effectue une requête cURL pour récupérer le HTML.  
**Sinon**, traite directement `$url_or_body` comme du HTML.

**Réseaux détectés :** Facebook, Twitter (twitter.com & x.com), Instagram, LinkedIn, YouTube, Pinterest, TikTok, Snapchat, Reddit, Tumblr, Medium, Discord, Telegram, WhatsApp, GitHub, Vimeo, Twitch, Threads.

**Retour :** tableau `["NomRéseau" => ["https://...", ...]]` — seuls les liens avec un chemin non-trivial (`/`) sont inclus.

```php
$links = WebScrapper::extractSocialMediaLinks('https://company.com');
// [
//   "LinkedIn" => ["https://linkedin.com/company/acme"],
//   "Twitter"  => ["https://twitter.com/acme"],
// ]
```

---

### `extractImagesLinks(string $url): string`

Tente d'extraire l'URL de l'image représentative d'une page web.

**Ordre de priorité :**
1. Balise `<meta property="og:image">` ou `msapplication-TileImage` ou `itemprop="image"`
2. Icônes `<link rel="icon">` (la plus grande par `sizes`)
3. Première `<img>` dont le `src` est accessible

Si aucune image n'est trouvée sur l'URL cible, réessaie sur :
- la racine du domaine
- `www.` + domaine

Retourne `''` si aucune image accessible n'est trouvée.

```php
WebScrapper::extractImagesLinks('https://example.com/about');
// "https://example.com/og-image.jpg" (exemple)
```

---

### `extractMetaData(string $url, string $tagName, string $attributeName = ''): string`

Extrait la valeur d'un attribut (ou le `nodeValue`) d'une balise `<meta>` identifiée par son `name`.

```php
WebScrapper::extractMetaData('https://example.com', 'description', 'content');
// "Description de la page…"

WebScrapper::extractMetaData('https://example.com', 'author');
// Valeur du nodeValue de la balise meta[name="author"]
```

---

### `getKeywordsInMetaFromUrl(string $url): array`

Extrait la liste des mots-clés depuis la balise `<meta name="keywords">`.  
Splitte sur `,`, trim chaque mot-clé et filtre les vides.

```php
WebScrapper::getKeywordsInMetaFromUrl('https://example.com');
// ['php', 'symfony', 'web']
```

---

### `extractBodyDataOfUrl(string $url, ?array $filtersTag = null): string`

Extrait le **texte brut** du `<body>` d'une URL (scripts, styles et templates supprimés).

**Paramètres :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `$url` | `string` | URL à scraper |
| `$filtersTag` | `string[]\|null` | Balises à conserver (`null` = tout le texte) |

**Encodage :** auto-détecté et converti en UTF-8 (supporte ISO-8859-1 et Windows-1252).

```php
WebScrapper::extractBodyDataOfUrl('https://example.com');
// Texte brut de toute la page

WebScrapper::extractBodyDataOfUrl('https://example.com', ['h1', 'h2', 'p']);
// Texte uniquement des balises h1, h2 et p
```

---

### `extractBodyHTML(string $url): string`

Retourne le **HTML brut du `<body>`** (scripts, styles et templates supprimés).  
Gère l'encodage et le double-encodage UTF-8 via `fixUtf8Encoding()`.

```php
WebScrapper::extractBodyHTML('https://example.com');
// "<body>...(HTML nettoyé)...</body>"
```

---

### `extractDomHTML(string $url): ?DOMDocument`

Retourne un `DOMDocument` parsé depuis une URL.  
Retourne `null` en cas d'échec HTTP (code ≥ 300) ou de réponse vide.  
Injecte une déclaration UTF-8 avant parsing pour garantir l'encodage.

```php
$dom = WebScrapper::extractDomHTML('https://example.com');
if ($dom !== null) {
    $title = $dom->getElementsByTagName('title')->item(0)?->nodeValue;
}
```

---

## Notes techniques

- Toutes les méthodes cURL utilisent `CURLOPT_SSL_VERIFYHOST = false` et `CURLOPT_SSL_VERIFYPEER = false` (accepte les certificats auto-signés).
- Timeout cURL : **5 secondes** par requête.
- `extractBodyHTML()` et `extractDomHTML()` utilisent `CURLOPT_ENCODING = ''` pour gérer automatiquement gzip/deflate.
- Le parsing DOMDocument est silencieux (`@$dom->loadHTML(...)`) pour ignorer les erreurs HTML malformé.
