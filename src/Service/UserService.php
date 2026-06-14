<?php

namespace App\Service;

use App\Entity\User;
use App\Enum\UserRoleEnum;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $hasher,
    ) {
    }

    /**
     * Crée un nouvel utilisateur avec son mot de passe hashé.
     */
    public function createUser(User $user, string $password): void
    {
        $user->setPlainPassword($password);
        $this->hashPassword($user);

        // First user, add role ADMIN
        if (0 == $this->entityManager->getRepository(User::class)->count([])) {
            $user->addRole(UserRoleEnum::ADMIN->value);
            $user->addRole(UserRoleEnum::SUPER_ADMIN->value);
        }

        $this->entityManager->persist($user);
    }

    public function updateUser(User $user): void
    {
        $this->hashPassword($user);
        $this->entityManager->persist($user);
    }

    public function checkPassword(User $user, string $plainPassword): bool
    {
        return $this->hasher->isPasswordValid($user, $plainPassword);
    }

    /**
     * Hash le mot de passe en clair de l'utilisateur.
     */
    public function hashPassword(User $user): bool
    {
        $plain = $user->getPlainPassword();
        if (empty($plain)) {
            return false;
        }

        $hashed = $this->hasher->hashPassword($user, $plain);
        $user->setPassword($hashed);
        $user->setPlainPassword(null);

        return true;
    }
}
