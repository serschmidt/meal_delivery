<?php
// src/suppliers.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../src/mailer.php';

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

function normalizeGermanSearchTerm(string $value): string
{
    $value = trim(mb_strtolower($value, 'UTF-8'));

    $value = str_replace(
        ['ä', 'ö', 'ü', 'ß'],
        ['ae', 'oe', 'ue', 'ss'],
        $value
    );

    return $value;
}

function buildGermanSearchVariants(string $value): array
{
    $normalized = normalizeGermanSearchTerm($value);

    $variants = [
        $normalized,
        str_replace(['ae', 'oe', 'ue'], ['a', 'o', 'u'], $normalized),
    ];

    return array_values(array_unique(array_filter($variants, static fn ($item) => $item !== '')));
}

function getSupplierDeliveryAreas(string $supplierId, string $q = ''): array
{
    if (trim($supplierId) === '') {
        throw new InvalidArgumentException('supplier id is required');
    }

    $pdo = db();
    $q = trim($q);

    $normalizedCitySql = "
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    LOWER(city),
                                    'ä', 'ae'
                                ),
                                'ö', 'oe'
                            ),
                            'ü', 'ue'
                        ),
                        'ß', 'ss'
                    ),
                    'ae', 'a'
                ),
                'oe', 'o'
            ),
            'ue', 'u'
        )
    ";

    $citySql = <<<SQL
SELECT DISTINCT city
FROM supplier_delivery_areas
WHERE supplier_id = :supplier_id
  AND city <> ''
SQL;

    $postalSql = <<<SQL
SELECT DISTINCT postal_code
FROM supplier_delivery_areas
WHERE supplier_id = :supplier_id
  AND postal_code <> ''
SQL;

    $params = [
        ':supplier_id' => $supplierId,
    ];

    if ($q !== '') {
        $variants = buildGermanSearchVariants($q);

        $cityConditions = [];
        foreach ($variants as $index => $variant) {
            $paramName = ":contains_q_{$index}";
            $cityConditions[] = "{$normalizedCitySql} LIKE {$paramName}";
            $params[$paramName] = '%' . $variant . '%';
        }

        $cityConditionSql = implode(' OR ', $cityConditions);

        $citySql .= " AND (({$cityConditionSql}) OR postal_code LIKE :prefix_q)";
        $postalSql .= " AND (({$cityConditionSql}) OR postal_code LIKE :prefix_q)";

        $params[':prefix_q'] = $q . '%';
    }

    $citySql .= " ORDER BY city ASC";
    $postalSql .= " ORDER BY postal_code ASC";

    $cityStmt = $pdo->prepare($citySql);
    $cityStmt->execute($params);
    $cities = $cityStmt->fetchAll(PDO::FETCH_COLUMN);

    $postalStmt = $pdo->prepare($postalSql);
    $postalStmt->execute($params);
    $postalCodes = $postalStmt->fetchAll(PDO::FETCH_COLUMN);

    return [
        'id' => $supplierId,
        'cities' => array_values($cities ?: []),
        'postal_codes' => array_values($postalCodes ?: []),
    ];
}

