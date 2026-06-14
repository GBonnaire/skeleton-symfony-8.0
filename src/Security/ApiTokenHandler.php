<?php

namespace App\Security;

use App\Service\JwtService;
use SensitiveParameter;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class ApiTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private readonly JwtService $jwtService)
    {
    }

    public function getUserBadgeFrom(#[SensitiveParameter] string $accessToken): UserBadge
    {
        $payload = $this->jwtService->decode($accessToken);

        if (null === $payload) {
            throw new \Symfony\Component\Security\Core\Exception\BadCredentialsException('Invalid or expired token.');
        }

        return new UserBadge($payload['email']);
    }
}
