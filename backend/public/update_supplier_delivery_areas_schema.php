<?php
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/config/db.php';

function out(string $text = ''): void
{
    echo $text . "\n";
}

function fetchOne(PDO $pdo, string $sql, array $params = []): ?array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row === false ? null : $row;
}

try {
    if (!file_exists($configFile)) {
        throw new RuntimeException("config/db.php nicht gefunden: {$configFile}");
    }

    require_once $configFile;

    if (!function_exists('db')) {
        throw new RuntimeException("config/db.php definiert keine Funktion db().");
    }

    $pdo = db();

    if (!$pdo instanceof PDO) {
        throw new RuntimeException("db() hat kein PDO-Objekt zurückgegeben.");
    }

    out('Schema-Update supplier_delivery_areas');
    out('Generated: ' . date('Y-m-d H:i:s'));
    out('Config: ' . $configFile);
    out(str_repeat('=', 80));

    $table = fetchOne(
        $pdo,
        'SELECT TABLE_NAME, TABLE_COLLATION
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table',
        ['table' => 'supplier_delivery_areas']
    );

    if ($table === null) {
        throw new RuntimeException('Tabelle supplier_delivery_areas existiert nicht.');
    }

    out('Vorherige TABLE_COLLATION: ' . ($table['TABLE_COLLATION'] ?? 'unbekannt'));

    $constraintsStmt = $pdo->prepare(
        'SELECT CONSTRAINT_NAME
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table
           AND CONSTRAINT_TYPE = "FOREIGN KEY"'
    );
    $constraintsStmt->execute(['table' => 'supplier_delivery_areas']);
    $foreignKeys = $constraintsStmt->fetchAll(PDO::FETCH_COLUMN);

    out('Gefundene Foreign Keys: ' . (empty($foreignKeys) ? 'keine' : implode(', ', $foreignKeys)));

    if (!empty($foreignKeys)) {
        foreach ($foreignKeys as $fkName) {
            $sql = sprintf(
                'ALTER TABLE `supplier_delivery_areas` DROP FOREIGN KEY `%s`',
                str_replace('`', '``', (string)$fkName)
            );
            out('Dropping FK: ' . $fkName);
            $pdo->exec($sql);
        }
    }

    out('Konvertiere Tabelle und Textspalten auf utf8mb4_unicode_ci ...');
    $pdo->exec(
        'ALTER TABLE `supplier_delivery_areas`
         CONVERT TO CHARACTER SET utf8mb4
         COLLATE utf8mb4_unicode_ci'
    );

    $fkCheck = fetchOne(
        $pdo,
        'SELECT CONSTRAINT_NAME
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table
           AND CONSTRAINT_NAME = :constraintName
           AND CONSTRAINT_TYPE = "FOREIGN KEY"',
        [
            'table' => 'supplier_delivery_areas',
            'constraintName' => 'fk_supplier_delivery_areas_supplier',
        ]
    );

    if ($fkCheck === null) {
        out('Füge FK fk_supplier_delivery_areas_supplier hinzu ...');
        $pdo->exec(
            'ALTER TABLE `supplier_delivery_areas`
             ADD CONSTRAINT `fk_supplier_delivery_areas_supplier`
             FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE'
        );
    } else {
        out('FK fk_supplier_delivery_areas_supplier existiert bereits.');
    }

    out(str_repeat('-', 80));
    out('Nachkontrolle:');

    $createStmt = $pdo->query('SHOW CREATE TABLE `supplier_delivery_areas`')->fetch(PDO::FETCH_ASSOC);

    if ($createStmt && isset($createStmt['Create Table'])) {
        out($createStmt['Create Table']);
    } else {
        out('SHOW CREATE TABLE konnte nicht gelesen werden.');
    }

    out(str_repeat('=', 80));
    out('Fertig.');
    out('Wichtig: Datei nach erfolgreichem Aufruf wieder löschen oder absichern.');
} catch (Throwable $e) {
    http_response_code(500);
    echo "Schema-Update fehlgeschlagen:\n";
    echo $e->getMessage() . "\n";
}