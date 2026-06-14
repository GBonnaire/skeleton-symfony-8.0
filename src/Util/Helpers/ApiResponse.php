<?php

namespace App\Util\Helpers;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ApiResponse
{
    public static function success(string $message = 'OK', ?array $data = [], int $status = Response::HTTP_OK): JsonResponse
    {
        return new JsonResponse([
            'status' => 'success',
            'message' => $message,
            'data' => $data ?? [],
        ], $status);
    }

    public static function error(string $message, ?array $data = [], int $status = Response::HTTP_BAD_REQUEST): JsonResponse
    {
        return new JsonResponse([
            'status' => 'error',
            'message' => $message,
            'data' => $data ?? [],
        ], $status);
    }
}
