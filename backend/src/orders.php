<?php
// src/orders.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../src/mailer.php';

function mapOrderRow(array $row): array
{
    $order = [
        'id' => binToUuid($row['id']),
        'created_at' => $row['created_at'],
        'status' => $row['status'],
        'total_price' => (float) $row['total_price'],
        'billing_address_id' => binToUuid($row['billing_address_id']),
        'customer_id' => (string) $row['customer_id'],
        'delivery_address_id' => binToUuid($row['delivery_address_id']),
        'supplier_id' => (string) $row['supplier_id'],
        'weekly_menu_id' => binToUuid($row['weekly_menu_id']),
    ];

    if (array_key_exists('customer_ref_id', $row)) {
        $order['customer'] = [
            'id' => $row['customer_ref_id'],
            'full_name' => $row['customer_full_name'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone'],
        ];
    }

    return $order;
}

function mapOrderRowForSupplier(array $row): array
{
    return [
        'id' => binToUuid($row['id']),
        'created_at' => $row['created_at'],
        'status' => $row['status'],
        'total_price' => (float) $row['total_price'],
        'billing_address_id' => binToUuid($row['billing_address_id']),
        'customer_id' => (string) $row['customer_id'],
        'delivery_address_id' => binToUuid($row['delivery_address_id']),
        'supplier_id' => (string) $row['supplier_id'],
        'weekly_menu_id' => binToUuid($row['weekly_menu_id']),

        'customer' => [
            'id' => $row['customer_ref_id'],
            'full_name' => $row['customer_full_name'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone'],
        ],

        'delivery_address' => [
            'id' => binToUuid($row['delivery_address_id']),
            'street' => $row['delivery_street'],
            'house_number' => $row['delivery_house_number'],
            'postal_code' => $row['delivery_postal_code'],
            'city' => $row['delivery_city'],
        ],

        'billing_address' => [
            'id' => binToUuid($row['billing_address_id']),
            'street' => $row['billing_street'],
            'house_number' => $row['billing_house_number'],
            'postal_code' => $row['billing_postal_code'],
            'city' => $row['billing_city'],
        ],
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
            'id' => binToUuid($row['id']),
            'line_total' => (float) $row['line_total'],
            'price' => (float) $row['price'],
            'quantity' => (int) $row['quantity'],
            'unit_price' => (float) $row['unit_price'],
            'order_id' => binToUuid($row['order_id']),
            'weekly_menu_entry_id' => binToUuid($row['weekly_menu_entry_id']),
            'meal_name' => $row['meal_name'],
            'meal_description' => $row['meal_description'],
            'menu_date' => $row['menu_date'],
            'day_of_week' => $row['day_of_week'],
        ];
    }, $rows);
}

function getOrderById(string $id): ?array
{
    $sql = <<<SQL
SELECT
    o.id,
    o.created_at,
    o.status,
    o.total_price,
    o.billing_address_id,
    o.customer_id,
    o.delivery_address_id,
    o.supplier_id,
    o.weekly_menu_id,
    c.id AS customer_ref_id,
    c.full_name AS customer_full_name,
    c.email AS customer_email,
    c.phone AS customer_phone
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
WHERE o.id = :id
LIMIT 1
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => uuidToBin($id)]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return null;
    }

    $order = mapOrderRow($row);
    $order['items'] = getOrderItems($order['id']);

    return $order;
}

function getAllOrders(int $limit = 50): array
{
    $sql = <<<SQL
SELECT
    o.id,
    o.created_at,
    o.status,
    o.total_price,
    o.billing_address_id,
    o.customer_id,
    o.delivery_address_id,
    o.supplier_id,
    o.weekly_menu_id,
    c.id AS customer_ref_id,
    c.full_name AS customer_full_name,
    c.email AS customer_email,
    c.phone AS customer_phone
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
ORDER BY o.created_at DESC
LIMIT :limit
SQL;

    $stmt = db()->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($rows as $row) {
        $order = mapOrderRow($row);
        $order['items'] = getOrderItems($order['id']);
        $result[] = $order;
    }

    return $result;
}

