<?php

require_once __DIR__ . '/../config/db.php';

function findCustomerByEmail(string $email): ?array
{
    $sql = 'SELECT * FROM customers WHERE email = :email LIMIT 1';

    $stmt = db()->prepare($sql);
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();

    return $row ?: null;
}

function upsertCustomerFromOrder(array $data): array
{
    // Erwartet z.B.:
    // full_name, email, phone, street, house_number, postal_code, city, notes?

    if (empty($data['email'])) {
        throw new InvalidArgumentException('email is required for customer');
    }

    $existing = findCustomerByEmail($data['email']);

    if ($existing === null) {
        // create new
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

        $customerId = generateUuid(); // gibt string(36) zurück

        $stmt = db()->prepare($sql);
        $stmt->execute([
            ':id'           => $customerId,
            ':full_name'    => $data['full_name']    ?? '',
            ':email'        => $data['email'],
            ':phone'        => $data['phone']        ?? '',
            ':street'       => $data['street']       ?? '',
            ':house_number' => $data['house_number'] ?? '',
            ':postal_code'  => $data['postal_code']  ?? '',
            ':city'         => $data['city']         ?? '',
            ':notes'        => $data['notes']        ?? '',
        ]);

        return [
            'id'    => $customerId,
            'email' => $data['email'],
        ];
    }

    // update existing
    $sql = <<<SQL
UPDATE customers
SET
    full_name    = :full_name,
    phone        = :phone,
    street       = :street,
    house_number = :house_number,
    postal_code  = :postal_code,
    city         = :city,
    notes        = :notes,
    updated_at   = NOW()
WHERE email = :email
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':full_name'    => $data['full_name']    ?? $existing['full_name'],
        ':phone'        => $data['phone']        ?? $existing['phone'],
        ':street'       => $data['street']       ?? $existing['street'],
        ':house_number' => $data['house_number'] ?? $existing['house_number'],
        ':postal_code'  => $data['postal_code']  ?? $existing['postal_code'],
        ':city'         => $data['city']         ?? $existing['city'],
        ':notes'        => $data['notes']        ?? $existing['notes'],
        ':email'        => $existing['email'],
    ]);

    return [
        'id'    => $existing['id'],
        'email' => $existing['email'],
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
    if (empty($data['delivery_address'])) {
        throw new InvalidArgumentException('delivery_address is required');
    }
    if (empty($data['billing_address'])) {
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

        $pdo->prepare(<<<SQL
INSERT INTO orders (
    id, created_at, status, total_price,
    billing_address_id, customer_id,
    delivery_address_id, supplier_id, weekly_menu_id
) VALUES (
    :id, NOW(6), 'PENDING', :total_price,
    :billing_address_id, :customer_id,
    :delivery_address_id, :supplier_id, :weekly_menu_id
)
SQL)->execute([
            ':id'                  => uuidToBin($orderId),
            ':total_price'         => round($totalPrice, 2),
            ':billing_address_id'  => uuidToBin($billingAddressId),
            ':customer_id'         => $customerId,
            ':delivery_address_id' => uuidToBin($deliveryAddressId),
            ':supplier_id'         => $data['supplier_id'],
            ':weekly_menu_id'      => uuidToBin($data['weekly_menu_id']),
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

        // 7. E-Mails versenden – nach commit, außerhalb der Transaktion
        try {
            $supplierData = getSupplierById($data['supplier_id']);

            if (!empty($data['customer']['email'])) {
                sendOrderConfirmationToCustomer(
                    $completedOrder,
                    $data['customer'],
                    $supplierData
                );
            }

            if ($supplierData && !empty($supplierData['email'])) {
                sendOrderNotificationToSupplier(
                    $completedOrder,
                    $data['customer'],
                    $supplierData
                );
            }
        } catch (Throwable $mailError) {
            error_log('Mail error: ' . $mailError->getMessage());
        }

        return $completedOrder;

    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}