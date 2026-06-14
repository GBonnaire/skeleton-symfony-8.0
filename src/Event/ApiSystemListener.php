<?php

namespace App\Event;

use App\Util\Helpers\ApiResponse;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

#[AsEventListener(event: KernelEvents::EXCEPTION, method: 'onKernelException', priority: 10)]
#[AsEventListener(event: KernelEvents::REQUEST, method: 'onKernelRequest', priority: 250)]
#[AsEventListener(event: KernelEvents::RESPONSE, method: 'onKernelResponse')]
class ApiSystemListener
{
    private const API_PREFIX = '/api';

    public function onKernelException(ExceptionEvent $event): void
    {
        if (!str_starts_with($event->getRequest()->getPathInfo(), self::API_PREFIX)) {
            return;
        }

        $exception = $event->getThrowable();

        if (!$exception instanceof AuthenticationException && !$exception instanceof AccessDeniedException && !$exception instanceof NotFoundHttpException) {
            return;
        }

        if ($exception instanceof NotFoundHttpException) {
            $event->setResponse(ApiResponse::error('Not found', null, Response::HTTP_NOT_FOUND));

            return;
        }

        $event->setResponse(ApiResponse::error('Authentification required', null, Response::HTTP_UNAUTHORIZED));
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        if (!str_starts_with($request->getPathInfo(), self::API_PREFIX)) {
            return;
        }

        if ('OPTIONS' !== $request->getMethod()) {
            return;
        }

        $response = new Response('', Response::HTTP_NO_CONTENT);
        $this->addCorsHeaders($response);
        $response->headers->set('Access-Control-Max-Age', '86400');

        $event->setResponse($response);
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        if (!str_starts_with($event->getRequest()->getPathInfo(), self::API_PREFIX)) {
            return;
        }

        $this->addCorsHeaders($event->getResponse());
    }

    private function addCorsHeaders(Response $response): void
    {
        $corsAllowOrigin = '*'; // change this if you want limit origin
        $response->headers->set('Access-Control-Allow-Origin', $corsAllowOrigin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        if ('*' !== $corsAllowOrigin) {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }
    }
}
