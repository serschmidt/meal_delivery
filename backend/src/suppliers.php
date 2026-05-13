<?php
// src/suppliers.php

require_once __DIR__ . '/../config/db.php';

function mapSupplierToApi(array $row): array
{
    return [
        'id' => $row['id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'isActive' => (bool) $row['is_active'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'payment' => [
            'accountHolder' => $row['account_holder'],
            'iban' => $row['iban'],
            'paypalLink' => $row['paypal_link'],
        ],
        'address' => [
            'street' => $row['street'],
            'houseNumber' => $row['house_number'],
            'postalCode' => $row['postal_code'],
            'city' => $row['city'],
        ],
    ];
}

function getAllSuppliers(): array
{
    $sql = "
        SELECT
            s.id,
            s.full_name,
            s.email,
            s.phone,
            s.street,
            s.house_number,
            s.postal_code,
            s.city,
            s.is_active,
            s.created_at,
            s.updated_at,
            spd.account_holder,
            spd.iban,
            spd.paypal_link
        FROM suppliers s
        LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
        ORDER BY s.full_name
    ";

    $stmt = db()->query($sql);
    $rows = $stmt->fetchAll();

    return array_map('mapSupplierToApi', $rows);
}

function getSupplierById(string $id): ?array
{
    $sql = "
        SELECT
            s.id,
            s.full_name,
            s.email,
            s.phone,
            s.street,
            s.house_number,
            s.postal_code,
            s.city,
            s.is_active,
            s.created_at,
            s.updated_at,
            spd.account_holder,
            spd.iban,
            spd.paypal_link
        FROM suppliers s
        LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
        WHERE s.id = :id
        LIMIT 1
    ";

    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => $id]);
    $supplier = $stmt->fetch();

    return $supplier ? mapSupplierToApi($supplier) : null;
}

function searchSuppliers(?string $q): array
{
    $q = trim((string) $q);

    if ($q === '') {
        return getAllSuppliers();
    }

    $pdo = db();

    if (preg_match('/^\d+$/', $q)) {
        $sql = "
            SELECT
                s.id,
                s.full_name,
                s.email,
                s.phone,
                s.street,
                s.house_number,
                s.postal_code,
                s.city,
                s.is_active,
                s.created_at,
                s.updated_at,
                spd.account_holder,
                spd.iban,
                spd.paypal_link
            FROM suppliers s
            LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
            WHERE s.postal_code LIKE :pattern
            ORDER BY s.full_name
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':pattern' => $q . '%'
        ]);

        return array_map('mapSupplierToApi', $stmt->fetchAll());
    }

    $sql = "
        SELECT
            s.id,
            s.full_name,
            s.email,
            s.phone,
            s.street,
            s.house_number,
            s.postal_code,
            s.city,
            s.is_active,
            s.created_at,
            s.updated_at,
            spd.account_holder,
            spd.iban,
            spd.paypal_link
        FROM suppliers s
        LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
        WHERE LOWER(s.city) LIKE LOWER(:pattern)
        ORDER BY s.full_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':pattern' => $q . '%'
    ]);

    return $stmt->fetchAll();
}

