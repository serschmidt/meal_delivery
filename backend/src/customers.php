<?php
// src/customers.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../src/mailer.php';
require_once __DIR__ . '/../src/orders.php';

function normalizeNullableString(mixed $value): ?string
{
    if ($value === null) {
        return null;
    }

    $value = trim((string) $value);

    return $value === '' ? null : $value;
}

function normalizeEmail(string $email): string
{
    return mb_strtolower(trim($email));
}

function findCustomerByEmail(string $email): ?array
{
    $sql = 'SELECT * FROM customers WHERE email = :email LIMIT 1';

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':email' => normalizeEmail($email),
    ]);

    $row = $stmt->fetch();

    return $row ?: null;
}

function upsertCustomerFromOrder(array $data): array
{
    if (empty($data['email'])) {
        throw new InvalidArgumentException('email is required for customer');
    }

    $email = normalizeEmail((string) $data['email']);
    $existing = findCustomerByEmail($email);

    $incoming = [
        'full_name' => normalizeNullableString($data['full_name'] ?? null),
        'phone' => normalizeNullableString($data['phone'] ?? null),
        'street' => normalizeNullableString($data['street'] ?? null),
        'house_number' => normalizeNullableString($data['house_number'] ?? null),
        'postal_code' => normalizeNullableString($data['postal_code'] ?? null),
        'city' => normalizeNullableString($data['city'] ?? null),
        'notes' => normalizeNullableString($data['notes'] ?? null),
    ];

    if ($existing === null) {
        $customerId = generateUuid();

        $sql = <<<SQL
INSERT INTO customers (
    id,
    full_name,
    email,
    phone,
    street,
    house_number,
    postal_code,
    city,
    notes,
    created_at,
    updated_at
) VALUES (
    :id,
    :full_name,
    :email,
    :phone,
    :street,
    :house_number,
    :postal_code,
    :city,
    :notes,
    NOW(),
    NOW()
)
SQL;

        $stmt = db()->prepare($sql);
        $stmt->execute([
            ':id' => $customerId,
            ':full_name' => $incoming['full_name'] ?? '',
            ':email' => $email,
            ':phone' => $incoming['phone'],
            ':street' => $incoming['street'] ?? '',
            ':house_number' => $incoming['house_number'] ?? '',
            ':postal_code' => $incoming['postal_code'] ?? '',
            ':city' => $incoming['city'] ?? '',
            ':notes' => $incoming['notes'],
        ]);

        return [
            'id' => $customerId,
            'email' => $email,
        ];
    }

    $updated = [
        'full_name' => $incoming['full_name'] ?? $existing['full_name'],
        'phone' => $incoming['phone'] ?? $existing['phone'],
        'street' => $incoming['street'] ?? $existing['street'],
        'house_number' => $incoming['house_number'] ?? $existing['house_number'],
        'postal_code' => $incoming['postal_code'] ?? $existing['postal_code'],
        'city' => $incoming['city'] ?? $existing['city'],
        'notes' => $incoming['notes'] ?? $existing['notes'],
    ];

    $sql = <<<SQL
UPDATE customers
SET
    full_name = :full_name,
    phone = :phone,
    street = :street,
    house_number = :house_number,
    postal_code = :postal_code,
    city = :city,
    notes = :notes,
    updated_at = NOW()
WHERE id = :id
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':id' => $existing['id'],
        ':full_name' => $updated['full_name'],
        ':phone' => $updated['phone'],
        ':street' => $updated['street'],
        ':house_number' => $updated['house_number'],
        ':postal_code' => $updated['postal_code'],
        ':city' => $updated['city'],
        ':notes' => $updated['notes'],
    ]);

    return [
        'id' => $existing['id'],
        'email' => $email,
    ];
}

