# Service PHP — `MessengerSchedulerService`

Service d'enveloppe autour du bus Symfony Messenger pour dispatcher des messages immédiatement ou à une date précise via `DelayStamp`. Intègre une déduplication par clé de référence (`ReferenceKeyStamp`) pour éviter l'empilement de messages identiques dans la file d'attente.

---

## Fichiers

| Rôle | Chemin |
|------|--------|
| Service principal | `src/Service/MessengerSchedulerService.php` |
| Stamp de déduplication | `src/Dto/Stamp/ReferenceKeyStamp.php` |
| Configuration Messenger | `config/packages/messenger.yaml` |

---

## Prérequis

Le service utilise la table Doctrine du transport Messenger (`messenger_messages` par défaut).
Le transport `async` doit utiliser `doctrine://default` (DSN `MESSENGER_TRANSPORT_DSN`).

```yaml
# config/packages/messenger.yaml
framework:
    messenger:
        transports:
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                retry_strategy:
                    max_retries: 3
                    multiplier: 2
        routing:
            App\Message\VotreMessage: async
```

```dotenv
# .env
MESSENGER_TRANSPORT_DSN=doctrine://default
```

Lancement du worker :
```bash
php bin/console messenger:consume async --time-limit=3600
```

---

## Injection

```php
use App\Service\MessengerSchedulerService;

class VotreController
{
    public function __construct(
        private readonly MessengerSchedulerService $scheduler,
    ) {}
}
```

---

## Méthodes publiques

### `dispatch(object $message, ?string $referenceKey = null): void`

Dispatche un message **immédiatement**.

- Si `$referenceKey` est fourni et qu'un message non consommé portant cette clé est déjà en file, le dispatch est ignoré (déduplication).
- Sans `$referenceKey`, le message est toujours dispatché.

```php
// Dispatch simple
$this->scheduler->dispatch(new NotificationMessage($userId));

// Dispatch avec déduplication
$this->scheduler->dispatch(
    new NotificationMessage($userId),
    referenceKey: "notification_user_{$userId}"
);
```

---

### `dispatchAt(object $message, DateTimeInterface $scheduledAt, ?string $referenceKey = null): void`

Dispatche un message **à une date et heure précises** via `DelayStamp`.

- Le délai est calculé en millisecondes entre maintenant et `$scheduledAt`.
- Si `$scheduledAt` est dans le passé, le délai est forcé à 0 ms (traitement immédiat).
- La déduplication par `$referenceKey` fonctionne de la même façon que `dispatch()`.

```php
use DateTime;

// Dispatch planifié sans déduplication
$this->scheduler->dispatchAt(
    new AlertReminderMessage($alertId),
    new DateTime('+2 days'),
);

// Dispatch planifié avec déduplication
$scheduledAt = new DateTime('2026-06-10 08:00:00');
$this->scheduler->dispatchAt(
    new AlertReminderMessage($alertId),
    $scheduledAt,
    referenceKey: "reminder_alert_{$alertId}",
);
```

---

### `cancel(string $referenceKey): int`

Supprime tous les messages **non encore consommés** (`delivered_at IS NULL`) dont le corps sérialisé contient la clé de référence donnée.

Retourne le nombre de messages supprimés.

```php
// Annuler un rappel précis
$deleted = $this->scheduler->cancel("reminder_alert_{$alertId}");

// Annuler tous les rappels d'un utilisateur (wildcard — le % doit être en début ou fin)
$deleted = $this->scheduler->cancel("reminder_user_{$userId}%");
```

> **Règles de pattern pour `cancel()` et la déduplication** :
> - La clé commence ou finit par `%` → utilisée telle quelle comme pattern SQL `LIKE`.
> - Sinon → correspondance exacte (la clé est entourée de guillemets, correspondant au format de sérialisation PHP).

---

## `ReferenceKeyStamp`

