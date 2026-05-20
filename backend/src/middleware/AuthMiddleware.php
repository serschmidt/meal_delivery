<?php
// backend/src/middleware/AuthMiddleware.php

function getAuthorizationHeader(): ?string
{
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $value) {
            if (strtolower($name) === 'authorization') {
                return $value;
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

    if (preg_match('/Bearer\s+(.+)$/i', $header, $matches)) {
        return trim($matches[1]);
    }

    return null;
}

function requireAuth(): array
{
    $token = getBearerToken();

    if (!$token) {
        jsonResponse(['error' => 'Nicht autorisiert: Bearer-Token fehlt.'], 401);
        exit;
    }

    try {
        return verifyAccessToken($token);
    } catch (Throwable $e) {
        jsonResponse(['error' => 'Ungültiges oder abgelaufenes Token.'], 401);
        exit;
    }
}