<?php

namespace App\Event;

use App\Entity\User;
use App\Service\UserService;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;

#[AsEntityListener(event: Events::prePersist, method: 'prePersist', entity: User::class)]
#[AsEntityListener(event: Events::preUpdate, method: 'preUpdate', entity: User::class)]
#[AsEventListener(event: 'kernel.request', method: 'updateLastActivityDate')]
class UserEntityListener
{
    public function __construct(
        private readonly UserService $userService,
        private readonly Security $security,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    public function prePersist(User $user, LifecycleEventArgs $eventArgs): void
    {
        $this->hashPasswordIfNeeded($user, $eventArgs);
    }

    public function preUpdate(User $user, LifecycleEventArgs $eventArgs): void
    {
        $this->hashPasswordIfNeeded($user, $eventArgs);
    }

    private function hashPasswordIfNeeded(object $entity, ?LifecycleEventArgs $eventArgs = null): void
    {
        if (!$entity instanceof User || !$entity->getPlainPassword()) {
            return;
        }

        $this->userService->hashPassword($entity);
    }

    public function updateLastActivityDate(RequestEvent $event): void
    {
        // Skip non-master requests (like sub-requests)
        if (!$event->isMainRequest()) {
            return;
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return;
        }

        // Update the last activity date
        $user->updateLastActivityDate();
        $this->entityManager->flush();
    }
}
