<?php

namespace App\Service;

use App\Dto\Stamp\ReferenceKeyStamp;
use DateTime;
use DateTimeInterface;
use Doctrine\DBAL\Connection;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

class MessengerSchedulerService
{
    /**
     * Name of the Doctrine Messenger transport table.
     * Must match the table_name option in the transport DSN (default: messenger_messages).
     */
    private const MESSENGER_TABLE = 'messenger_messages';

    public function __construct(
        private readonly MessageBusInterface $messageBus,
        private readonly Connection $connection,
    ) {
    }

    /**
     * Dispatches a message to be processed immediately.
     *
     * @param object $message the message to dispatch
     * @param string|null $referenceKey Optional unique key. If a message with this key
     *                                  is already queued, the dispatch is skipped.
     */
    public function dispatch(object $message, ?string $referenceKey = null): void
    {
        if (null !== $referenceKey && $this->isAlreadyScheduled($referenceKey)) {
            return;
        }

        $stamps = null !== $referenceKey ? [new ReferenceKeyStamp($referenceKey)] : [];

        $this->messageBus->dispatch($message, $stamps);
    }

    /**
     * Dispatches a message to be processed at a specific scheduled time.
     *
     * @param object $message the message to dispatch
     * @param DateTimeInterface $scheduledAt the scheduled time for the message
     * @param string|null $referenceKey Optional unique key. If a message with this key
     *                                  is already queued, the dispatch is skipped.
     */
    public function dispatchAt(object $message, DateTimeInterface $scheduledAt, ?string $referenceKey = null): void
    {
        if (null !== $referenceKey && $this->isAlreadyScheduled($referenceKey)) {
            return;
        }

        $delayMs = max(0, ($scheduledAt->getTimestamp() - (new DateTime())->getTimestamp()) * 1000);

        $stamps = [new DelayStamp($delayMs)];
        if (null !== $referenceKey) {
            $stamps[] = new ReferenceKeyStamp($referenceKey);
        }

        $this->messageBus->dispatch($message, $stamps);
    }

    /**
     * Cancels all queued (not yet consumed) messages that match the given reference key.
     *
     * Key pattern rules (same as isAlreadyScheduled):
     *   - If the key starts or ends with "%" it is used as-is as a LIKE pattern.
     *   - Otherwise the key is matched exactly by wrapping it in double-quotes,
     *     which mirrors the PHP serialization format: s:N:"<key>".
     *
     * @return int number of messages deleted
     */
    public function cancel(string $referenceKey): int
    {
        $sql = sprintf(
            'DELETE FROM %s WHERE delivered_at IS NULL AND body LIKE :stampClass AND body LIKE :refKey',
            self::MESSENGER_TABLE
        );

        return (int) $this->connection->executeStatement($sql, [
            'stampClass' => '%ReferenceKeyStamp%',
            'refKey' => $this->buildRefKeyPattern($referenceKey),
        ]);
    }

    /**
     * Checks whether a message bearing the given reference key is already present
     * in the messenger queue (i.e. not yet consumed by a worker).
     *
     * Works by searching the serialized body of queued messages for the
     * ReferenceKeyStamp class name combined with the reference key string.
     * This is reliable because PHP serialization produces deterministic output
     * and ReferenceKeyStamp is specific to this application.
     *
     * Key pattern rules:
     *   - If the key starts or ends with "%" it is used as-is as a LIKE pattern.
     *   - Otherwise the key is matched exactly by wrapping it in double-quotes,
     *     which mirrors the PHP serialization format: s:N:"<key>".
     *
     * Only undelivered messages (delivered_at IS NULL) are considered.
     */
    private function isAlreadyScheduled(string $referenceKey): bool
    {
        $sql = sprintf(
            'SELECT COUNT(id) FROM %s WHERE delivered_at IS NULL AND body LIKE :stampClass AND body LIKE :refKey',
            self::MESSENGER_TABLE
        );

        $count = (int) $this->connection->fetchOne($sql, [
            'stampClass' => '%ReferenceKeyStamp%',
            'refKey' => $this->buildRefKeyPattern($referenceKey),
        ]);

        return $count > 0;
    }

    /**
     * Builds the LIKE pattern used to match a reference key in a serialized message body.
     *
     * - If the key starts or ends with "%" → used as-is (caller-supplied wildcard pattern).
     * - Otherwise → wrapped in double-quotes so the match is exact:
     *     %\"<key>\"% mirrors the PHP serialization s:N:\"<key>\".
     */
    private function buildRefKeyPattern(string $referenceKey): string
    {
        if (!str_starts_with($referenceKey, '%')) {
            $referenceKey = '%\\\\"' . $referenceKey;
        }

        if (!str_ends_with($referenceKey, '%')) {
            $referenceKey = $referenceKey . '\\\\"%';
        }

        return $referenceKey;
    }
}
