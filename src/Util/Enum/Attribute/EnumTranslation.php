<?php

namespace App\Util\Enum\Attribute;

use Attribute;

/**
 * Associe une clé de traduction à une constante de BackedEnum.
 * À utiliser avec EnumTrait::trans() pour résoudre le libellé traduit.
 */
#[Attribute(Attribute::TARGET_CLASS_CONSTANT)]
class EnumTranslation
{
    /**
     * @param string $key Clé de traduction
     * @param string $domain Domaine de traduction (défaut : "messages")
     */
    public function __construct(
        public readonly string $key,
        public readonly string $domain = 'messages',
    ) {
    }
}
