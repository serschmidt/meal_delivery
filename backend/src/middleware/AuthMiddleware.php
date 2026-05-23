<?php
// backend/src/middleware/AuthMiddleware.php

function getAuthorizationHeader(): ?string
{
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['HTTP_AUTHORIZATION']);
    }

    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strtolower((string)$name) === 'authorization') {
                return trim((string)$value);
            }
        }
    }

    return null;
}

function getBearerToken(): ?string
{
    $header = getAuthorizationHeader();

    if (!$header) {
        return null;
    }

    if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        return trim($matches[1]);
    }

    return null;
}

function requireAuth(): array
{
    $token = getBearerToken();

    if (!$token) {
        jsonResponse(['error' => 'Nicht autorisiert.'], 401);
        exit;
    }

    try {
        return verifyAccessToken($token);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'Ungültiges oder abgelaufenes Token.'], 401);
        exit;
    }
}

function requireRole(string $role): array
{
    $user = requireAuth();

    if (($user['role'] ?? null) !== $role) {
        jsonResponse(['error' => 'Nicht autorisiert.'], 403);
        exit;
    }

    return $user;
}

function requireAdmin(): array
{
    return requireRole('admin');
}

function requireSupplier(): array
{
    return requireRole('supplier');
}