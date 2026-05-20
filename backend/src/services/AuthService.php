<?php
// backend/src/services/AuthService.php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function jwtConfig(): array
{
    return require __DIR__ . '/../../config/jwt_config.php';
}

function createAccessToken(array $admin): string
{
    $config = jwtConfig();
    $now = time();

    $payload = [
        'iss' => $config['issuer'],
        'aud' => $config['audience'],
        'iat' => $now,
        'nbf' => $now,
        'exp' => $now + (int)$config['access_token_expiry'],
        'sub' => $admin['id'],
        'email' => $admin['email'],
        'full_name' => $admin['full_name'],
        'role' => 'admin',
    ];

    return JWT::encode($payload, $config['secret_key'], $config['algorithm']);
}

function verifyAccessToken(string $token): array
{
    $config = jwtConfig();

    $decoded = JWT::decode(
        $token,
        new Key($config['secret_key'], $config['algorithm'])
    );

    $payload = (array)$decoded;

    if (($payload['iss'] ?? '') !== $config['issuer']) {
        throw new Exception('Ungültiger Issuer.');
    }

    if (($payload['aud'] ?? '') !== $config['audience']) {
        throw new Exception('Ungültige Audience.');
    }

    return $payload;
}

function findAdminByEmail(string $email): ?array
{
    $stmt = db()->prepare("
        SELECT id, full_name, email, password_hash, is_active
        FROM admins
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute(['email' => $email]);
    $admin = $stmt->fetch();

    return $admin ?: null;
}

function loginAdmin(string $email, string $password): array
{
    $admin = findAdminByEmail($email);

    if (!$admin) {
        throw new Exception('Ungültige Anmeldedaten.');
    }

    if ((int)$admin['is_active'] !== 1) {
        throw new Exception('Dieses Admin-Konto ist deaktiviert.');
    }

    if (!password_verify($password, $admin['password_hash'])) {
        throw new Exception('Ungültige Anmeldedaten.');
    }

    $accessToken = createAccessToken($admin);
    $config = jwtConfig();

    return [
        'admin' => [
            'id' => $admin['id'],
            'full_name' => $admin['full_name'],
            'email' => $admin['email'],
        ],
        'token' => [
            'type' => 'Bearer',
            'access_token' => $accessToken,
            'expires_in' => (int)$config['access_token_expiry'],
        ],
    ];
}