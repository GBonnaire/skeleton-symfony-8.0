# Helper — DataTypeEnum

**Fichier :** `src/Util/Helpers/Converter/Enum/DataTypeEnum.php`  
**Namespace :** `App\Util\Helpers\Converter\Enum`

Enum backed `string` listant les types de données cibles utilisés par `Converter::convertTo()`.

---

## Cas

| Cas | Valeur string | Description |
|-----|--------------|-------------|
| `INTEGER` | `'integer'` | Entier PHP (`int`) |
| `FLOAT` | `'float'` | Nombre à virgule flottante (`float`) |
| `STRING` | `'string'` | Chaîne courte — tableau joint par virgule |
| `TEXT` | `'text'` | Texte long — tableau converti en liste à puces |
| `BOOLEAN` | `'boolean'` | Booléen — reconnaît `true/1/yes/on/y` |
| `ARRAY` | `'array'` | Tableau — chaîne splitée sur `,` si applicable |

---

## Différence STRING vs TEXT

| Type | Comportement sur tableau |
|------|--------------------------|
| `STRING` | `implode(',', $array)` → `"a,b,c"` |
| `TEXT` | `Converter::generateList($array)` → `" - a\n - b\n - c"` |

---

## Utilisation

```php
use App\Util\Helpers\Converter\Converter;use App\Util\Helpers\Converter\Enum\DataTypeEnum;

Converter::convertTo('42', DataTypeEnum::INTEGER);   // 42
Converter::convertTo('yes', DataTypeEnum::BOOLEAN);   // true
Converter::convertTo('a,b,c', DataTypeEnum::ARRAY);   // ['a', 'b', 'c']
```
