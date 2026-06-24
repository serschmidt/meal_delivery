<?php

require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $sql = <<<SQL
CREATE TABLE IF NOT EXISTS supplier_delivery_areas (
    id CHAR(36) NOT NULL PRIMARY KEY,
    supplier_id CHAR(36) NOT NULL,
    city VARCHAR(120) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_supplier_delivery_area
        UNIQUE (supplier_id, city, postal_code)
)
SQL;

    db()->exec($sql);

    echo json_encode([
        'success' => true,
        'message' => 'Tabelle supplier_delivery_areas wurde erfolgreich erstellt.'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}