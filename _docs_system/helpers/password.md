# Helper — Password

**Fichier :** `src/Util/Helpers/Password.php`  
**Namespace :** `App\Util\Helpers`

Utilitaires de génération de tokens aléatoires et de mots de passe sécurisés.  
Utilise `random_bytes()` et `random_int()` (cryptographiquement sûrs).

---

## Méthodes

### `generateToken(int $strength = 32, ?array $chars = null): string`

Génère un token aléatoire.

**Mode hexadécimal (défaut, `$chars = null`) :**
- Retourne `$strength` octets aléatoires encodés en hexadécimal.
- Longueur finale = `$strength × 2` caractères.

**Mode charset (`$chars` fourni) :**
- Pioche `$strength` caractères aléatoires dans le tableau `$chars`.
- Longueur finale = `$strength` caractères.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$strength` | `int` | `32` | Longueur / entropie |
| `$chars` | `string[]\|null` | `null` | Jeu de caractères (null = hex) |

**Lève** `\Random\RandomException` en cas d'échec de génération aléatoire.

**Exemples :**

```php
Password::generateToken();
// "a3f8c2d1e9b4..." (64 caractères hex)

Password::generateToken(16);
// 32 caractères hex

Password::generateToken(8, ['A','B','C','1','2','3']);
// "B3A1C2B1" (8 caractères parmi le jeu)
```

---

### `generatePassword(int $length = 12, array $charsPattern = [...]): string`

Génère un mot de passe garantissant au moins **un caractère de chaque catégorie** définie.

**Algorithme :**
1. Pioche un caractère aléatoire dans chaque catégorie de `$charsPattern`.
2. Complète avec des caractères aléatoires (toutes catégories confondues) jusqu'à `$length`.
3. Mélange toutes les positions via `str_shuffle()`.

**Catégories par défaut :**
- Minuscules : `abcdefghijklmnopqrstuvwxyz`
- Majuscules : `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
- Chiffres : `0123456789`
- Symboles : `!@#$%&*()-_=+;:,.?`

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$length` | `int` | `12` | Longueur totale du mot de passe |
| `$charsPattern` | `string[]` | voir ci-dessus | Catégories de caractères |

**Exemples :**

```php
Password::generatePassword();
// "xK8!mN3@pQr2" (exemple — résultat variable)

Password::generatePassword(8, ['abc', '123']);
// "b2a1c3b2" — garantit au moins 1 lettre et 1 chiffre

Password::generatePassword(16);
// 16 caractères avec minuscule + majuscule + chiffre + symbole garantis
```
