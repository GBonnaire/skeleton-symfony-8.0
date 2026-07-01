# Extension Twig — Translation

**Fichier :** `src/Twig/Extension/TranslationExtension.php`
**Namespace :** `App\Twig\Extension`

Extension Twig fournissant des filtres de traduction dédiés. Contrairement aux extensions classiques, elle **n'étend pas** `AbstractExtension` et n'implémente pas `getFilters()` : chaque filtre est déclaré via l'attribut `#[AsTwigFilter]` (Twig ≥ 3.21), auto-enregistré par l'autoconfiguration Symfony.

---

## Filtres

### `transFlash(mixed $messages, array $parameters = [], string $domain = 'flash'): mixed`

Traduit un message flash via le domaine `flash` par défaut. La fonction est **récursive** et gère plusieurs types d'entrée :

| Type d'entrée | Comportement |
|---------------|--------------|
| `string`     | Traduit la clé via le domaine indiqué |
| `\BackedEnum` | Traduit `$message->value` |
| `array`      | Applique `transFlash` récursivement sur chaque valeur |
| autre        | Retourne la valeur inchangée |

**Pourquoi :** les contrôleurs stockent des **clés de traduction** dans les messages flash (`$this->addFlash('success', 'account.password_change.success')`) ; la traduction est faite côté Twig, pas dans le contrôleur.

```twig
{# Clé simple #}
{{ 'account.password_change.success'|transFlash }}

{# Affichage des messages flash #}
{% for message in app.flashes('error') %}
    <p>{{ message|transFlash }}</p>
{% endfor %}

{# Domaine explicite #}
{{ 'some.key'|transFlash({}, 'messages') }}
```

---

```php
<?php

namespace App\Twig\Extension;

use Twig\Attribute\AsTwigFilter;

class TranslationExtension
{
    #[AsTwigFilter('transFlash')]
    public function transFlash(mixed $messages, array $parameters = [], string $domain = 'flash'): mixed
    {
        // ...
    }
}
```
