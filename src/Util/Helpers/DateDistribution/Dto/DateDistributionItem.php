<?php

namespace App\Util\Helpers\DateDistribution\Dto;

use DateTime;

class DateDistributionItem
{
    private DateTime $scheduledAt;
    private mixed $item;

    public function __construct(DateTime $scheduledAt, mixed $item)
    {
        $this->scheduledAt = $scheduledAt;
        $this->item = $item;
    }

    public function getScheduledAt(): DateTime
    {
        return $this->scheduledAt;
    }

    public function setScheduledAt(DateTime $scheduledAt): self
    {
        $this->scheduledAt = $scheduledAt;

        return $this;
    }

    public function getItem(): mixed
    {
        return $this->item;
    }

    public function setItem(mixed $item): self
    {
        $this->item = $item;

        return $this;
    }
}
