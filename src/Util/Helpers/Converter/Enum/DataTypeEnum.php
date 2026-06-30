<?php

namespace App\Util\Helpers\Converter\Enum;

/** Types de données cibles utilisés par Converter::convertTo(). */
enum DataTypeEnum: string
{
    case INTEGER = 'integer';
    case FLOAT = 'float';
    case STRING = 'string';
    case TEXT = 'text';
    case BOOLEAN = 'boolean';
    case ARRAY = 'array';
}
