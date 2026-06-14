<?php

namespace App\Model;

use DateTime;

class HistoryLogModel
{
    private DateTime $createdAt;
    private string $field;
    private mixed $previousValue = null;
    private mixed $newValue = null;
    private string $comment = '';
    private array $extra = [];

    public function __construct(?array $data = null)
    {
        if (null != $data) {
            if (array_key_exists('d', $data)) {
                $this->createdAt = new DateTime($data['d']);
            }
            if (array_key_exists('f', $data)) {
                $this->field = $data['f'];
            }
            if (array_key_exists('p', $data)) {
                $this->previousValue = $data['p'];
            }
            if (array_key_exists('n', $data)) {
                $this->newValue = $data['n'];
            }
            if (array_key_exists('c', $data)) {
                $this->comment = $data['c'];
            }
            if (array_key_exists('e', $data)) {
                $this->extra = $data['e'];
            }
        }
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getField(): string
    {
        return $this->field;
    }

    public function getPreviousValue(): mixed
    {
        return $this->previousValue;
    }

    public function getNewValue(): mixed
    {
        return $this->newValue;
    }

    public function getComment(): string
    {
        return $this->comment;
    }

    public function getExtra(): array
    {
        return $this->extra;
    }
}
