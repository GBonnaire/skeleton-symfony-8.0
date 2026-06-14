<?php

namespace App\Util\Traits;

use DateTime;

/**
 * Logger léger en mémoire : horodatage, niveau, temps écoulé depuis le premier log.
 * Utile pour tracer les étapes d'un traitement batch sans dépendance Monolog.
 */
trait SimpleLoggerTrait
{
    private array $simplelogger = [];
    private ?float $simpleloggerTimestampStarter = null;

    /** Retourne tous les logs concaténés avec le séparateur donné. */
    public function getSimpleLogger(string $separator = "\n"): string
    {
        return implode($separator, $this->simplelogger);
    }

    /**
     * Ajoute une ligne de log au format : "Y-m-d H:i:s (Xs) [level] message".
     * Le chronomètre démarre au premier appel.
     */
    private function addSimpleLogger(string $log, string $level = 'info')
    {
        if (null === $this->simpleloggerTimestampStarter) {
            $this->simpleloggerTimestampStarter = microtime(true);
        }

        $diffSecond = microtime(true) - $this->simpleloggerTimestampStarter;
        $now = new DateTime();

        $this->simplelogger[] = sprintf('%s (%.2f s) [%s] %s', $now->format('Y-m-d H:i:s'), $diffSecond, $level, $log);
    }
}
