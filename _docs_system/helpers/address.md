# Helper — Address

**Fichier :** `src/Util/Helpers/Address.php`  
**Namespace :** `App\Util\Helpers`

Utilitaires de formatage d'adresses postales.

---

## Méthodes

### `zipcode(string $zip, int $length = 5): string`

Normalise un code postal.

**Comportement :**
1. Supprime tous les caractères non numériques.
2. Si la chaîne obtenue est **plus courte** que `$length`, padde à gauche avec des zéros.
3. Si elle est **plus longue**, tronque à `$length` caractères depuis la gauche.
4. Si elle est exactement `$length`, retourne telle quelle.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$zip` | `string` | — | Code postal brut |
| `$length` | `int` | `5` | Longueur cible (5 pour la France) |

**Retour :** `string` — Code postal normalisé.

**Exemples :**

```php
Address::zipcode('75 008');        // "75008"
Address::zipcode('750');           // "00750"
Address::zipcode('750089');        // "75008"
Address::zipcode('B-1000', 4);     // "1000"
```
