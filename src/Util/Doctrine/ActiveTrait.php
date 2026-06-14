<?php

namespace App\Util\Doctrine;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/** Ajoute un champ booléen `active` à une entité Doctrine, activé par défaut. */
trait ActiveTrait
{
    #[ORM\Column(type: Types::BOOLEAN)]
    protected bool $active = true;

    public function getActive(): ?bool
    {
        return $this->active;
    }

    /** @return static */
    public function setActive(bool $active): self
    {
        $this->active = $active;

        return $this;
    }

    public function isActive(): bool
    {
        return $this->getActive();
    }
}
