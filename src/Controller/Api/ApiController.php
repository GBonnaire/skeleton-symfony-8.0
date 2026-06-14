<?php

namespace App\Controller\Api;

use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;
use App\Service\JwtService;
use App\Util\Helpers\ApiResponse;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api', name: 'app_api_')]
class ApiController extends AbstractController
{
    #[Route('/ping', name: 'ping', methods: ['GET'])]
    #[OA\Get(
        summary: 'Health check',
        security: [],
        responses: [
            new OA\Response(response: 200, description: 'Return pong response'),
        ]
    )]
    public function ping(): Response
    {
        return ApiResponse::success('pong');
    }

    #[Route('/auth', name: 'auth', methods: ['POST'])]
    #[OA\Post(
        summary: 'Authenticate and retrieve a JWT token',
        security: [],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/x-www-form-urlencoded',
                schema: new OA\Schema(
                    required: ['email', 'password'],
                    properties: [
                        new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                        new OA\Property(property: 'password', type: 'string', example: 'P@ssw0rd'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'JWT token',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'OK'),
                        new OA\Property(
                            property: 'data',
                            properties: [new OA\Property(property: 'token', type: 'string')],
                            type: 'object'
                        ),
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Invalid credentials or missing ROLE_API'),
        ]
    )]
    public function auth(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        JwtService $jwtService,
    ): Response {
        $email = $request->request->getString('email');
        $password = $request->request->getString('password');

        if (!$email || !$password) {
            return ApiResponse::error('Email and password are required.', status: Response::HTTP_UNAUTHORIZED);
        }

        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $password)) {
            return ApiResponse::error('Invalid credentials.', status: Response::HTTP_UNAUTHORIZED);
        }

        if (!in_array(UserRoleEnum::API->value, $user->getRoles(), true)) {
            return ApiResponse::error('Access denied. ROLE_API required.', status: Response::HTTP_UNAUTHORIZED);
        }

        return ApiResponse::success('OK', ['token' => $jwtService->generate($user)]);
    }
}
