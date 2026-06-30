# Helper — DateDistribution

**Fichier :** `src/Util/Helpers/DateDistribution/DateDistribution.php`  
**Namespace :** `App\Util\Helpers\DateDistribution`  
**Dépendances :** `App\Util\Helpers\DateDistribution\Dto\DateDistributionItem`, `DateInterval`, `DatePeriod`

Répartit un tableau d'éléments sur des créneaux temporels générés par un intervalle entre deux dates.  
Retourne une liste de `DateDistributionItem` triée par date croissante.

---

## Modèle retourné

Chaque élément retourné est une instance de `DateDistributionItem` avec :
- `getScheduledAt(): DateTimeInterface` — créneau assigné
- `getItem(): mixed` — élément d'origine

---

## Méthodes

### `distribute(DateTimeInterface $startDate, DateTimeInterface $endDate, DateInterval $interval, array $items): list<DateDistributionItem>`

Distribution **aléatoire** : chaque élément est assigné à un créneau choisi au hasard (avec répétition possible).

**Paramètres :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `$startDate` | `DateTimeInterface` | Début de la période |
| `$endDate` | `DateTimeInterface` | Fin de la période |
| `$interval` | `DateInterval` | Intervalle entre créneaux (ex : `P1D` = 1 jour) |
| `$items` | `array` | Éléments à distribuer |

**Lève** `\InvalidArgumentException` si :
- `$startDate >= $endDate`
- l'intervalle est trop grand pour générer au moins un créneau

**Exemple :**

```php
$items = ['tâche A', 'tâche B', 'tâche C'];

$result = DateDistribution::distribute(
    new DateTime('2024-01-01'),
    new DateTime('2024-01-31'),
    new DateInterval('P7D'),  // créneaux hebdomadaires
    $items
);

// Chaque tâche est assignée à un créneau aléatoire parmi les semaines
foreach ($result as $item) {
    echo $item->getScheduledAt()->format('Y-m-d') . ' → ' . $item->getItem();
}
```

---

### `distributeBalanced(DateTimeInterface $startDate, DateTimeInterface $endDate, DateInterval $interval, array $items): list<DateDistributionItem>`

Distribution **équilibrée** (round-robin mélangé) : les éléments sont d'abord mélangés (`shuffle`), puis assignés cycliquement aux créneaux. Garantit une répartition uniforme quand le nombre d'éléments dépasse le nombre de créneaux.

Même signature et mêmes exceptions que `distribute()`.

**Différence avec `distribute()` :**

| Méthode | Répartition |
|---------|-------------|
| `distribute` | Aléatoire pure — certains créneaux peuvent être surchargés |
| `distributeBalanced` | Round-robin mélangé — répartition équitable sur les créneaux |

**Exemple :**

```php
$emails = ['user1@ex.com', 'user2@ex.com', 'user3@ex.com', 'user4@ex.com'];

$result = DateDistribution::distributeBalanced(
    new DateTime('2024-06-01'),
    new DateTime('2024-06-30'),
    new DateInterval('P1D'),
    $emails
);
// Chaque email est distribué uniformément sur les jours de juin
```

---

## Notes

- La liste retournée est toujours **triée par date croissante** (`usort`).
- Les créneaux sont générés via `DatePeriod` ; la date de fin est toujours incluse comme créneau supplémentaire.
- Si `$items` est vide, retourne `[]` sans lever d'exception.
