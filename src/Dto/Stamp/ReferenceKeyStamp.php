<?php

namespace App\Dto\Stamp;

use Symfony\Component\Messenger\Stamp\StampInterface;

/**
 * Stamp used to attach a unique reference key to a dispatched message.
 * Allows checking whether a message with the same reference is already queued
 * before dispatching a new one (deduplication).
 */
class ReferenceKeyStamp implements StampInterface
{
    public function __construct(
        private readonly string $key,
    ) {
    }

    public function getKey(): string
    {
        return $this->key;
    }
}
