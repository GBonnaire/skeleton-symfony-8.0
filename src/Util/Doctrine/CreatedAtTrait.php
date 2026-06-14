<?php

namespace App\Util\Doctrine;

use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Ignore;

/** Ajoute un champ `createdAt` (DateTimeImmutable) à une entité Doctrine. */
trait CreatedAtTrait
{
    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: false)]
    #[Ignore]
    protected DateTimeImmutable $createdAt;

    /** Retourne null si la propriété n'a pas encore été initialisée. */
    public function getCreatedAt(): ?DateTimeImmutable
    {
        if (!isset($this->createdAt)) {
            return null;
        }

        return $this->createdAt;
    }

    /** @return static */
    public function setCreatedAt(?DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
