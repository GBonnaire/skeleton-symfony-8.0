<?php

namespace App\Util\Doctrine;

use DateTime;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Ignore;

/** Ajoute un champ `updatedAt` (DateTime mutable, nullable) à une entité Doctrine. */
trait UpdatedAtTrait
{
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Ignore]
    protected DateTime $updatedAt;

    /** Retourne null si la propriété n'a pas encore été initialisée. */
    public function getUpdatedAt(): ?DateTime
    {
        if (!isset($this->updatedAt)) {
            return null;
        }

        return $this->updatedAt;
    }

    /** @return static */
    public function setUpdatedAt(?DateTime $dateTime): self
    {
        $this->updatedAt = $dateTime;

        return $this;
    }
}
