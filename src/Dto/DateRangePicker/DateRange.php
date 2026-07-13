<?php

declare(strict_types=1);

namespace App\Dto\DateRangePicker;

use DateTimeImmutable;

/**
 * Plage de dates renvoyée par DateRangePickerType. La valeur transportée côté formulaire est
 * une chaîne « yyyy-mm-dd@yyyy-mm-dd » (ou une seule date en mode date unique) ; ce DTO en est
 * la forme métier. En mode date unique, seul dateStart est renseigné (dateEnd = dateStart).
 */
final readonly class DateRange
{
    public function __construct(
        public ?DateTimeImmutable $dateStart = null,
        public ?DateTimeImmutable $dateEnd = null,
    ) {
    }

    public function isEmpty(): bool
    {
        return null === $this->dateStart && null === $this->dateEnd;
    }

    public function __toString(): string
    {
        if($this->isEmpty()) {
            return '';
        }
        return $this->dateStart->format('Y-m-d') . '@' . $this->dateEnd->format('Y-m-d');
    }
}
