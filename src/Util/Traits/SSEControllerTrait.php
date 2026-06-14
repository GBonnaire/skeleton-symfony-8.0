<?php

namespace App\Util\Traits;

use Exception;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Trait SSEControllerTrait.
 *
 * Ce trait permet de gérer les flux Server-Sent Events (SSE) pour les réponses HTTP en streaming.
 *
 * Utilisation obligatoire de StreamedResponse pour la réponse HTTP.
 * $this->_SSE_init(RequestStack $requestStack);
 * $response = new StreamedResponse(function ()  {
 *       $this->_SSE_initInStreamedResponse();
 *       ... le traitement du flux SSE ...
 * });
 * $this->_SSE_prepareStreamedResponse($response);
 * return $response;
 */
trait SSEControllerTrait
{
    private ?int $_SSE_progression_total = null;
    private int $_SSE_progression_current = 0;

    public function _SSE_init(RequestStack $requestStack): void
    {
        $requestStack->getSession()->save();
    }

    public function _SSE_initInStreamedResponse(): void
    {
        // Indispensable : on continue même si le client part
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        ini_set('output_buffering', 'off');
        ini_set('implicit_flush', '1');
        ignore_user_abort(true);

        // Headers SSE
        header('Content-Type: text/event-stream');
        header('Content-Encoding: none'); // désactive mod_deflate Apache
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no'); // désactive le buffer Nginx/Apache
    }

    public function _SSE_prepareStreamedResponse(StreamedResponse $response): void
    {
        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Accel-Buffering', 'no');
    }

    public function _SSE_checkConnectionIsAborted(): bool
    {
        if (connection_aborted()) {
            $this->_SSE_sendEvent('abort', ['message' => 'Client disconnected']);
            throw new Exception('Client disconnected');
        }

        return false;
    }

    public function _SSE_initProgress(int $total): void
    {
        $this->_SSE_progression_total = $total;
        $this->_SSE_progression_current = 0;
        $this->_SSE_sendProgress(0, $total);
    }

    public function _SSE_sendProgressAdvance(): void
    {
        $this->_SSE_sendProgress($this->_SSE_progression_current++, $this->_SSE_progression_total);
    }

    public function _SSE_sendProgress(int $currentProgression, ?int $total = null): void
    {
        $this->_SSE_sendEvent('progress', [
            'current' => $currentProgression,
            'total' => $total,
        ]);
        $this->_SSE_checkConnectionIsAborted();
    }

    public function _SSE_sendDone(array $data): void
    {
        $this->_SSE_sendEvent('done', $data);
    }

    public function _SSE_sendError(string $message): void
    {
        $this->_SSE_sendEvent('error', ['message' => $message]);
    }

    public function _SSE_sendEvent(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo 'data: ' . json_encode($data) . "\n\n";

        // Vide le buffer PHP interne
        if (ob_get_level() > 0) {
            ob_flush();
        }

        // Force l'envoi au niveau système (Apache/OS)
        flush();
    }

    private function _SSE_ping(): void
    {
        // Envoie un commentaire SSE vide — le client l'ignore, Apache détecte la coupure
        echo ": ping\n\n";

        if (ob_get_level() > 0) {
            ob_flush();
        }

        flush();

        $this->_SSE_checkConnectionIsAborted();
    }
}
