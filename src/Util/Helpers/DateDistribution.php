<?php

namespace App\Util\Helpers;

use App\Model\DateDistributionItem;
use DateInterval;
use DateMalformedPeriodStringException;
use DatePeriod;
use DateTime;
use DateTimeInterface;
use InvalidArgumentException;

class DateDistribution
{
    /**
     * Distribue aléatoirement les éléments d'un tableau sur des créneaux générés
     * par l'intervalle entre startDate et endDate.
     *
     * @param array<mixed> $items
     *
     * @return list<DateDistributionItem>
     */
    public static function distribute(
        DateTimeInterface $startDate,
        DateTimeInterface $endDate,
        DateInterval $interval,
        array $items,
    ): array {
        if ($startDate >= $endDate) {
            throw new InvalidArgumentException('La date de début doit être antérieure à la date de fin.');
        }

        if (empty($items)) {
            return [];
        }

        $slots = self::generateSlots($startDate, $endDate, $interval);

        if (empty($slots)) {
            throw new InvalidArgumentException("L'intervalle est trop grand pour générer au moins un créneau sur la période.");
        }

        $result = [];
        $slotCount = count($slots);

        foreach ($items as $item) {
            $slotIndex = random_int(0, $slotCount - 1);
            $slotDate = $slots[$slotIndex];

            $result[] = new DateDistributionItem($slotDate, $item);
        }

        usort($result, static fn (DateDistributionItem $a, DateDistributionItem $b) => $a->getScheduledAt() <=> $b->getScheduledAt());

        return $result;
    }

    /**
     * Variante équilibrée : les éléments sont répartis de façon équitable entre les créneaux
     * (round-robin mélangé) avant d'être assignés à un moment aléatoire dans chaque créneau.
     *
     * @param array<mixed> $items
     *
     * @return list<DateDistributionItem>
     *
     * @throws DateMalformedPeriodStringException
     */
    public static function distributeBalanced(
        DateTimeInterface $startDate,
        DateTimeInterface $endDate,
        DateInterval $interval,
        array $items,
    ): array {
        if ($startDate >= $endDate) {
            throw new InvalidArgumentException('La date de début doit être antérieure à la date de fin.');
        }

        if (empty($items)) {
            return [];
        }

        $slots = self::generateSlots($startDate, $endDate, $interval);

        if (empty($slots)) {
            throw new InvalidArgumentException("L'intervalle est trop grand pour générer au moins un créneau sur la période.");
        }

        $shuffled = $items;
        shuffle($shuffled);

        $result = [];
        $slotCount = count($slots);

        foreach ($shuffled as $i => $item) {
            $slotDate = $slots[$i % $slotCount];

            $result[] = new DateDistributionItem($slotDate, $item);
        }

        usort($result, static fn (DateDistributionItem $a, DateDistributionItem $b) => $a->getScheduledAt() <=> $b->getScheduledAt());

        return $result;
    }

    /**
     * @return array<DateTime>
     *
     * @throws DateMalformedPeriodStringException
     */
    private static function generateSlots(
        DateTimeInterface $startDate,
        DateTimeInterface $endDate,
        DateInterval $interval,
    ): array {
        $period = new DatePeriod($startDate, $interval, $endDate);
        $end = DateTime::createFromInterface($endDate);

        $slots = array_values(iterator_to_array($period));
        $slots[] = $end;

        return $slots;
    }
}
