<?php

namespace App\Util\Traits;

/**
 * Cache en mémoire interne (tableau associatif) pour éviter les recalculs coûteux
 * dans le cycle de vie d'un objet. Non persistant entre requêtes.
 */
trait CacheTrait
{
    private array $cache = [];

    /** Stocke une valeur en cache et la retourne. */
    private function addCache(string $propertyName, $value)
    {
        $this->cache[$propertyName] = $value;

        return $value;
    }

    /** Indique si une clé est en cache avec une valeur non-null. */
    private function isCached(string $propertyName)
    {
        if (array_key_exists($propertyName, $this->cache)) {
            if (null !== $this->cache[$propertyName]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Retourne la valeur en cache si elle existe, sinon retourne $default.
     * Si $toCache est true et que $default est non-null, le stocke en cache.
     */
    private function getCache(string $propertyName, $default = null, bool $toCache = true)
    {
        if ($this->isCached($propertyName)) {
            return $this->cache[$propertyName];
        }
        if ($toCache && null != $default) {
            return $this->addCache($propertyName, $default);
        }

        return $default;
    }

    /** Supprime une entrée du cache si elle existe. */
    private function clearCache(string $propertyName)
    {
        if ($this->isCached($propertyName)) {
            unset($this->cache[$propertyName]);
        }
    }
}
