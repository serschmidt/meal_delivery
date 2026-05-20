<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

header('Content-Type: text/plain; charset=utf-8');

$pdo = db();

$stmt = $pdo->query("
    SELECT
        id,
        full_name,
        email,
        street,
        house_number,
        postal_code,
        city,
        created_at
    FROM customers
    ORDER BY created_at DESC
    LIMIT 50
");

$rows = $stmt->fetchAll();

foreach ($rows as $row) {
    echo 'ID raw: ' . $row['id'] . PHP_EOL;
    echo 'Name: ' . $row['full_name'] . PHP_EOL;
    echo 'Email: ' . $row['email'] . PHP_EOL;
    echo 'Adresse: ' . $row['street'] . ' ' . $row['house_number'] . ', ' .
        $row['postal_code'] . ' ' . $row['city'] . PHP_EOL;
    echo 'Created: ' . $row['created_at'] . PHP_EOL;
    echo str_repeat('-', 40) . PHP_EOL;
}
