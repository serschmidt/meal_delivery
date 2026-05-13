<?php
// src/orders.php

require_once __DIR__ . '/../config/db.php';

function mapOrderRow(array $row): array
{
    return [
        'id'                  => binToUuid($row['id']),
        'created_at'          => $row['created_at'],
        'status'              => $row['status'],
        'total_price'         => (float) $row['total_price'],
        'billing_address_id'  => binToUuid($row['billing_address_id']),
        'customer_id'         => binToUuid($row['customer_id']),
        'delivery_address_id' => binToUuid($row['delivery_address_id']),
        'supplier_id'         => binToUuid($row['supplier_id']),
        'weekly_menu_id'      => binToUuid($row['weekly_menu_id']),
    ];
}
function getOrderItems(string $orderId): array
{
    $sql = <<<SQL
SELECT 
    oi.id,
    oi.line_total,
    oi.price,
    oi.quantity,
    oi.unit_price,
    oi.order_id,
    oi.weekly_menu_entry_id,
    m.name AS meal_name,
    m.description AS meal_description,
    wme.menu_date,
    wme.day_of_week
FROM order_items oi
INNER JOIN weekly_menu_entries wme ON wme.id = oi.weekly_menu_entry_id
INNER JOIN meals m ON m.id = wme.meal_id
WHERE oi.order_id = :order_id
ORDER BY wme.menu_date ASC, wme.position ASC
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute([':order_id' => uuidToBin($orderId)]);
    $rows = $stmt->fetchAll();

    return array_map(function (array $row): array {
        return [
            'id'                   => binToUuid($row['id']),
            'line_total'           => (float) $row['line_total'],
            'price'                => (float) $row['price'],
            'quantity'             => (int)   $row['quantity'],
            'unit_price'           => (float) $row['unit_price'],
            'order_id'             => binToUuid($row['order_id']),
            'weekly_menu_entry_id' => binToUuid($row['weekly_menu_entry_id']),
            'meal_name'            => $row['meal_name'],
            'meal_description'     => $row['meal_description'],
            'menu_date'            => $row['menu_date'],
            'day_of_week'          => $row['day_of_week'],
        ];
    }, $rows);
}

function getOrderById(string $id): ?array
{
    $sql = <<<SQL
SELECT id, created_at, status, total_price, billing_address_id, customer_id,
       delivery_address_id, supplier_id, weekly_menu_id
FROM orders
WHERE id = :id
LIMIT 1
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => uuidToBin($id)]);
    $row = $stmt->fetch();

    if (!$row) {
        return null;
    }

    $order        = mapOrderRow($row);
    $order['items'] = getOrderItems($order['id']);

    return $order;
}

function getAllOrders(int $limit = 50): array
{
    $sql = <<<SQL
SELECT id, created_at, status, total_price, billing_address_id, customer_id,
       delivery_address_id, supplier_id, weekly_menu_id
FROM orders
ORDER BY created_at DESC
LIMIT :limit
SQL;

    $stmt = db()->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $result = [];

    foreach ($rows as $row) {
        $order          = mapOrderRow($row);
        $order['items'] = getOrderItems($order['id']);
        $result[]       = $order;
    }

    return $result;
}