function createOrder(array $data): array
{
    if (!isset($data['customer']) || !is_array($data['customer'])) {
        throw new InvalidArgumentException('customer object is required');
    }
    if (empty($data['supplier_id'])) {
        throw new InvalidArgumentException('supplier_id is required');
    }
    if (empty($data['weekly_menu_id'])) {
        throw new InvalidArgumentException('weekly_menu_id is required');
    }
    if (empty($data['items']) || !is_array($data['items'])) {
        throw new InvalidArgumentException('items are required');
    }
    if (empty($data['delivery_address']) || !is_array($data['delivery_address'])) {
        throw new InvalidArgumentException('delivery_address is required');
    }
    if (empty($data['billing_address']) || !is_array($data['billing_address'])) {
        throw new InvalidArgumentException('billing_address is required');
    }

    $pdo = db();

    try {
        $pdo->beginTransaction();

        // 1. Kunde anlegen / updaten
        $customerInfo = upsertCustomerFromOrder($data['customer']);
        $customerId   = $customerInfo['id'];

        // 2. Adressen anlegen
        $billingAddressId  = generateUuid();
        $deliveryAddressId = generateUuid();

        $insertAddressSql = <<<SQL
INSERT INTO addresses (id, city, house_number, postal_code, street)
VALUES (:id, :city, :house_number, :postal_code, :street)
SQL;

        $addrStmt = $pdo->prepare($insertAddressSql);

        $addrStmt->execute([
            ':id'           => uuidToBin($billingAddressId),
            ':city'         => $data['billing_address']['city']         ?? '',
            ':house_number' => $data['billing_address']['house_number'] ?? '',
            ':postal_code'  => $data['billing_address']['postal_code']  ?? '',
            ':street'       => $data['billing_address']['street']       ?? '',
        ]);

        $addrStmt->execute([
            ':id'           => uuidToBin($deliveryAddressId),
            ':city'         => $data['delivery_address']['city']         ?? '',
            ':house_number' => $data['delivery_address']['house_number'] ?? '',
            ':postal_code'  => $data['delivery_address']['postal_code']  ?? '',
            ':street'       => $data['delivery_address']['street']       ?? '',
        ]);

        // 3. Gesamtpreis berechnen
        $totalPrice = 0.0;
        foreach ($data['items'] as $item) {
            $totalPrice += (int) $item['quantity'] * (float) $item['unit_price'];
        }

        // 4. Bestellung anlegen
        $orderId = generateUuid();

        $supplierOrderNumber = reserveNextSupplierOrderNumber($pdo, (string) $data['supplier_id']);

        $pdo->prepare(<<<SQL
INSERT INTO orders (
    id, created_at, status, total_price,
    billing_address_id, customer_id,
    delivery_address_id, supplier_id, supplier_order_number, weekly_menu_id
) VALUES (
    :id, NOW(6), 'PENDING', :total_price,
    :billing_address_id, :customer_id,
    :delivery_address_id, :supplier_id, :supplier_order_number, :weekly_menu_id
)
SQL)->execute([
            ':id' => uuidToBin($orderId),
            ':total_price' => round($totalPrice, 2),
            ':billing_address_id' => uuidToBin($billingAddressId),
            ':customer_id' => $customerId,
            ':delivery_address_id' => uuidToBin($deliveryAddressId),
            ':supplier_id' => $data['supplier_id'],
            ':supplier_order_number' => $supplierOrderNumber,
            ':weekly_menu_id' => uuidToBin($data['weekly_menu_id']),
        ]);

        // 5. Bestellpositionen
        $itemStmt = $pdo->prepare(<<<SQL
INSERT INTO order_items (
    id, line_total, price, quantity, unit_price,
    order_id, weekly_menu_entry_id
) VALUES (
    :id, :line_total, :price, :quantity, :unit_price,
    :order_id, :weekly_menu_entry_id
)
SQL);

        foreach ($data['items'] as $item) {
            $qty       = (int)   $item['quantity'];
            $unitPrice = (float) $item['unit_price'];
            $lineTotal = round($qty * $unitPrice, 2);

            $itemStmt->execute([
                ':id'                   => uuidToBin(generateUuid()),
                ':line_total'           => $lineTotal,
                ':price'                => $unitPrice,
                ':quantity'             => $qty,
                ':unit_price'           => $unitPrice,
                ':order_id'             => uuidToBin($orderId),
                ':weekly_menu_entry_id' => uuidToBin($item['weekly_menu_entry_id']),
            ]);
        }

        $pdo->commit();

        // 6. Bestellung abrufen
        $completedOrder = getOrderById($orderId);

        if ($completedOrder === null) {
            throw new RuntimeException('Order could not be loaded after creation');
        }

        // 7. E-Mails versenden – nach commit, außerhalb der Transaktion
        try {
            $supplierData = getSupplierById($data['supplier_id']);
            $completedOrder['payment_qr'] = buildPaymentQrResponseData($completedOrder, $supplierData);
            if (!empty($data['customer']['email'])) {

                sendOrderConfirmationToCustomer(
                    $completedOrder,
                    $data['customer'],
                    $supplierData ?? []
                );
            }

            if (!empty($supplierData['email'])) {

                sendOrderNotificationToSupplier(
                    $completedOrder,
                    $data['customer'],
                    $supplierData
                );

            }
        } catch (Throwable $mailError) {
            error_log('MAIL ERROR message=' . $mailError->getMessage());
            error_log('MAIL ERROR file=' . $mailError->getFile() . ':' . $mailError->getLine());
        }

        return $completedOrder;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

function getAllCustomers(): array
{
    $stmt = db()->query("
        SELECT id, full_name, email, phone, street, house_number, postal_code, city, notes, created_at, updated_at
        FROM customers
        ORDER BY created_at DESC
    ");

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getCustomerById(string $customerId): ?array
{
    $stmt = db()->prepare("
        SELECT id, full_name, email, phone, street, house_number, postal_code, city, notes, created_at, updated_at
        FROM customers
        WHERE id = :id
        LIMIT 1
    ");

    $stmt->execute([
        ':id' => $customerId,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}