function findSupplierByDeliveryArea(string $query): ?array
{
    $query = trim($query);

    if ($query === '') {
        return null;
    }

    $sql = <<<SQL
SELECT
    s.id,
    s.full_name,
    s.email,
    s.phone,
    s.is_active,
    s.created_at,
    s.updated_at,
    s.street,
    s.house_number,
    s.postal_code,
    s.city,
    spd.account_holder,
    spd.iban,
    spd.paypal_link
FROM supplier_delivery_areas sda
INNER JOIN suppliers s ON s.id = sda.supplier_id
LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
WHERE s.is_active = 1
  AND (
    sda.postal_code LIKE :postal_code
    OR LOWER(sda.city) LIKE LOWER(:city)
  )
ORDER BY s.full_name
LIMIT 1
SQL;

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':postal_code' => $query . '%',
        ':city' => '%' . $query . '%',
    ]);

    $row = $stmt->fetch();

    if (!$row) {
        return null;
    }

    return [
        'id' => $row['id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'isActive' => (bool) $row['is_active'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'address' => [
            'street' => $row['street'],
            'houseNumber' => $row['house_number'],
            'postalCode' => $row['postal_code'],
            'city' => $row['city'],
        ],
        'payment' => [
            'accountHolder' => $row['account_holder'],
            'iban' => $row['iban'],
            'paypalLink' => $row['paypal_link'],
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
        WHERE s.is_active = 1
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

    function getSupplierAuthRowById(string $id): ?array
{
    $sql = "
        SELECT
            s.id,
            s.full_name,
            s.email,
            s.password_hash,
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
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function getSupplierProfileForSelf(string $supplierId): ?array
{
    $row = getSupplierAuthRowById($supplierId);

    if (!$row) {
        return null;
    }

    return [
        'id' => $row['id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'street' => $row['street'],
        'houseNumber' => $row['house_number'],
        'postalCode' => $row['postal_code'],
        'city' => $row['city'],
        'isActive' => (bool) $row['is_active'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
        'payment' => [
            'accountHolder' => $row['account_holder'],
            'iban' => $row['iban'],
            'paypalLink' => $row['paypal_link'],
        ],
    ];
}

function validateSupplierSelfServicePassword(string $password): void
{
    if (strlen($password) < 8) {
        throw new InvalidArgumentException('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
    }

    if (!preg_match('/[A-Z]/', $password)) {
        throw new InvalidArgumentException('Das neue Passwort muss mindestens einen Großbuchstaben enthalten.');
    }

    if (!preg_match('/[a-z]/', $password)) {
        throw new InvalidArgumentException('Das neue Passwort muss mindestens einen Kleinbuchstaben enthalten.');
    }

    if (!preg_match('/[0-9]/', $password)) {
        throw new InvalidArgumentException('Das neue Passwort muss mindestens eine Zahl enthalten.');
    }

    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        throw new InvalidArgumentException('Das neue Passwort muss mindestens ein Sonderzeichen enthalten.');
    }
}

function updateSupplierProfileSelfService(string $supplierId, array $data): ?array
{
    $existing = getSupplierAuthRowById($supplierId);

    if (!$existing) {
        return null;
    }

    $fullName = trim((string) ($data['fullName'] ?? ''));
    $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
    $phone = trim((string) ($data['phone'] ?? ''));
    $street = trim((string) ($data['street'] ?? ''));
    $houseNumber = trim((string) ($data['houseNumber'] ?? ''));
    $postalCode = trim((string) ($data['postalCode'] ?? ''));
    $city = trim((string) ($data['city'] ?? ''));
    $accountHolder = trim((string) (($data['payment']['accountHolder'] ?? '')));
    $iban = strtoupper(str_replace(' ', '', trim((string) ($data['payment']['iban'] ?? ''))));
    $paypalLink = trim((string) ($data['payment']['paypalLink'] ?? ''));

    if ($fullName === '') {
        throw new InvalidArgumentException('Name ist erforderlich.');
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Bitte eine gültige E-Mail-Adresse eingeben.');
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

    ensureSupplierEmailIsUnique($email, $supplierId);

    $pdo = db();
    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("
            UPDATE suppliers
            SET
                full_name = :full_name,
                email = :email,
                phone = :phone,
                street = :street,
                house_number = :house_number,
                postal_code = :postal_code,
                city = :city
            WHERE id = :id
        ");

        $stmt->execute([
            ':full_name' => $fullName,
            ':email' => $email,
            ':phone' => $phone !== '' ? $phone : null,
            ':street' => $street,
            ':house_number' => $houseNumber,
            ':postal_code' => $postalCode,
            ':city' => $city,
            ':id' => $supplierId,
        ]);

        upsertSupplierPaymentDetails($pdo, $supplierId, [
            'accountHolder' => $accountHolder !== '' ? $accountHolder : null,
            'iban' => $iban !== '' ? $iban : null,
            'paypalLink' => $paypalLink !== '' ? $paypalLink : null,
        ]);

        $pdo->commit();

        return getSupplierProfileForSelf($supplierId);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $e;
    }
}

function changeSupplierPasswordSelfService(string $supplierId, array $data): void
{
    $currentPassword = (string) ($data['currentPassword'] ?? '');
    $newPassword = (string) ($data['newPassword'] ?? '');

    if ($currentPassword === '') {
        throw new InvalidArgumentException('Das aktuelle Passwort ist erforderlich.');
    }

    if ($newPassword === '') {
        throw new InvalidArgumentException('Das neue Passwort ist erforderlich.');
    }

    validateSupplierSelfServicePassword($newPassword);

    $supplier = getSupplierAuthRowById($supplierId);

    if (!$supplier) {
        throw new RuntimeException('Lieferant nicht gefunden.');
    }

    if (!password_verify($currentPassword, $supplier['password_hash'])) {
        throw new InvalidArgumentException('Das aktuelle Passwort ist nicht korrekt.');
    }

    $stmt = db()->prepare("
        UPDATE suppliers
        SET password_hash = :password_hash
        WHERE id = :id
    ");

    $stmt->execute([
        ':password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
        ':id' => $supplierId,
    ]);
}

function searchSuppliers(?string $q): array
{
    $q = trim((string) $q);

    if ($q === '') {
        return getAllSuppliers();
    }

    $pdo = db();

    // Nur Zahlen => nur PLZ durchsuchen
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
            WHERE s.is_active = 1
              AND s.postal_code LIKE :pattern
            ORDER BY s.full_name
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':pattern' => $q . '%'
        ]);

        return array_map('mapSupplierToApi', $stmt->fetchAll());
    }

    // Enthält Buchstaben => Name und Stadt durchsuchen
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
        WHERE s.is_active = 1
          AND (
              LOWER(s.full_name) LIKE LOWER(:pattern)
              OR LOWER(s.city) LIKE LOWER(:pattern)
          )
        ORDER BY s.full_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':pattern' => $q . '%'
    ]);

    return array_map('mapSupplierToApi', $stmt->fetchAll());
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
