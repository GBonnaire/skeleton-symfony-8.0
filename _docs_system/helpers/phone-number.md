# Helper — PhoneNumber

**Fichier :** `src/Util/Helpers/PhoneNumber.php`  
**Namespace :** `App\Util\Helpers`

Utilitaires de normalisation de numéros de téléphone pour la France et la Belgique.

---

## Méthodes

### `phoneNumberFr(string $value, string $separator = '', string $countrycode = ''): string`

Normalise un numéro de téléphone au **format France** (10 chiffres, préfixe `0`).

**Transformations appliquées :**
1. Remplace `+33` par `0`.
2. Si les deux premiers chiffres sont `33`, remplace par `0`.
3. Supprime tous les caractères non numériques.
4. Si le numéro commence par `00`, supprime le premier `0` et relance récursivement.
5. Padde à gauche avec des `0` si < 10 chiffres.
6. Tronque aux 10 derniers chiffres si > 10.
7. Assure que le premier chiffre est `0`.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$value` | `string` | — | Numéro brut |
| `$separator` | `string` | `''` | Séparateur entre groupes de 2 chiffres |
| `$countrycode` | `string` | `''` | Indicatif international substituant le `0` initial |

**Exemples :**

```php
PhoneNumber::phoneNumberFr('+33 6 12 34 56 78');   // "0612345678"
PhoneNumber::phoneNumberFr('06.12.34.56.78', '.');  // "06.12.34.56.78"
PhoneNumber::phoneNumberFr('0612345678', ' ', '+33'); // "+33 6 12 34 56 78"
PhoneNumber::phoneNumberFr('');                       // ""
```

---

### `phoneNumberBe(string $value, string $separator = '', string $countrycode = ''): string`

Normalise un numéro de téléphone au **format Belgique** (9 ou 10 chiffres).

**Transformations appliquées :**
1. Remplace `+32` par `0`.
2. Supprime tous les caractères non numériques.
3. Si commence par `00`, supprime le premier `0`.

**Format de sortie :**
- **9 chiffres** : `XX XXX XX XX`
- **10 chiffres** : `XXXX XX XX XX`

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$value` | `string` | — | Numéro brut |
| `$separator` | `string` | `''` | Séparateur entre groupes |
| `$countrycode` | `string` | `''` | Indicatif substituant le `0` initial |

**Exemples :**

```php
PhoneNumber::phoneNumberBe('+32 2 123 45 67', ' ');   // "02 123 45 67"
PhoneNumber::phoneNumberBe('0032478123456', ' ');      // "0478 12 34 56"
```

---

## Comportement commun

- Si `$value` est une chaîne vide, retourne immédiatement `''`.
- Si la normalisation ne produit pas le bon nombre de chiffres, retourne la valeur originale sans modification.
