<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/config/db.php';
$migrationFile = $baseDir . '/database/migrations/20260508_init_schema.sql';

try {
    $pdo = require $configFile;

    if (!file_exists($migrationFile)) {
        throw new RuntimeException("Migrationsdatei nicht gefunden: {$migrationFile}");
    }

    $sql = file_get_contents($migrationFile);
    if ($sql === false) {
        throw new RuntimeException("Migrationsdatei konnte nicht gelesen werden.");
    }

    $sql = preg_replace('/^\s*--\s+\+goose\s+(Up|Down).*$\R?/mi', '', $sql);
    $sql = trim($sql);

    if ($sql === '') {
        throw new RuntimeException("Migrationsdatei enthält kein ausführbares SQL.");
    }

    $pdo->beginTransaction();
    $pdo->exec($sql);
    $pdo->commit();

    echo "Migration erfolgreich ausgeführt.\n";
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo "Migration fehlgeschlagen:\n";
    echo $e->getMessage() . "\n";
}