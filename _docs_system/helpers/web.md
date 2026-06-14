# Helper — Web

**Fichier :** `src/Util/Helpers/Web.php`  
**Namespace :** `App\Util\Helpers`

Utilitaires de manipulation d'URLs et de domaines.

---

## Méthodes

### `extractDomain(string $url, bool $keepProtocol = false): string`

Extrait le domaine d'une URL (sans chemin ni paramètres).

| `$keepProtocol` | Comportement |
|-----------------|--------------|
| `false` (défaut) | Supprime `http://`, `https://` et `www.` |
| `true` | Conserve le schéma (`http://` / `https://`) mais retire le chemin |

```php
Web::extractDomain('https://www.example.com/path?q=1');  // "example.com"
Web::extractDomain('https://www.example.com', true);      // "https://www.example.com"
Web::extractDomain('http://example.com/page');             // "example.com"
```

---

### `extractDomainFromUrls(array $urls): array`

Extrait le domaine de chaque URL du tableau, en retirant les entrées `null`.

```php
Web::extractDomainFromUrls(['https://example.com/a', null, 'http://test.org/b']);
// ['example.com', 'test.org']
```

---

### `getAbsoluteUrl(string $path, string $urlSource): string`

Construit une URL absolue depuis un chemin relatif et l'URL de la page source.

| Cas | Comportement |
|-----|--------------|
| `$path` commence par `http://` ou `https://` | Retourne `$path` tel quel |
| `$path` commence par `/` | Préfixe avec le domaine de `$urlSource` |
| Chemin relatif | Préfixe avec `$urlSource` + `/` |

```php
Web::getAbsoluteUrl('https://other.com/img.png', 'https://site.com');
// "https://other.com/img.png"

Web::getAbsoluteUrl('/images/logo.png', 'https://site.com/page');
// "https://site.com/images/logo.png"

Web::getAbsoluteUrl('logo.png', 'https://site.com/assets/');
// "https://site.com/assets/logo.png"
```

---

### `compareDomain(string $domainA, string $domainB): bool`

Compare deux domaines en ignorant `www.` et l'extension TLD.  
Utilise `similar_text()` avec un **seuil de 95%** pour tolérer les variantes mineures.

```php
Web::compareDomain('www.example.com', 'example.org');   // true  (même nom de domaine)
Web::compareDomain('example.com', 'totally-other.fr');  // false
```

---

### `inDomains(string $domainA, array $domains): bool`

Retourne `true` si `$domainA` correspond à l'un des domaines du tableau, via `compareDomain()`.

```php
Web::inDomains('www.example.com', ['example.org', 'test.net']);  // true
Web::inDomains('other.com', ['example.org', 'test.net']);         // false
```

---

### `addParamOnURL(string $url, string $paramName, mixed $paramValue): string`

Ajoute ou remplace un paramètre dans la query string d'une URL.  
Reconstruit l'URL complète en préservant tous ses composants (schéma, authentification, host, port, chemin, fragment).

```php
Web::addParamOnURL('https://site.com/page?foo=1', 'bar', 2);
// "https://site.com/page?foo=1&bar=2"

Web::addParamOnURL('https://site.com/page?foo=1', 'foo', 99);
// "https://site.com/page?foo=99"
```
