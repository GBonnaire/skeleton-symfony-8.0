<?php

namespace App\Controller\Api\V1;

use App\Enum\UserRoleEnum;
use App\Repository\UserRepository;
use App\Util\Helpers\ApiResponse;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Contracts\Translation\TranslatorInterface;

#[Route('/api/v1/users', name: 'app_api_v1_users_')]
#[IsGranted(UserRoleEnum::API->value)]
class UserController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly TranslatorInterface $translator,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    #[OA\Get(
        summary: 'List all user emails',
        responses: [
            new OA\Response(
                response: 200,
                description: 'List of emails',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(type: 'string', example: 'user@example.com')
                        ),
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Unauthorized'),
        ]
    )]
    public function list(): Response
    {
        $emails = array_map(
            fn ($user) => $user->getEmail(),
            $this->userRepository->findAll()
        );

        return ApiResponse::success('OK', $emails);
    }

    #[Route('/{email}', name: 'show', methods: ['GET'])]
    #[OA\Get(
        summary: 'Get user profile by email',
        parameters: [
            new OA\Parameter(name: 'email', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'User profile',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'email', type: 'string', example: 'user@example.com'),
                                new OA\Property(
                                    property: 'roles',
                                    type: 'array',
                                    items: new OA\Items(type: 'string', example: 'ROLE_API')
                                ),
                            ],
                            type: 'object'
                        ),
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'User not found'),
        ]
    )]
    public function show(string $email): Response
    {
        $user = $this->userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return ApiResponse::error('User not found.', status: Response::HTTP_NOT_FOUND);
        }

        $roles = array_map(function (string $role): string {
            $enum = UserRoleEnum::tryFrom($role);

            return $enum?->trans($this->translator) ?? $role;
        }, $user->getRoles());

        return ApiResponse::success('OK', [
            'email' => $user->getEmail(),
            'roles' => $roles,
        ]);
    }
}
