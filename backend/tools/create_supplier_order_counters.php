<?php

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/config/db.php';

echo "Create supplier order counters\n";
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

function tableExists(PDO $pdo, string $tableName): bool
{
    $stmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = :table_name
    ");
    $stmt->execute([':table_name' => $tableName]);
    return (int)$stmt->fetchColumn() > 0;
}

function columnExists(PDO $pdo, string $tableName, string $columnName): bool
{
    $stmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = :table_name
          AND column_name = :column_name
    ");
    $stmt->execute([
        ':table_name' => $tableName,
        ':column_name' => $columnName,
    ]);
    return (int)$stmt->fetchColumn() > 0;
}

function indexExists(PDO $pdo, string $tableName, string $indexName): bool
{
    $stmt = $pdo->prepare("
        SELECT COUNT(*)
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = :table_name
          AND index_name = :index_name
    ");
    $stmt->execute([
        ':table_name' => $tableName,
        ':index_name' => $indexName,
    ]);
    return (int)$stmt->fetchColumn() > 0;
}

$createSupplierOrderCountersSql = <<<SQL
CREATE TABLE IF NOT EXISTS `supplier_order_counters` (
  `supplier_id` char(36) NOT NULL,
  `last_order_number` int NOT NULL DEFAULT 1000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`supplier_id`),
  CONSTRAINT `fk_supplier_order_counters_supplier`
    FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL;

$addSupplierOrderNumberColumnSql = <<<SQL
ALTER TABLE `orders`
ADD COLUMN `supplier_order_number` int NULL AFTER `supplier_id`
SQL;

$addUniqueIndexSql = <<<SQL
ALTER TABLE `orders`
ADD UNIQUE KEY `uk_orders_supplier_order_number` (`supplier_id`, `supplier_order_number`)
SQL;

$addNormalIndexSql = <<<SQL
ALTER TABLE `orders`
ADD KEY `idx_orders_supplier_order_number` (`supplier_id`, `supplier_order_number`)
SQL;

$initializeCountersSql = <<<SQL
INSERT INTO `supplier_order_counters` (`supplier_id`, `last_order_number`)
SELECT s.id, 1000
FROM `suppliers` s
LEFT JOIN `supplier_order_counters` soc ON soc.`supplier_id` = s.`id`
WHERE soc.`supplier_id` IS NULL
SQL;

try {
    $pdo = db();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "DB Verbindung OK\n";
    echo "Server time: " . date('Y-m-d H:i:s') . "\n\n";

    $suppliersExists = tableExists($pdo, 'suppliers');
    $ordersExists = tableExists($pdo, 'orders');

    echo "Voraussetzungen:\n";
    echo " - suppliers vorhanden: " . ($suppliersExists ? 'yes' : 'no') . "\n";
    echo " - orders vorhanden: " . ($ordersExists ? 'yes' : 'no') . "\n\n";

    if (!$suppliersExists) {
        throw new RuntimeException("Tabelle 'suppliers' fehlt. supplier_order_counters kann nicht angelegt werden.");
    }

    if (!$ordersExists) {
        throw new RuntimeException("Tabelle 'orders' fehlt. orders kann nicht erweitert werden.");
    }

    echo "Erzeuge supplier_order_counters ...\n";
    $pdo->exec($createSupplierOrderCountersSql);
    echo "OK: supplier_order_counters erstellt oder bereits vorhanden.\n\n";

    $supplierOrderNumberExists = columnExists($pdo, 'orders', 'supplier_order_number');
    echo "Prüfe Spalte orders.supplier_order_number ... " . ($supplierOrderNumberExists ? "vorhanden\n" : "fehlt\n");

    if (!$supplierOrderNumberExists) {
        echo "Ergänze Spalte supplier_order_number in orders ...\n";
        $pdo->exec($addSupplierOrderNumberColumnSql);
        echo "OK: Spalte supplier_order_number hinzugefügt.\n\n";
    } else {
        echo "OK: Spalte supplier_order_number bereits vorhanden.\n\n";
    }

    $uniqueIndexExists = indexExists($pdo, 'orders', 'uk_orders_supplier_order_number');
    echo "Prüfe Unique-Index uk_orders_supplier_order_number ... " . ($uniqueIndexExists ? "vorhanden\n" : "fehlt\n");

    if (!$uniqueIndexExists) {
        echo "Erzeuge Unique-Index uk_orders_supplier_order_number ...\n";
        $pdo->exec($addUniqueIndexSql);
        echo "OK: Unique-Index erstellt.\n\n";
    } else {
        echo "OK: Unique-Index bereits vorhanden.\n\n";
    }

    $normalIndexExists = indexExists($pdo, 'orders', 'idx_orders_supplier_order_number');
    echo "Prüfe Index idx_orders_supplier_order_number ... " . ($normalIndexExists ? "vorhanden\n" : "fehlt\n");

    if (!$normalIndexExists) {
        echo "Erzeuge Index idx_orders_supplier_order_number ...\n";
        $pdo->exec($addNormalIndexSql);
        echo "OK: Index erstellt.\n\n";
    } else {
        echo "OK: Index bereits vorhanden.\n\n";
    }

    echo "Initialisiere Counter für bestehende Supplier ...\n";
    $affected = $pdo->exec($initializeCountersSql);
    echo "OK: {$affected} fehlende Counter-Datensätze angelegt.\n\n";

    echo "Kontrolle:\n";
    echo " - supplier_order_counters vorhanden: " . (tableExists($pdo, 'supplier_order_counters') ? 'yes' : 'no') . "\n";
    echo " - orders.supplier_order_number vorhanden: " . (columnExists($pdo, 'orders', 'supplier_order_number') ? 'yes' : 'no') . "\n";
    echo " - uk_orders_supplier_order_number vorhanden: " . (indexExists($pdo, 'orders', 'uk_orders_supplier_order_number') ? 'yes' : 'no') . "\n";
    echo " - idx_orders_supplier_order_number vorhanden: " . (indexExists($pdo, 'orders', 'idx_orders_supplier_order_number') ? 'yes' : 'no') . "\n";

    $stmt = $pdo->query("SELECT COUNT(*) FROM `supplier_order_counters`");
    $counterCount = (int)$stmt->fetchColumn();
    echo " - supplier_order_counters Datensätze: {$counterCount}\n";

    echo "\nFertig.\n";
} catch (Throwable $e) {
    http_response_code(500);
    echo "Fehler:\n";
    echo $e->getMessage() . "\n";
}