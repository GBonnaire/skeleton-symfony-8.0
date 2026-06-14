# Helper — Converter

**Fichier :** `src/Util/Helpers/Converter.php`  
**Namespace :** `App\Util\Helpers`  
**Dépendances :** `DataTypeEnum`, `Number`

Utilitaires de conversion de types et de formatage de listes textuelles.

---

## Méthodes

### `convertTo(mixed $value, DataTypeEnum $type, bool $convertNull = false): mixed`

Convertit `$value` vers le type cible `$type`.

Si `$convertNull` est `false` (défaut) et que `$value` est `null`, retourne `null` sans conversion.  
Si `$convertNull` est `true`, `null` est converti vers la valeur par défaut du type.

**Règles de conversion par type :**

| `DataTypeEnum` | `null` | `string` | `array` | `bool` | autre |
|----------------|--------|----------|---------|--------|-------|
| `INTEGER` | `0` | `Number::getNumberMax($v)` | `Number::getNumberMax(implode('|', $v))` | — | `(int)` |
| `FLOAT` | `0.0` | `Number::getNumberMax($v, true)` | idem float | — | `(float)` |
| `STRING` | `''` | — | `implode(',', $v)` | `'Yes'`/`'No'` | `(string)` |
| `TEXT` | `''` | — | `generateList($v)` | `'Yes'`/`'No'` | `(string)` |
| `BOOLEAN` | `false` | `true` si `'true','1','yes','on','y'` ou nombre ≠ 0 | — | — | `(bool)` |
| `ARRAY` | `[]` | split par `,` si présent, sinon `[$v]` | identité | — | `[$v]` |

**Exemples :**

```php
Converter::convertTo('10-20 km', DataTypeEnum::INTEGER);  // 20 (max extrait)
Converter::convertTo('yes', DataTypeEnum::BOOLEAN);        // true
Converter::convertTo(['a', 'b'], DataTypeEnum::STRING);    // "a,b"
Converter::convertTo(null, DataTypeEnum::INTEGER, true);   // 0
Converter::convertTo(null, DataTypeEnum::INTEGER);         // null
```

---

### `generateList(array $items, bool $withNumber = false, string $method = ''): string`

Génère une liste textuelle multi-lignes à partir d'un tableau.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$items` | `array` | — | Éléments de la liste |
| `$withNumber` | `bool` | `false` | Préfixe chaque ligne d'un numéro ordinal (`1. `, `2. `…) |
| `$method` | `string` | `''` | Méthode à appeler sur les objets (essaie aussi `get` + ucfirst) |

**Comportement :**
- Si `$method` est vide : préfixe chaque élément avec ` - ` (ou `N. ` si numéroté).
- Si `$method` est fourni : appelle `$item->$method()` ou `$item->get{Method}()` sur chaque objet.
- Retourne `''` si le tableau est vide.
- Les lignes sont jointes par `\n`.

**Exemples :**

```php
Converter::generateList(['Paris', 'Lyon', 'Marseille']);
// " - Paris\n - Lyon\n - Marseille"

Converter::generateList(['Paris', 'Lyon'], withNumber: true);
// "1. Paris\n2. Lyon"

// Avec des objets ayant getName()
Converter::generateList($users, method: 'name');
// " - Alice\n - Bob"
```