Stamp léger attaché au message lors du dispatch. Son unique rôle est de stocker la clé de référence dans le corps sérialisé du message, ce qui permet la recherche SQL dans `messenger_messages`.

```php
namespace App\Dto\Stamp;

use Symfony\Component\Messenger\Stamp\StampInterface;

class ReferenceKeyStamp implements StampInterface
{
    public function __construct(
        private readonly string $key,
    ) {}

    public function getKey(): string { return $this->key; }
}
```

Le stamp n'est pas utilisé par les handlers — il est présent uniquement pour la requête de déduplication côté base de données.

---

## Mécanisme de déduplication

La déduplication repose sur une requête `SELECT COUNT` sur la table `messenger_messages` avant chaque dispatch :

```sql
SELECT COUNT(id)
FROM messenger_messages
WHERE delivered_at IS NULL
  AND body LIKE '%ReferenceKeyStamp%'
  AND body LIKE '%\\"<key>\\"%'
```

- Seuls les messages **non encore traités** (`delivered_at IS NULL`) sont considérés.
- La recherche porte sur le corps PHP sérialisé, où `ReferenceKeyStamp` produit une chaîne déterministe de la forme `s:N:"<key>"`.
- Changer le nom de la classe `ReferenceKeyStamp` casse la déduplication pour les messages déjà en file.

---

## Exemples complets

### Cas 1 — Rappel d'expiration d'alerte planifié

```php
// Dans un service ou un EventSubscriber
$expiry = $alert->getExpiresAt()->modify('-2 days');

$this->scheduler->dispatchAt(
    new AlertExpiryReminderMessage($alert->getId()),
    $expiry,
    referenceKey: "expiry_reminder_alert_{$alert->getId()}",
);
```

### Cas 2 — Notification immédiate sans doublon

```php
// Dans un handler ou controller
$this->scheduler->dispatch(
    new UserWelcomeMessage($user->getId()),
    referenceKey: "welcome_{$user->getId()}",
);
```

### Cas 3 — Annulation lors de la suppression d'une alerte

```php
public function deleteAlert(Alert $alert): void
{
    // Nettoyer tous les messages planifiés liés à cette alerte
    $this->scheduler->cancel("%_alert_{$alert->getId()}%");

    $this->em->remove($alert);
    $this->em->flush();
}
```

### Cas 4 — Reprogrammation (annulation + re-dispatch)

```php
public function rescheduleReminder(Alert $alert, DateTime $newDate): void
{
    $key = "reminder_alert_{$alert->getId()}";

    $this->scheduler->cancel($key);

    $this->scheduler->dispatchAt(
        new AlertReminderMessage($alert->getId()),
        $newDate,
        referenceKey: $key,
    );
}
```

---

## Création d'un message

Un message Messenger est un simple objet PHP (pas d'interface requise) :

```php
// src/Message/AlertReminderMessage.php
namespace App\Message;

final class AlertReminderMessage
{
    public function __construct(
        public readonly int $alertId,
    ) {}
}
```

Et son handler :

```php
// src/MessageHandler/AlertReminderMessageHandler.php
namespace App\MessageHandler;

use App\Message\AlertReminderMessage;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
final class AlertReminderMessageHandler
{
    public function __invoke(AlertReminderMessage $message): void
    {
        // Traitement du rappel pour $message->alertId
    }
}
```

N'oublier pas d'ajouter le routing dans `messenger.yaml` :

```yaml
routing:
    App\Message\AlertReminderMessage: async
```

---

## Notes

- Le service utilise `Doctrine\DBAL\Connection` directement (pas l'EntityManager) pour les requêtes sur `messenger_messages` — table interne de Messenger, hors du domaine métier.
- Le nom de la table peut être surchargé en changeant la constante `MESSENGER_TABLE` dans le service si le DSN du transport utilise un `table_name` différent.
- La déduplication ne couvre que les messages **non encore consommés**. Un message en cours de traitement par un worker (`delivered_at IS NOT NULL`) n'est pas considéré.
