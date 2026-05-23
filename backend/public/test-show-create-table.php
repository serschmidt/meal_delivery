<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

header('Content-Type: text/plain; charset=UTF-8');

$tables = [
    'admins',
    'customers',
    'orders',
    'order_items',
    'addresses',
    'suppliers',
    'weekly_menus',
    'weekly_menu_entries',
    'meals',
    'admin_refresh_tokens',
    'supplier_refresh_tokens',
];

try {
    $pdo = db();

    echo "SHOW CREATE TABLE diagnostic\n";
    echo "Generated: " . date('Y-m-d H:i:s') . "\n";
    echo str_repeat('=', 80) . "\n\n";

    foreach ($tables as $table) {
        echo "TABLE: {$table}\n";
        echo str_repeat('-', 80) . "\n";

        try {
            $stmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                echo "No result returned for table {$table}.\n\n";
                continue;
            }

            $createSql = $row['Create Table'] ?? array_values($row)[1] ?? null;

            if ($createSql === null) {
                echo "Could not read CREATE TABLE output for {$table}.\n\n";
                continue;
            }

            echo $createSql . "\n\n";
        } catch (Throwable $tableError) {
            echo "Error for table {$table}: " . $tableError->getMessage() . "\n\n";
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo "Database error: " . $e->getMessage() . "\n";
}