function deleteOrder(string $orderId): bool
{
    $pdo = db();
    $pdo->beginTransaction();

    try {
        $sqlItems = 'DELETE FROM order_items WHERE order_id = :order_id';
        $stmtItems = $pdo->prepare($sqlItems);
        $stmtItems->execute([
            ':order_id' => uuidToBin($orderId),
        ]);

        $sqlOrder = 'DELETE FROM orders WHERE id = :id';
        $stmtOrder = $pdo->prepare($sqlOrder);
        $stmtOrder->execute([
            ':id' => uuidToBin($orderId),
        ]);

        $deleted = $stmtOrder->rowCount() > 0;

        $pdo->commit();
        return $deleted;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

function normalizeOrderStatus(?string $status): ?string
{
    if ($status === null) {
        return null;
    }

    $status = strtoupper(trim($status));

    $allowed = ['PENDING', 'CONFIRMED', 'PREPARED', 'DELIVERED', 'CANCELLED'];

    if (!in_array($status, $allowed, true)) {
        throw new InvalidArgumentException('Ungültiger Bestellstatus.');
    }

    return $status;
}

function countOrdersBySupplier(string $supplierId, ?string $status = null): int
{
    $normalizedStatus = normalizeOrderStatus($status);

    $sql = <<<SQL
SELECT COUNT(*) AS total
FROM orders o
WHERE o.supplier_id = :supplier_id
SQL;

    if ($normalizedStatus !== null) {
        $sql .= " AND o.status = :status";
    }

    $stmt = db()->prepare($sql);
    $stmt->bindValue(':supplier_id', $supplierId, PDO::PARAM_STR);

    if ($normalizedStatus !== null) {
        $stmt->bindValue(':status', $normalizedStatus, PDO::PARAM_STR);
    }

    $stmt->execute();

    return (int)$stmt->fetchColumn();
}

function getOrdersBySupplier(
    string $supplierId,
    ?string $status = null,
    int $limit = 20,
    int $offset = 0
): array {
    $normalizedStatus = normalizeOrderStatus($status);

        $sql = <<<SQL
SELECT
    o.id,
    o.created_at,
    o.status,
    o.total_price,
    o.billing_address_id,
    o.customer_id,
    o.delivery_address_id,
    o.supplier_id,
    o.weekly_menu_id,

    c.id AS customer_ref_id,
    c.full_name AS customer_full_name,
    c.email AS customer_email,
    c.phone AS customer_phone,

    da.street AS delivery_street,
    da.house_number AS delivery_house_number,
    da.postal_code AS delivery_postal_code,
    da.city AS delivery_city,

    ba.street AS billing_street,
    ba.house_number AS billing_house_number,
    ba.postal_code AS billing_postal_code,
    ba.city AS billing_city

FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
LEFT JOIN addresses da ON da.id = o.delivery_address_id
LEFT JOIN addresses ba ON ba.id = o.billing_address_id
WHERE o.supplier_id = :supplier_id
SQL;

    if ($normalizedStatus !== null) {
        $sql .= " AND o.status = :status";
    }

    $sql .= "
ORDER BY o.created_at DESC
LIMIT :limit OFFSET :offset
";

    $stmt = db()->prepare($sql);
    $stmt->bindValue(':supplier_id', $supplierId, PDO::PARAM_STR);

    if ($normalizedStatus !== null) {
        $stmt->bindValue(':status', $normalizedStatus, PDO::PARAM_STR);
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $items = [];

    foreach ($rows as $row) {
        $order = mapOrderRowForSupplier($row);
        $order['items'] = getOrderItems($order['id']);
        $items[] = $order;
    }

    $total = countOrdersBySupplier($supplierId, $normalizedStatus);

    return [
        'items' => $items,
        'pagination' => [
            'limit' => $limit,
            'offset' => $offset,
            'count' => count($items),
            'total' => $total,
            'has_more' => ($offset + count($items)) < $total,
        ],
    ];
}

function getOrderByIdForSupplier(string $orderId, string $supplierId): ?array
{
           $sql = <<<SQL
SELECT
    o.id,
    o.created_at,
    o.status,
    o.total_price,
    o.billing_address_id,
    o.customer_id,
    o.delivery_address_id,
    o.supplier_id,
    o.weekly_menu_id,

    c.id AS customer_ref_id,
    c.full_name AS customer_full_name,
    c.email AS customer_email,
    c.phone AS customer_phone,

    da.street AS delivery_street,
    da.house_number AS delivery_house_number,
    da.postal_code AS delivery_postal_code,
    da.city AS delivery_city,

    ba.street AS billing_street,
    ba.house_number AS billing_house_number,
    ba.postal_code AS billing_postal_code,
    ba.city AS billing_city

FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id
LEFT JOIN addresses da ON da.id = o.delivery_address_id
LEFT JOIN addresses ba ON ba.id = o.billing_address_id
WHERE o.id = :id
  AND o.supplier_id = :supplier_id
LIMIT 1
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':id' => uuidToBin($orderId),
        ':supplier_id' => $supplierId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return null;
    }

    $order = mapOrderRowForSupplier($row);
    $order['items'] = getOrderItems($order['id']);

    return $order;
}

function canSupplierTransitionOrderStatus(string $currentStatus, string $newStatus): bool
{
    $allowedTransitions = [
        'PENDING' => ['CONFIRMED', 'CANCELLED'],
        'CONFIRMED' => ['PREPARED', 'CANCELLED'],
        'PREPARED' => ['DELIVERED'],
        'DELIVERED' => [],
        'CANCELLED' => [],
    ];

    return in_array($newStatus, $allowedTransitions[$currentStatus] ?? [], true);
}

function updateOrderStatusBySupplier(string $orderId, string $supplierId, string $newStatus): ?array
{
    $newStatus = normalizeOrderStatus($newStatus);

    $pdo = db();
    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("
            SELECT id, status
            FROM orders
            WHERE id = :id
              AND supplier_id = :supplier_id
            LIMIT 1
            FOR UPDATE
        ");
        $stmt->execute([
            ':id' => uuidToBin($orderId),
            ':supplier_id' => $supplierId,
        ]);

        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existing) {
            $pdo->rollBack();
            return null;
        }

        $currentStatus = strtoupper((string)$existing['status']);

        if ($currentStatus === $newStatus) {
            $pdo->commit();
            return getOrderByIdForSupplier($orderId, $supplierId);
        }

        if (!canSupplierTransitionOrderStatus($currentStatus, $newStatus)) {
            throw new InvalidArgumentException('Unzulässiger Statuswechsel.');
        }

        $updateStmt = $pdo->prepare("
            UPDATE orders
            SET status = :status
            WHERE id = :id
              AND supplier_id = :supplier_id
        ");
        $updateStmt->execute([
            ':status' => $newStatus,
            ':id' => uuidToBin($orderId),
            ':supplier_id' => $supplierId,
        ]);

        $pdo->commit();

        return getOrderByIdForSupplier($orderId, $supplierId);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}
