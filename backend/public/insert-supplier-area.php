<?php
// public/insert-supplier-area.php

require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

function generateUuidV4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$supplierId = 'fc7ccb64-859b-4b0f-8482-fe10d9776aa2';

$areas = [
    // Krefeld
    ['city' => 'Krefeld', 'postal_code' => '47798'],
    ['city' => 'Krefeld', 'postal_code' => '47799'],
    ['city' => 'Krefeld', 'postal_code' => '47800'],
    ['city' => 'Krefeld', 'postal_code' => '47802'],
    ['city' => 'Krefeld', 'postal_code' => '47803'],
    ['city' => 'Krefeld', 'postal_code' => '47804'],
    ['city' => 'Krefeld', 'postal_code' => '47805'],
    ['city' => 'Krefeld', 'postal_code' => '47807'],
    ['city' => 'Krefeld', 'postal_code' => '47809'],
    ['city' => 'Krefeld', 'postal_code' => '47829'],
    ['city' => 'Krefeld', 'postal_code' => '47839'],

    // Duisburg
    ['city' => 'Duisburg', 'postal_code' => '47051'],
    ['city' => 'Duisburg', 'postal_code' => '47053'],
    ['city' => 'Duisburg', 'postal_code' => '47055'],
    ['city' => 'Duisburg', 'postal_code' => '47057'],
    ['city' => 'Duisburg', 'postal_code' => '47058'],
    ['city' => 'Duisburg', 'postal_code' => '47059'],

    ['city' => 'Duisburg', 'postal_code' => '47166'],
    ['city' => 'Duisburg', 'postal_code' => '47167'],
    ['city' => 'Duisburg', 'postal_code' => '47169'],
    ['city' => 'Duisburg', 'postal_code' => '47178'],
    ['city' => 'Duisburg', 'postal_code' => '47179'],

    ['city' => 'Duisburg', 'postal_code' => '47119'],
    ['city' => 'Duisburg', 'postal_code' => '47137'],
    ['city' => 'Duisburg', 'postal_code' => '47138'],
    ['city' => 'Duisburg', 'postal_code' => '47139'],

    ['city' => 'Duisburg', 'postal_code' => '47198'],
    ['city' => 'Duisburg', 'postal_code' => '47199'],

    ['city' => 'Duisburg', 'postal_code' => '47226'],
    ['city' => 'Duisburg', 'postal_code' => '47228'],
    ['city' => 'Duisburg', 'postal_code' => '47229'],

    ['city' => 'Duisburg', 'postal_code' => '47239'],
    ['city' => 'Duisburg', 'postal_code' => '47249'],
    ['city' => 'Duisburg', 'postal_code' => '47259'],
    ['city' => 'Duisburg', 'postal_code' => '47269'],
    ['city' => 'Duisburg', 'postal_code' => '47279'],

];

try {
    $pdo = db();
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO supplier_delivery_areas (id, supplier_id, city, postal_code)
        VALUES (:id, :supplier_id, :city, :postal_code)
    ");

    $inserted = 0;

    foreach ($areas as $area) {
        $stmt->execute([
            ':id' => generateUuidV4(),
            ':supplier_id' => $supplierId,
            ':city' => $area['city'],
            ':postal_code' => $area['postal_code'],
        ]);
        $inserted++;
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'supplierId' => $supplierId,
        'inserted' => $inserted,
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}