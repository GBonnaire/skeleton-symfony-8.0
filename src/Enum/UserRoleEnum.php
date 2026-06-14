<?php

declare(strict_types=1);

namespace App\Enum;

use App\Util\Enum\Attribute\EnumTranslation;
use App\Util\Enum\EnumTrait;
use Symfony\Contracts\Translation\TranslatableInterface;

enum UserRoleEnum: string implements TranslatableInterface
{
    use EnumTrait;

    #[EnumTranslation(key: 'user_role.super_admin')]
    case SUPER_ADMIN = 'ROLE_SUPER_ADMIN';

    #[EnumTranslation(key: 'user_role.admin')]
    case ADMIN = 'ROLE_ADMIN';

    #[EnumTranslation(key: 'user_role.manager')]
    case MANAGER = 'ROLE_MANAGER';

    #[EnumTranslation(key: 'user_role.user')]
    case USER = 'ROLE_USER';

    #[EnumTranslation(key: 'user_role.api')]
    case API = 'ROLE_API';
}
