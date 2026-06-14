<?php

namespace App\Event;

use App\Util\Doctrine\CreatedAtTrait;
use App\Util\Doctrine\CreatedByTrait;
use App\Util\Doctrine\UpdatedAtTrait;
use DateTime;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Bundle\SecurityBundle\Security;

#[AsDoctrineListener(event: Events::prePersist)]
#[AsDoctrineListener(event: Events::preUpdate)]
class EntityLifecycleListener
{
    public function __construct(
        private readonly Security $security,
    ) {
    }

    public function prePersist(LifecycleEventArgs $eventArgs): void
    {
        $entity = $eventArgs->getObject();
        // Vérification directe avec method_exists
        if (
            method_exists($entity, 'getCreatedAt')
            && method_exists($entity, 'setCreatedAt')
            && $this->hasTrait($entity, CreatedAtTrait::class)
        ) {
            $entity->setCreatedAt(new DateTimeImmutable());
        }

        if (method_exists($entity, 'getCreatedBy')
            && method_exists($entity, 'setCreatedBy')
            && $this->hasTrait($entity, CreatedByTrait::class)) {
            if (null === $entity->getCreatedBy()) {
                $user = $this->security->getUser();
                if ($user) {
                    $entity->setCreatedBy($user);
                }
            }
        }
    }

    public function preUpdate(LifecycleEventArgs $eventArgs): void
    {
        $entity = $eventArgs->getObject();
        if (
            method_exists($entity, 'getUpdatedAt')
            && method_exists($entity, 'setUpdatedAt')
            && $this->hasTrait($entity, UpdatedAtTrait::class)
        ) {
            $entity->setUpdatedAt(new DateTime());
        }
    }

    private function hasTrait(object $entity, string $trait): bool
    {
        return \in_array($trait, class_uses($entity::class));
    }
}