function createSupplier(array $data): array
{
    $normalized = validateAndNormalizeSupplierPayload($data, false);
    $pdo = db();
    $pdo->beginTransaction();

    try {
        ensureSupplierEmailIsUnique($normalized['email']);

        $supplierId = generateUuidV4();

        $stmt = $pdo->prepare("
            INSERT INTO suppliers (
                id,
                full_name,
                email,
                password_hash,
                phone,
                street,
                house_number,
                postal_code,
                city,
                is_active
            ) VALUES (
                :id,
                :full_name,
                :email,
                :password_hash,
                :phone,
                :street,
                :house_number,
                :postal_code,
                :city,
                :is_active
            )
        ");

        $stmt->execute([
            ':id' => $supplierId,
            ':full_name' => $normalized['supplierName'],
            ':email' => $normalized['email'],
            ':password_hash' => password_hash($normalized['password'], PASSWORD_DEFAULT),
            ':phone' => $normalized['phone'],
            ':street' => $normalized['street'],
            ':house_number' => $normalized['houseNumber'],
            ':postal_code' => $normalized['postalCode'],
            ':city' => $normalized['city'],
            ':is_active' => 1,
        ]);

        insertSupplierPaymentDetails($pdo, $supplierId, $normalized);

        if ($normalized['referrerName'] !== null) {
            insertSupplierReferral($pdo, $supplierId, $normalized['referrerName']);
        }

        $pdo->commit();

        return getSupplierById($supplierId);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $e;
    }
}

function updateSupplier(string $id, array $data): ?array
{
    $existing = getSupplierById($id);

    if ($existing === null) {
        return null;
    }

    $normalized = validateAndNormalizeSupplierPayload($data, true);
    $pdo = db();
    $pdo->beginTransaction();

    try {
        ensureSupplierEmailIsUnique($normalized['email'], $id);

        $sql = "
            UPDATE suppliers
            SET
                full_name = :full_name,
                email = :email,
                phone = :phone,
                street = :street,
                house_number = :house_number,
                postal_code = :postal_code,
                city = :city,
                is_active = :is_active
        ";

        $params = [
            ':full_name' => $normalized['supplierName'],
            ':email' => $normalized['email'],
            ':phone' => $normalized['phone'],
            ':street' => $normalized['street'],
            ':house_number' => $normalized['houseNumber'],
            ':postal_code' => $normalized['postalCode'],
            ':city' => $normalized['city'],
            ':is_active' => $normalized['isActive'] ? 1 : 0,
            ':id' => $id,
        ];

        if ($normalized['password'] !== null) {
            $sql .= ", password_hash = :password_hash";
            $params[':password_hash'] = password_hash($normalized['password'], PASSWORD_DEFAULT);
        }

        $sql .= " WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        upsertSupplierPaymentDetails($pdo, $id, $normalized);
        replaceSupplierReferral($pdo, $id, $normalized['referrerName']);

        $pdo->commit();

        return getSupplierById($id);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $e;
    }
}

function validateAndNormalizeSupplierPayload(array $data, bool $isUpdate = false): array
{
    $supplierName = trim((string) ($data['supplierName'] ?? ''));
    $email = trim((string) ($data['email'] ?? ''));
    $password = isset($data['password']) ? trim((string) $data['password']) : '';
    $phone = trim((string) ($data['phone'] ?? ''));
    $street = trim((string) ($data['street'] ?? ''));
    $houseNumber = trim((string) ($data['houseNumber'] ?? ''));
    $postalCode = trim((string) ($data['postalCode'] ?? ''));
    $city = trim((string) ($data['city'] ?? ''));
    $accountHolder = trim((string) ($data['accountHolder'] ?? ''));
    $iban = strtoupper(str_replace(' ', '', trim((string) ($data['iban'] ?? ''))));
    $paypalLink = trim((string) ($data['paypalLink'] ?? ''));
    $referrerName = trim((string) ($data['referrerName'] ?? ''));
    $isActive = isset($data['isActive']) ? (bool) $data['isActive'] : true;

    if ($supplierName === '') {
        throw new InvalidArgumentException('Name des Lieferanten ist erforderlich.');
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Bitte eine gültige E-Mail-Adresse eingeben.');
    }

    if (!$isUpdate && $password === '') {
        throw new InvalidArgumentException('Passwort ist erforderlich.');
    }

    if ($isUpdate && $password === '') {
        $password = null;
    }

    if (!$isUpdate && $password !== null && strlen($password) < 8) {
        throw new InvalidArgumentException('Das Passwort muss mindestens 8 Zeichen lang sein.');
    }

    if ($isUpdate && $password !== null && strlen($password) < 8) {
        throw new InvalidArgumentException('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
    }

    if ($street === '') {
        throw new InvalidArgumentException('Straße ist erforderlich.');
    }

    if ($houseNumber === '') {
        throw new InvalidArgumentException('Hausnummer ist erforderlich.');
    }

    if ($postalCode === '') {
        throw new InvalidArgumentException('PLZ ist erforderlich.');
    }

    if ($city === '') {
        throw new InvalidArgumentException('Ort ist erforderlich.');
    }

    if ($iban === '' && $paypalLink === '') {
        throw new InvalidArgumentException('Bitte mindestens IBAN oder PayPal-Link angeben.');
    }

    if ($paypalLink !== '' && !filter_var($paypalLink, FILTER_VALIDATE_URL)) {
        throw new InvalidArgumentException('Bitte einen gültigen PayPal-Link angeben.');
    }

    if ($paypalLink !== '' && !preg_match('#^https?://#i', $paypalLink)) {
        throw new InvalidArgumentException('Der PayPal-Link muss mit http:// oder https:// beginnen.');
    }

    return [
        'supplierName' => $supplierName,
        'email' => $email,
        'password' => $password,
        'phone' => $phone !== '' ? $phone : null,
        'street' => $street,
        'houseNumber' => $houseNumber,
        'postalCode' => $postalCode,
        'city' => $city,
        'accountHolder' => $accountHolder !== '' ? $accountHolder : null,
        'iban' => $iban !== '' ? $iban : null,
        'paypalLink' => $paypalLink !== '' ? $paypalLink : null,
        'referrerName' => $referrerName !== '' ? $referrerName : null,
        'isActive' => $isActive,
    ];
}

function ensureSupplierEmailIsUnique(string $email, ?string $excludeId = null): void
{
    $pdo = db();

    $sql = "SELECT id FROM suppliers WHERE email = :email";
    $params = [':email' => $email];

    if ($excludeId !== null) {
        $sql .= " AND id <> :exclude_id";
        $params[':exclude_id'] = $excludeId;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->fetch()) {
        throw new InvalidArgumentException('Diese E-Mail-Adresse ist bereits vergeben.');
    }
}

function insertSupplierPaymentDetails(PDO $pdo, string $supplierId, array $data): void
{
    $stmt = $pdo->prepare("
        INSERT INTO supplier_payment_details (
            id,
            account_holder,
            iban,
            paypal_link,
            supplier_id
        ) VALUES (
            :id,
            :account_holder,
            :iban,
            :paypal_link,
            :supplier_id
        )
    ");

    $stmt->execute([
        ':id' => uuidToBinary(generateUuidV4()),
        ':account_holder' => $data['accountHolder'],
        ':iban' => $data['iban'],
        ':paypal_link' => $data['paypalLink'],
        ':supplier_id' => $supplierId,
    ]);
}

function upsertSupplierPaymentDetails(PDO $pdo, string $supplierId, array $data): void
{
    $stmt = $pdo->prepare("
        SELECT id
        FROM supplier_payment_details
        WHERE supplier_id = :supplier_id
        LIMIT 1
    ");
    $stmt->execute([':supplier_id' => $supplierId]);

    $existing = $stmt->fetch();

    if ($existing) {
        $updateStmt = $pdo->prepare("
            UPDATE supplier_payment_details
            SET
                account_holder = :account_holder,
                iban = :iban,
                paypal_link = :paypal_link
            WHERE supplier_id = :supplier_id
        ");

        $updateStmt->execute([
            ':account_holder' => $data['accountHolder'],
            ':iban' => $data['iban'],
            ':paypal_link' => $data['paypalLink'],
            ':supplier_id' => $supplierId,
        ]);

        return;
    }

    insertSupplierPaymentDetails($pdo, $supplierId, $data);
}

function insertSupplierReferral(PDO $pdo, string $supplierId, string $referrerName): void
{
    $stmt = $pdo->prepare("
        INSERT INTO supplier_referrals (
            id,
            referrer_name,
            supplier_id
        ) VALUES (
            :id,
            :referrer_name,
            :supplier_id
        )
    ");

    $stmt->execute([
        ':id' => uuidToBinary(generateUuidV4()),
        ':referrer_name' => $referrerName,
        ':supplier_id' => $supplierId,
    ]);
}

function replaceSupplierReferral(PDO $pdo, string $supplierId, ?string $referrerName): void
{
    $deleteStmt = $pdo->prepare("
        DELETE FROM supplier_referrals
        WHERE supplier_id = :supplier_id
    ");
    $deleteStmt->execute([
        ':supplier_id' => $supplierId
    ]);

    if ($referrerName !== null) {
        insertSupplierReferral($pdo, $supplierId, $referrerName);
    }
}

function generateUuidV4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function uuidToBinary(string $uuid): string
{
    return hex2bin(str_replace('-', '', $uuid));
}
