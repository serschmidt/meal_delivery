<?php
// backend/src/services/AuthService.php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function jwtConfig(): array
{
    return require __DIR__ . '/../../config/jwt_config.php';
}

function tokenHash(string $token): string
{
    return hash('sha256', $token);
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
        'type' => 'access',
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

    if (($payload['type'] ?? '') !== 'access') {
        throw new Exception('Ungültiger Tokentyp.');
    }

    if (($payload['sub'] ?? '') === '') {
        throw new Exception('Ungültiges Subject.');
    }

    return $payload;
}

function createRefreshToken(): string
{
    return bin2hex(random_bytes(64));
}

function refreshTokenCookieName(): string
{
    return 'lm_admin_refresh';
}

function setRefreshTokenCookie(string $refreshToken): void
{
    $config = jwtConfig();

    setcookie(refreshTokenCookieName(), $refreshToken, [
        'expires' => time() + (int)$config['refresh_token_expiry'],
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clearRefreshTokenCookie(): void
{
    setcookie(refreshTokenCookieName(), '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function getRefreshTokenFromCookie(): ?string
{
    $name = refreshTokenCookieName();
    $token = $_COOKIE[$name] ?? null;

    if (!is_string($token) || trim($token) === '') {
        return null;
    }

    return trim($token);
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

function findAdminById(string $id): ?array
{
    $stmt = db()->prepare("
        SELECT id, full_name, email, is_active
        FROM admins
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute(['id' => $id]);
    $admin = $stmt->fetch();

    return $admin ?: null;
}

function storeRefreshToken(string $adminId, string $refreshToken): void
{
    $config = jwtConfig();
    $stmt = db()->prepare("
        INSERT INTO admin_refresh_tokens (
            id, admin_id, token_hash, expires_at, revoked_at, last_used_at
        ) VALUES (
            :id, :admin_id, :token_hash, :expires_at, NULL, NULL
        )
    ");
    $stmt->execute([
        'id' => generateUuid(),
        'admin_id' => $adminId,
        'token_hash' => tokenHash($refreshToken),
        'expires_at' => date('Y-m-d H:i:s', time() + (int)$config['refresh_token_expiry']),
    ]);
}

function findValidRefreshToken(string $refreshToken): ?array
{
    $stmt = db()->prepare("
        SELECT id, admin_id, token_hash, expires_at, revoked_at, last_used_at
        FROM admin_refresh_tokens
        WHERE token_hash = :token_hash
        LIMIT 1
    ");
    $stmt->execute([
        'token_hash' => tokenHash($refreshToken),
    ]);

    $row = $stmt->fetch();

    if (!$row) {
        return null;
    }

    if ($row['revoked_at'] !== null) {
        return null;
    }

    if (strtotime($row['expires_at']) <= time()) {
        return null;
    }

    return $row;
}

function revokeRefreshTokenById(string $id): void
{
    $stmt = db()->prepare("
        UPDATE admin_refresh_tokens
        SET revoked_at = NOW()
        WHERE id = :id AND revoked_at IS NULL
    ");
    $stmt->execute(['id' => $id]);
}

function revokeRefreshTokenByHash(string $refreshToken): void
{
    $stmt = db()->prepare("
        UPDATE admin_refresh_tokens
        SET revoked_at = NOW()
        WHERE token_hash = :token_hash AND revoked_at IS NULL
    ");
    $stmt->execute([
        'token_hash' => tokenHash($refreshToken),
    ]);
}

function touchRefreshToken(string $id): void
{
    $stmt = db()->prepare("
        UPDATE admin_refresh_tokens
        SET last_used_at = NOW()
        WHERE id = :id
    ");
    $stmt->execute(['id' => $id]);
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
    $refreshToken = createRefreshToken();
    $config = jwtConfig();

    storeRefreshToken($admin['id'], $refreshToken);
    setRefreshTokenCookie($refreshToken);

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

function refreshAdminSession(): array
{
    $refreshToken = getRefreshTokenFromCookie();

    if (!$refreshToken) {
        throw new Exception('Refresh-Token fehlt.');
    }

    $stored = findValidRefreshToken($refreshToken);

    if (!$stored) {
        clearRefreshTokenCookie();
        throw new Exception('Refresh-Token ist ungültig oder abgelaufen.');
    }

    $admin = findAdminById($stored['admin_id']);

    if (!$admin || (int)$admin['is_active'] !== 1) {
        revokeRefreshTokenById($stored['id']);
        clearRefreshTokenCookie();
        throw new Exception('Admin-Konto ist nicht verfügbar.');
    }

    touchRefreshToken($stored['id']);
    revokeRefreshTokenById($stored['id']);

    $newRefreshToken = createRefreshToken();
    storeRefreshToken($admin['id'], $newRefreshToken);
    setRefreshTokenCookie($newRefreshToken);

    $config = jwtConfig();

    return [
        'admin' => [
            'id' => $admin['id'],
            'full_name' => $admin['full_name'],
            'email' => $admin['email'],
        ],
        'token' => [
            'type' => 'Bearer',
            'access_token' => createAccessToken($admin),
            'expires_in' => (int)$config['access_token_expiry'],
        ],
    ];
}

function logoutAdmin(): void
{
    $refreshToken = getRefreshTokenFromCookie();

    if ($refreshToken) {
        revokeRefreshTokenByHash($refreshToken);
    }

    clearRefreshTokenCookie();
}

function createSupplierAccessToken(array $supplier): string
{
    $config = jwtConfig();
    $now = time();

    $payload = [
        'iss' => $config['issuer'],
        'aud' => $config['audience'],
        'iat' => $now,
        'nbf' => $now,
        'exp' => $now + (int)$config['access_token_expiry'],
        'sub' => $supplier['id'],
        'email' => $supplier['email'],
        'full_name' => $supplier['full_name'],
        'role' => 'supplier',
        'type' => 'access',
    ];

    return JWT::encode($payload, $config['secret_key'], $config['algorithm']);
}

function supplierRefreshTokenCookieName(): string
{
    return 'lm_supplier_refresh';
}

function setSupplierRefreshTokenCookie(string $refreshToken): void
{
    $config = jwtConfig();

    setcookie(supplierRefreshTokenCookieName(), $refreshToken, [
        'expires' => time() + (int)$config['refresh_token_expiry'],
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clearSupplierRefreshTokenCookie(): void
{
    setcookie(supplierRefreshTokenCookieName(), '', [
        'expires' => time() - 3600,
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function getSupplierRefreshTokenFromCookie(): ?string
{
    $name = supplierRefreshTokenCookieName();
    $token = $_COOKIE[$name] ?? null;

    if (!is_string($token) || trim($token) === '') {
        return null;
    }

    return trim($token);
}

function findSupplierByEmail(string $email): ?array
{
    $stmt = db()->prepare("
        SELECT id, full_name, email, password_hash, is_active
        FROM suppliers
        WHERE email = :email
        LIMIT 1
    ");
    $stmt->execute(['email' => $email]);
    $supplier = $stmt->fetch();

    return $supplier ?: null;
}

function findSupplierById(string $id): ?array
{
    $stmt = db()->prepare("
        SELECT id, full_name, email, is_active
        FROM suppliers
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute(['id' => $id]);
    $supplier = $stmt->fetch();

    return $supplier ?: null;
}

function storeSupplierRefreshToken(string $supplierId, string $refreshToken): void
{
    $config = jwtConfig();

    $stmt = db()->prepare("
        INSERT INTO supplier_refresh_tokens (
            id, supplier_id, token_hash, expires_at, revoked_at, last_used_at
        ) VALUES (
            :id, :supplier_id, :token_hash, :expires_at, NULL, NULL
        )
    ");
    $stmt->execute([
        'id' => generateUuid(),
        'supplier_id' => $supplierId,
        'token_hash' => tokenHash($refreshToken),
        'expires_at' => date('Y-m-d H:i:s', time() + (int)$config['refresh_token_expiry']),
    ]);
}

function findValidSupplierRefreshToken(string $refreshToken): ?array
{
    $stmt = db()->prepare("
        SELECT id, supplier_id, token_hash, expires_at, revoked_at, last_used_at
        FROM supplier_refresh_tokens
        WHERE token_hash = :token_hash
        LIMIT 1
    ");
    $stmt->execute([
        'token_hash' => tokenHash($refreshToken),
    ]);

    $row = $stmt->fetch();

    if (!$row) {
        return null;
    }

    if ($row['revoked_at'] !== null) {
        return null;
    }

    if (strtotime($row['expires_at']) <= time()) {
        return null;
    }

    return $row;
}

function revokeSupplierRefreshTokenById(string $id): void
{
    $stmt = db()->prepare("
        UPDATE supplier_refresh_tokens
        SET revoked_at = NOW()
        WHERE id = :id AND revoked_at IS NULL
    ");
    $stmt->execute(['id' => $id]);
}

function revokeSupplierRefreshTokenByHash(string $refreshToken): void
{
    $stmt = db()->prepare("
        UPDATE supplier_refresh_tokens
        SET revoked_at = NOW()
        WHERE token_hash = :token_hash AND revoked_at IS NULL
    ");
    $stmt->execute([
        'token_hash' => tokenHash($refreshToken),
    ]);
}

function touchSupplierRefreshToken(string $id): void
{
    $stmt = db()->prepare("
        UPDATE supplier_refresh_tokens
        SET last_used_at = NOW()
        WHERE id = :id
    ");
    $stmt->execute(['id' => $id]);
}

function loginSupplier(string $email, string $password): array
{
    $supplier = findSupplierByEmail($email);

    if (!$supplier) {
        throw new Exception('Ungültige Anmeldedaten.');
    }

    if ((int)$supplier['is_active'] !== 1) {
        throw new Exception('Dieses Lieferanten-Konto ist deaktiviert.');
    }

    if (!password_verify($password, $supplier['password_hash'])) {
        throw new Exception('Ungültige Anmeldedaten.');
    }

    $accessToken = createSupplierAccessToken($supplier);
    $refreshToken = createRefreshToken();
    $config = jwtConfig();

    storeSupplierRefreshToken($supplier['id'], $refreshToken);
    setSupplierRefreshTokenCookie($refreshToken);

    return [
        'supplier' => [
            'id' => $supplier['id'],
            'full_name' => $supplier['full_name'],
            'email' => $supplier['email'],
        ],
        'token' => [
            'type' => 'Bearer',
            'access_token' => $accessToken,
            'expires_in' => (int)$config['access_token_expiry'],
        ],
    ];
}

function refreshSupplierSession(): array
{
    $refreshToken = getSupplierRefreshTokenFromCookie();

    if (!$refreshToken) {
        throw new Exception('Refresh-Token fehlt.');
    }

    $stored = findValidSupplierRefreshToken($refreshToken);

    if (!$stored) {
        clearSupplierRefreshTokenCookie();
        throw new Exception('Refresh-Token ist ungültig oder abgelaufen.');
    }

    $supplier = findSupplierById($stored['supplier_id']);

    if (!$supplier || (int)$supplier['is_active'] !== 1) {
        revokeSupplierRefreshTokenById($stored['id']);
        clearSupplierRefreshTokenCookie();
        throw new Exception('Lieferanten-Konto ist nicht verfügbar.');
    }

    touchSupplierRefreshToken($stored['id']);
    revokeSupplierRefreshTokenById($stored['id']);

    $newRefreshToken = createRefreshToken();
    storeSupplierRefreshToken($supplier['id'], $newRefreshToken);
    setSupplierRefreshTokenCookie($newRefreshToken);

    $config = jwtConfig();

    return [
        'supplier' => [
            'id' => $supplier['id'],
            'full_name' => $supplier['full_name'],
            'email' => $supplier['email'],
        ],
        'token' => [
            'type' => 'Bearer',
            'access_token' => createSupplierAccessToken($supplier),
            'expires_in' => (int)$config['access_token_expiry'],
        ],
    ];
}

function logoutSupplier(): void
{
    $refreshToken = getSupplierRefreshTokenFromCookie();

    if ($refreshToken) {
        revokeSupplierRefreshTokenByHash($refreshToken);
    }

    clearSupplierRefreshTokenCookie();
}