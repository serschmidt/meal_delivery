<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

header('Content-Type: text/plain; charset=utf-8');

function out(string $text = ''): void
{
    echo $text . "\n";
}

function columnExists(PDO $pdo, string $table, string $column): bool
{
    $sql = <<<SQL
SELECT COUNT(*)
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = :table
  AND COLUMN_NAME = :column
SQL;

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'table' => $table,
        'column' => $column,
    ]);

    return (int)$stmt->fetchColumn() > 0;
}

try {
    $pdo = db();

    if (!$pdo instanceof PDO) {
        throw new RuntimeException('db() hat kein PDO-Objekt zurückgegeben.');
    }

    $table = 'suppliers';

    out('Schema-Update suppliers');
    out('Generated: ' . date('Y-m-d H:i:s'));
    out(str_repeat('=', 80));

    $columnsToAdd = [
        'first_name' => "ALTER TABLE `suppliers` ADD COLUMN `first_name` VARCHAR(120) NULL AFTER `id`",
        'last_name' => "ALTER TABLE `suppliers` ADD COLUMN `last_name` VARCHAR(120) NULL AFTER `first_name`",
        'business_name' => "ALTER TABLE `suppliers` ADD COLUMN `business_name` VARCHAR(255) NULL AFTER `full_name`",
        'website' => "ALTER TABLE `suppliers` ADD COLUMN `website` VARCHAR(255) NULL AFTER `phone`",
    ];

    foreach ($columnsToAdd as $column => $sql) {
        if (columnExists($pdo, $table, $column)) {
            out("Spalte existiert bereits: {$column}");
            continue;
        }

        out("Füge Spalte hinzu: {$column}");
        $pdo->exec($sql);
    }

    if (columnExists($pdo, $table, 'full_name') && columnExists($pdo, $table, 'business_name')) {
        out('Übernehme bestehende full_name-Werte nach business_name, falls business_name leer ist ...');

        $sql = <<<SQL
UPDATE `suppliers`
SET `business_name` = `full_name`
WHERE (`business_name` IS NULL OR `business_name` = '')
  AND (`full_name` IS NOT NULL AND `full_name` <> '')
SQL;

        $affected = $pdo->exec($sql);
        out("business_name aktualisiert: {$affected}");
    }

    out(str_repeat('-', 80));
    out('SHOW CREATE TABLE suppliers:');

    $stmt = $pdo->query('SHOW CREATE TABLE `suppliers`');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row && isset($row['Create Table'])) {
        out($row['Create Table']);
    }

    out(str_repeat('=', 80));
    out('Fertig.');
    out('Wichtig: Datei nach erfolgreichem Aufruf wieder löschen oder absichern.');
} catch (Throwable $e) {
    http_response_code(500);
    echo "Schema-Update fehlgeschlagen:\n";
    echo $e->getMessage() . "\n";
}