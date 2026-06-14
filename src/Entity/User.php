<?php

namespace App\Entity;

use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;
use App\Util\Doctrine\ActiveTrait;
use App\Util\Doctrine\CreatedAtTrait;
use DateTime;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    use ActiveTrait;
    use CreatedAtTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[Assert\NotBlank(
        message: 'user.password.not_blank',
        groups: ['register', 'password', 'manager_create']
    )]
    #[Assert\Regex(
        pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/',
        message: 'user.password.regex',
        groups: ['register', 'password',  'profile', 'manager_create']
    )]
    #[Assert\Length(
        min: 8,
        max: 24,
        minMessage: 'user.password.min_length',
        maxMessage: 'user.password.max_length',
        groups: ['register', 'password',  'profile', 'manager_create']
    )]
    #[Assert\NotCompromisedPassword(
        message: 'user.password.not_compromised',
        groups: ['register', 'password',  'profile', 'manager_create']
    )]
    private ?string $plainPassword = '';

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?DateTime $lastActivityDate = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        if (0 === count($roles)) {
            $roles[] = UserRoleEnum::USER->value;
        }

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        array_walk($roles, fn (&$role) => $role instanceof UserRoleEnum ? $role = $role->value : null);
        $this->roles = $roles;

        return $this;
    }

    public function addRole(string|UserRoleEnum $role): static
    {
        if ($role instanceof UserRoleEnum) {
            $role = $role->value;
        }
        if (!\in_array($role, $this->roles)) {
            $this->roles[] = $role;
        }

        return $this;
    }

    public function removeRole(string|UserRoleEnum $role): static
    {
        if ($role instanceof UserRoleEnum) {
            $role = $role->value;
        }
        if (false !== $key = array_search($role, $this->roles, true)) {
            unset($this->roles[$key]);
            $this->roles = array_values($this->roles);
        }

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    public function getLastActivityDate(): ?DateTime
    {
        return $this->lastActivityDate;
    }

    public function setLastActivityDate(?DateTime $lastActivityDate): static
    {
        $this->lastActivityDate = $lastActivityDate;

        return $this;
    }

    public function updateLastActivityDate(): static
    {
        $this->lastActivityDate = new DateTime('now');

        return $this;
    }

    /**
     * Ensure the session doesn't contain actual password hashes by CRC32C-hashing them, as supported since Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0" . self::class . "\0password"] = hash('crc32c', $this->password);

        return $data;
    }
}
