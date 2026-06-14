# Helper — Number

**Fichier :** `src/Util/Helpers/Number.php`  
**Namespace :** `App\Util\Helpers`

Utilitaires de formatage et d'extraction de valeurs numériques.

---

## Méthodes

### `numberFormatShort(int|float $n, int $precision = 1): string`

Formate un nombre avec un suffixe abrégé, en supprimant les zéros décimaux inutiles.

| Plage | Suffixe |
|-------|---------|
| < 900 | aucun |
| 900 – 899 999 | `K` (milliers) |
| 900 000 – 899 999 999 | `M` (millions) |
| 900 000 000 – 899 999 999 999 | `B` (milliards) |
| ≥ 900 000 000 000 | `T` (billions) |

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$n` | `int\|float` | — | Valeur à formater |
| `$precision` | `int` | `1` | Nombre de décimales |

**Exemples :**

```php
Number::numberFormatShort(1500);        // "1.5K"
Number::numberFormatShort(1000000);     // "1M"
Number::numberFormatShort(1000, 0);     // "1K"
Number::numberFormatShort(1100, 2);     // "1.1K"
Number::numberFormatShort(500);         // "500"
```

---

### `getNumberMin(string $value, bool $isFloat = false): int|float`

Extrait la valeur **minimale** d'une chaîne pouvant contenir plusieurs nombres séparés par des caractères non-numériques.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$value` | `string` | — | Chaîne source |
| `$isFloat` | `bool` | `false` | Retourne un `float` si `true`, sinon un `int` |

**Exemples :**

```php
Number::getNumberMin('10-20 km');   // 10
Number::getNumberMin('5.5 à 9.9', true);  // 5.5
Number::getNumberMin('42');         // 42
```

---

### `getNumberMax(string $value, bool $isFloat = false): int|float`

Extrait la valeur **maximale** d'une chaîne pouvant contenir plusieurs nombres séparés par des caractères non-numériques.

Même signature que `getNumberMin()`.

**Exemples :**

```php
Number::getNumberMax('10-20 km');   // 20
Number::getNumberMax('5,5 à 9,9', true);  // 9.9
Number::getNumberMax('42');         // 42
```

---

## Notes

- Ces deux méthodes sont utilisées par `Converter::convertTo()` pour les types `INTEGER` et `FLOAT` quand la valeur source est une chaîne ou un tableau.
- La virgule (`,`) est traitée comme séparateur décimal (normalisation vers `.`).
- Les espaces sont ignorés avant le traitement.
