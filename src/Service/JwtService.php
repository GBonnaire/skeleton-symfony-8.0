<?php

namespace App\Service;

use App\Entity\User;

class JwtService
{
    public function __construct(
        private readonly string $secret,
        private readonly int $ttl = 3600,
    ) {
    }

    public function generate(User $user): string
    {
        $header = $this->b64encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = $this->b64encode(json_encode([
            'sub' => $user->getId(),
            'email' => $user->getUserIdentifier(),
            'roles' => $user->getRoles(),
            'iat' => time(),
            'exp' => time() + $this->ttl,
        ]));
        $signature = $this->b64encode(hash_hmac('sha256', "$header.$payload", $this->secret, true));

        return "$header.$payload.$signature";
    }

    public function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (3 !== count($parts)) {
            return null;
        }

        [$header, $payload, $signature] = $parts;
        $expected = $this->b64encode(hash_hmac('sha256', "$header.$payload", $this->secret, true));

        if (!hash_equals($expected, $signature)) {
            return null;
        }

        $data = json_decode($this->b64decode($payload), true);
        if (!is_array($data) || ($data['exp'] ?? 0) < time()) {
            return null;
        }

        return $data;
    }

    private function b64encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function b64decode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}
