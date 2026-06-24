<?php

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/config/db.php';

echo "Create refresh token tables\n";
echo "Generated: " . date('Y-m-d H:i:s') . "\n";
echo "baseDir: {$baseDir}\n";
echo "configFile exists: " . (file_exists($configFile) ? 'yes' : 'no') . "\n";
echo str_repeat('=', 80) . "\n\n";

if (!file_exists($configFile)) {
    http_response_code(500);
    echo "Fehler: config/db.php nicht gefunden.\n";
    exit;
}

require_once $configFile;

if (!function_exists('db')) {
    http_response_code(500);
    echo "Fehler: Funktion db() wurde aus config/db.php nicht geladen.\n";
    exit;
}

$createSupplierRefreshTokensSql = <<<SQL
CREATE TABLE IF NOT EXISTS `supplier_refresh_tokens` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `last_used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `fk_supplier_refresh_tokens_supplier` (`supplier_id`),
  CONSTRAINT `fk_supplier_refresh_tokens_supplier`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;

$createAdminRefreshTokensSql = <<<SQL
CREATE TABLE IF NOT EXISTS `admin_refresh_tokens` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_refresh_token_hash` (`token_hash`),
  KEY `idx_admin_refresh_admin_id` (`admin_id`),
  KEY `idx_admin_refresh_expires_at` (`expires_at`),
  CONSTRAINT `fk_admin_refresh_admin`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;

try {
    $pdo = db();

    echo "DB Verbindung OK\n";
    echo "Server time: " . date('Y-m-d H:i:s') . "\n\n";

    $stmt = $pdo->query("SHOW TABLES LIKE 'suppliers'");
    $suppliersExists = (bool) $stmt->fetchColumn();

    $stmt = $pdo->query("SHOW TABLES LIKE 'admins'");
    $adminsExists = (bool) $stmt->fetchColumn();

    echo "Voraussetzungen:\n";
    echo " - suppliers vorhanden: " . ($suppliersExists ? 'yes' : 'no') . "\n";
    echo " - admins vorhanden: " . ($adminsExists ? 'yes' : 'no') . "\n\n";

    if (!$suppliersExists) {
        throw new RuntimeException("Tabelle 'suppliers' fehlt. supplier_refresh_tokens kann nicht angelegt werden.");
    }

    if (!$adminsExists) {
        throw new RuntimeException("Tabelle 'admins' fehlt. admin_refresh_tokens kann nicht angelegt werden.");
    }

    echo "Erzeuge supplier_refresh_tokens ...\n";
    $pdo->exec($createSupplierRefreshTokensSql);
    echo "OK: supplier_refresh_tokens erstellt oder bereits vorhanden.\n\n";

    echo "Erzeuge admin_refresh_tokens ...\n";
    $pdo->exec($createAdminRefreshTokensSql);
    echo "OK: admin_refresh_tokens erstellt oder bereits vorhanden.\n\n";

    echo "Kontrolle:\n";

    $stmt = $pdo->query("SHOW TABLES LIKE 'supplier_refresh_tokens'");
    $supplierRefreshExists = (bool) $stmt->fetchColumn();
    echo " - supplier_refresh_tokens vorhanden: " . ($supplierRefreshExists ? 'yes' : 'no') . "\n";

    $stmt = $pdo->query("SHOW TABLES LIKE 'admin_refresh_tokens'");
    $adminRefreshExists = (bool) $stmt->fetchColumn();
    echo " - admin_refresh_tokens vorhanden: " . ($adminRefreshExists ? 'yes' : 'no') . "\n";

    echo "\nFertig.\n";
} catch (Throwable $e) {
    http_response_code(500);
    echo "Fehler:\n";
    echo $e->getMessage() . "\n";
}
