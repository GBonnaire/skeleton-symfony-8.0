# Architecture API

## Conventions générales

- **Tous les endpoints sont en anglais** (noms de ressources, paramètres, slugs)
- Séparateur de mots : tiret `-` (kebab-case) pour les segments d'URL
- De base la version de l'API est V1 et pourra avoir plusieurs version en fonction des évolutions majeures

---

## Structure des URLs

Suivre le modèle REST imbriqué : `/v1/<collection>[/<id>[/<collection>[/<id>]...]]`

```
GET  /v1/products
GET  /v1/products/42
GET  /v1/products/42/variantes
GET  /v1/products/42/variantes/7
GET  /v1/users/1/alerts
GET  /v1/users/1/alerts/99/matches
```

Règles :
- Un segment de collection est toujours un **pluriel** (`products`, `alerts`, `variantes`)
- L'`<id>` suit immédiatement la collection à laquelle il appartient
- Ne pas dépasser 5 niveaux d'imbrication ; aplatir si nécessaire

---

## Format de réponse JSON

Toutes les réponses API sont du JSON avec la structure suivante :

```json
{
  "status": "success | error",
  "message": "ok | <message d'erreur>",
  "data": {}
}
```

| Propriété | Type | Présence | Description |
|---|---|---|---|
| `status` | `"success"` \| `"error"` | Toujours | Résultat global de la requête |
| `message` | `string` | Toujours | `"ok"` si succès ; message explicite si erreur |
| `data` | `object` \| `array` | GET uniquement | Données retournées |

### Exemples

**GET réussi :**
```json
{
  "status": "success",
  "message": "ok",
  "data": {
    "id": 42,
    "name": "Dr. Martin",
    "specialty": "cardiologist"
  }
}
```

**GET liste :**
```json
{
  "status": "success",
  "message": "ok",
  "data": [
    { "id": 1, "name": "Dr. Martin" },
    { "id": 2, "name": "Dr. Dupont" }
  ]
}
```

**POST / PUT / DELETE réussi :**
```json
{
  "status": "success",
  "message": "ok", 
  "data": {}
}
```

**Erreur :**
```json
{
  "status": "error",
  "message": "Practitioner not found.",
  "data": {}
}
```

---

## Codes HTTP

| Code | Usage |
|---|---|
| `200` | Succès GET, PUT, PATCH |
| `201` | Succès POST (ressource créée) |
| `204` | Succès DELETE (pas de corps) |
| `400` | Requête invalide (validation échouée) |
| `401` | Non authentifié |
| `403` | Authentifié mais non autorisé |
| `404` | Ressource introuvable |
| `422` | Données sémantiquement incorrectes |
| `500` | Erreur serveur |

---

## Routes Symfony

- Préfixer toutes les routes API avec `/api`
- Utiliser les attributs PHP `#[Route]` avec `methods:` explicites

```php
#[Route('/api/v1/products/{id}/variantes', name: 'api_product_variantes', methods: ['GET'])]
```
