# Helper — ApiResponse

**Fichier :** `src/Util/Helpers/ApiResponse.php`  
**Namespace :** `App\Util\Helpers`

Produit des réponses JSON standardisées pour l'API Symfony.  
Toutes les réponses ont la même structure : `{status, message, data}`.

---

## Structure de réponse

```json
{
  "status": "success" | "error",
  "message": "...",
  "data": []
}
```

---

## Méthodes

### `success(string $message = 'OK', ?array $data = [], int $status = 200): JsonResponse`

Retourne une réponse HTTP de succès.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$message` | `string` | `'OK'` | Message de succès |
| `$data` | `array\|null` | `[]` | Données à inclure |
| `$status` | `int` | `200` | Code HTTP (`Response::HTTP_OK`) |

**Exemple :**

```php
return ApiResponse::success('Utilisateur créé', ['id' => 42], 201);
// {"status":"success","message":"Utilisateur créé","data":{"id":42}}
```

---

### `error(string $message, ?array $data = [], int $status = 400): JsonResponse`

Retourne une réponse HTTP d'erreur.

**Paramètres :**

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `$message` | `string` | — | Description de l'erreur |
| `$data` | `array\|null` | `[]` | Données de contexte (ex : erreurs de validation) |
| `$status` | `int` | `400` | Code HTTP (`Response::HTTP_BAD_REQUEST`) |

**Exemple :**

```php
return ApiResponse::error('Champ manquant', ['field' => 'email'], 422);
// {"status":"error","message":"Champ manquant","data":{"field":"email"}}
```

---

## Notes

- `$data = null` est traité comme `[]` dans les deux méthodes.
- Utilisé dans les contrôleurs `src/Controller/Api/`.
