# Helper — Table

**Fichier :** `src/Util/Helpers/Table.php`  
**Namespace :** `App\Util\Helpers`  
**Dépendances :** `Doctrine\Common\Collections\Collection`, `Text`

Utilitaires de manipulation de tableaux PHP et de collections Doctrine.

---

## Méthodes

### `getValueInArrayByPath(string $path, array $values): mixed`

Accède à une valeur imbriquée dans un tableau via une **notation pointée**.

Retourne `null` si un niveau intermédiaire est absent ou n'est pas un tableau.

**Paramètres :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `$path` | `string` | Chemin pointé (ex : `"user.address.city"`) |
| `$values` | `array` | Tableau source |

**Exemples :**

```php
$data = ['user' => ['address' => ['city' => 'Paris']]];

Table::getValueInArrayByPath('user.address.city', $data);  // "Paris"
Table::getValueInArrayByPath('user.phone', $data);          // null
Table::getValueInArrayByPath('city', $data);                // null
```

---

### `removeElementOnArray(array $array, mixed $value): array`

Retire toutes les occurrences de `$value` dans `$array` et **réindexe** le tableau (les clés numériques sont recréées de 0).

```php
Table::removeElementOnArray([1, 2, 3, 2, 4], 2);
// [1, 3, 4]
```

---

### `mergeArrayCollection(Collection $from, Collection $to): void`

Fusionne les éléments de la collection `$from` dans la collection `$to` (Doctrine).

- Clé **numérique** → `$to->add($item)`
- Clé **string** → `$to->set($key, $item)`

```php
Table::mergeArrayCollection($sourceCollection, $targetCollection);
// $targetCollection contient maintenant les éléments des deux collections
```

---

### `isDefinedInArray(array $data, string $key): bool`

Retourne `true` si `$key` existe dans `$data` avec une valeur **non-null et non vide** (`!== null && !== ''`).

```php
Table::isDefinedInArray(['name' => 'Alice', 'email' => ''], 'name');   // true
Table::isDefinedInArray(['name' => 'Alice', 'email' => ''], 'email');  // false
Table::isDefinedInArray(['name' => 'Alice'], 'phone');                  // false
```

---

### `matchValueInArray(mixed $value, array $values, bool $valueNormalized = true): bool`

Vérifie si `$value` est présente dans `$values` par **comparaison stricte** (`===`).

Si `$valueNormalized` est `false`, normalise d'abord `$value` via `Text::normalize()` avant la comparaison.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$value` | `mixed` | — | Valeur à rechercher |
| `$values` | `array` | — | Tableau de référence |
| `$valueNormalized` | `bool` | `true` | Si `false`, normalise `$value` avant comparaison |

```php
Table::matchValueInArray('Paris', ['Paris', 'Lyon']);          // true
Table::matchValueInArray('paris', ['Paris', 'Lyon']);          // false
Table::matchValueInArray('Párís', ['paris'], false);           // true (normalisé)
```
