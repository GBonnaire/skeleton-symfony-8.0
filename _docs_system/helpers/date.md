# Helper — Date

**Fichier :** `src/Util/Helpers/Date.php`  
**Namespace :** `App\Util\Helpers`

Utilitaires de manipulation et de parsing de dates. Toutes les méthodes travaillent avec `\DateTime`.

---

## Méthodes publiques

### `create(string $date): DateTime`

Crée un `DateTime` depuis une chaîne absolue ou relative.

- Chaîne **absolue** (ex : `"2024-01-15"`) → `new DateTime($date)`.
- Chaîne **relative** (ex : `"+3 months"`, `"-1 year"`) → applique `modify()` à aujourd'hui.

```php
Date::create('2024-06-01');     // DateTime 2024-06-01
Date::create('+3 months');      // DateTime dans 3 mois depuis aujourd'hui
```

---

### `modify(DateTime $date, string $modifier): DateTime`

Applique un modificateur relatif à `$date` en corrigeant les débordements de mois.

**Correction de débordement :** si `31 janvier + 1 mois` donnerait `3 mars`, la méthode ramène au `28/29 février` (dernier jour du mois attendu).

```php
Date::modify(new DateTime('2024-01-31'), '+1 month');
// DateTime 2024-02-29 (année bissextile)
```

Lève `\InvalidArgumentException` si le modificateur est invalide.

---

### `isPublicHolidayInFrance(DateTime $dateTest, bool $unemployed = false): bool`

Retourne `true` si la date est un jour férié en France.

| Jours fixes | Jours variables |
|-------------|-----------------|
| 1er janvier, 1er mai, 8 mai, 14 juillet, 15 août, 1er novembre, 11 novembre, 25 décembre | Lundi de Pâques, Ascension, Pentecôte* |

*La Pentecôte est exclue si `$unemployed = true` (journée de solidarité).

Les résultats sont mis en cache via `define()` pour la même année.

---

### `isSunday(DateTime $dateTest): bool`

Retourne `true` si la date est un dimanche.

---

### `isWeekend(DateTime $dateTest): bool`

Retourne `true` si la date est un samedi ou un dimanche.

---

### `isDateISO(string $date): bool`

Retourne `true` si la chaîne est au format `YYYY-MM-DD`.

```php
Date::isDateISO('2024-06-01');  // true
Date::isDateISO('01/06/2024');  // false
```

---

### `stringToDateISO(string $date, string $format = ''): string`

Convertit une date dans n'importe quel format reconnu vers `YYYY-MM-DD`.

- Si `$date` est un entier < 100, il est interprété comme un **âge** et converti via `generateBirthdayDate()`.
- Si la chaîne contient `T` (ISO 8601), la partie horaire est ignorée.
- `$format` est auto-détecté via `dateExtractFormat()` si non fourni.

Retourne `''` si la conversion échoue.

```php
Date::stringToDateISO('01/06/2024');   // "2024-06-01"
Date::stringToDateISO('25');            // date de naissance fictive (25 ans)
```

---

### `getCountMonthsBetweenDates(string $dateStart, ?string $dateEnd = null): int`

Retourne le nombre de mois entre deux dates (formats auto-détectés).

- Si `$dateEnd` est `null`, utilise la date du jour.
- Gère l'inversion des dates (retourne toujours une valeur positive).

```php
Date::getCountMonthsBetweenDates('2023-01-01', '2024-06-01');  // 17
```

---

### `dateExtractFormat(string $d, string $null = ''): string`

Détecte le format PHP d'une chaîne de date (`Y-m-d`, `d/m/Y`, `H:i:s`…).

Reconnaît plus de 20 formats (séparateurs `-`, `/`, `.`, espace, aucun) en 12h/24h.  
Retourne `$null` si aucun format n'est reconnu.

---

### `generateDateFromCountMonths(int $month, ?int $firstDay = null): string`

Génère une date approximative à partir d'un nombre de mois en arrière.  
Ajoute un décalage aléatoire de 2 à 27 jours pour éviter le 1er du mois.

```php
Date::generateDateFromCountMonths(6, 15);
// Environ 6 mois avant aujourd'hui, le 15 du mois
```

---

### `getAge(string $date, string $format = ''): int`

Calcule l'âge en années depuis une date de naissance.

- Si `$date` est un entier pur, il est retourné directement (déjà un âge).
- Retourne `-1` si le format n'est pas reconnu.

```php
Date::getAge('1990-05-15');  // 34 (en 2024)
Date::getAge('35');           // 35
```

---

### `generateBirthdayDate(int $age): string`

Génère une date de naissance fictive cohérente avec l'âge fourni.  
Ajoute un décalage aléatoire de 2 à 360 jours pour plus de réalisme.

```php
Date::generateBirthdayDate(30);  // "1994-07-22" (exemple)
```
