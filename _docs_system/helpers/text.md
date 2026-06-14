# Helper — Text

**Fichier :** `src/Util/Helpers/Text.php`  
**Namespace :** `App\Util\Helpers`

Utilitaires de manipulation et de normalisation de chaînes de caractères.  
Couvre les conversions de casse, la suppression d'accents/emojis et la correction d'encodage.

---

## Conversions de casse

### `convertToSnakeCase(string $input): string`

Convertit en `snake_case` (majuscules remplacées par `_` + minuscule).

```php
Text::convertToSnakeCase('myVariableName');  // "my_variable_name"
```

### `convertToCamelCase(string $input): string`

Convertit en `camelCase`. Gère les séparateurs `-`, `_` et espaces.

```php
Text::convertToCamelCase('my-variable-name');  // "myVariableName"
```

### `convertToPascalCase(string $input): string`

Convertit en `PascalCase`. Même gestion des séparateurs que `camelCase`.

```php
Text::convertToPascalCase('my_variable_name');  // "MyVariableName"
```

### `convertToKebabCase(string $input): string`

Convertit en `kebab-case`. Gère le passage depuis camelCase/PascalCase.

```php
Text::convertToKebabCase('MyVariableName');  // "my-variable-name"
```

### `convertToScreamingSnakeCase(string $input): string`

Convertit en `SCREAMING_SNAKE_CASE`.

```php
Text::convertToScreamingSnakeCase('myVar');  // "MY_VAR"
```

### `convertToScreamingKebabCase(string $input): string`

Convertit en `SCREAMING-KEBAB-CASE`.

```php
Text::convertToScreamingKebabCase('myVar');  // "MY-VAR"
```

### `convertToDotCase(string $input): string`

Convertit en `dot.case`. Gère camelCase/PascalCase.

```php
Text::convertToDotCase('MyVariableName');  // "my.variable.name"
```

### `convertToPathCase(string $input): string`

Convertit en `path/case`. Gère camelCase/PascalCase.

```php
Text::convertToPathCase('MyVariableName');  // "my/variable/name"
```

### `convertToTrainCase(string $input): string`

Convertit en `Train-Case` (chaque mot commence par une majuscule, séparés par `-`).

```php
Text::convertToTrainCase('my_variable_name');  // "My-Variable-Name"
```

### `convertToTitleCase(string $input): string`

Convertit en `Title Case` (chaque mot en majuscule, séparés par espaces).

```php
Text::convertToTitleCase('my-variable');  // "My Variable"
```

### `convertToSentenceCase(string $input): string`

Convertit en `Sentence case` (première lettre de la phrase en majuscule).

```php
Text::convertToSentenceCase('MY_VARIABLE_NAME');  // "My variable name"
```

---

## Détection de casse

### `detectCase(string $input): string`

Détecte automatiquement le type de casse d'une chaîne.

**Valeurs retournées possibles :**

| Retour | Exemple |
|--------|---------|
| `'snake_case'` | `my_var` |
| `'camelCase'` | `myVar` |
| `'PascalCase'` | `MyVar` |
| `'kebab-case'` | `my-var` |
| `'SCREAMING_SNAKE_CASE'` | `MY_VAR` |
| `'SCREAMING-KEBAB-CASE'` | `MY-VAR` |
| `'dot.case'` | `my.var` |
| `'path/case'` | `my/var` |
| `'Train-Case'` | `My-Var` |
| `'Title Case'` | `My Var` |
| `'Sentence case'` | `My var` |
| `'empty'` | `''` |
| `'unknown'` | autre |

---

## Nettoyage et normalisation

### `removeEmoji(string $text): string`

Supprime les emojis Unicode (bloc Emoticons `U+1F000`–`U+1FAFF`).

```php
Text::removeEmoji('Hello 😀 World');  // "Hello  World"
```

### `removeAccentuations(string $value): string`

Remplace les caractères accentués (Latin étendu, Cyrillic…) par leurs équivalents ASCII.

```php
Text::removeAccentuations('Héllo Wörld');  // "Hello World"
```

### `removeNonAlphaChar(string $value): string`

Remplace les accents **et** supprime la ponctuation, les symboles monétaires et caractères spéciaux.

```php
Text::removeNonAlphaChar('Héllo, Wörld!');  // "Hello World"
```

### `normalize(string $value): string`

Normalise une chaîne pour comparaison insensible à la casse et aux accents :
1. `removeNonAlphaChar()`
2. `removeAccentuations()`
3. `removeEmoji()`
4. Suppression des caractères non alphanumériques restants
5. `strtolower()` + `trim()`

```php
Text::normalize('Héllo, Wörld! 😀');  // "helloworld"
```

Utilisé par `Table::matchValueInArray()` avec `$valueNormalized = false`.

### `getWords(string $text): array`

Découpe un texte en mots (séparés par espaces) après suppression des emojis et des caractères spéciaux (hors lettres accentuées et tirets).

```php
Text::getWords('Hello, world!');  // ['Hello', 'world']
```

---

## Correction d'encodage

### `decodeString(string $value): string`

Corrige un double-encodage UTF-8 courant (ex : `"Ã©"` → `"é"`).  
À utiliser sur des chaînes mal encodées issues de sources externes.

### `convertUtf8ToANSI(string $value): string`

Convertit les séquences d'échappement Unicode (`\uXXXX`) et hexadécimales (`\xXX`) en caractères UTF-8 lisibles.

```php
Text::convertUtf8ToANSI('é');  // "é"
```
