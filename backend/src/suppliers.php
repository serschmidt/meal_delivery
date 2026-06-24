<?php
// src/suppliers.php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../src/mailer.php';

function buildFullName(?string $firstName, ?string $lastName, ?string $fallbackFullName = null): string
{
  $firstName = trim((string) $firstName);
  $lastName = trim((string) $lastName);
  $fallbackFullName = trim((string) $fallbackFullName);

  $composed = trim($firstName . ' ' . $lastName);

  if ($composed !== '') {
    return $composed;
  }

  return $fallbackFullName;
}

function mapSupplierToApi(array $row): array
{
  $fullName = buildFullName(
    $row['first_name'] ?? null,
    $row['last_name'] ?? null,
    $row['full_name'] ?? null
  );

  return [
    'id' => $row['id'],
    'firstName' => $row['first_name'] ?? null,
    'lastName' => $row['last_name'] ?? null,
    'fullName' => $fullName,
    'businessName' => $row['business_name'] ?? null,
    'email' => $row['email'],
    'phone' => $row['phone'],
    'website' => $row['website'] ?? null,
    'isActive' => (bool) $row['is_active'],
    'createdAt' => $row['created_at'],
    'updatedAt' => $row['updated_at'],
    'payment' => [
      'accountHolder' => $row['account_holder'],
      'iban' => $row['iban'],
      'paypalLink' => $row['paypal_link'],
      'mollieProfileId' => $row['mollie_profile_id'] ?? null,
    ],
    'address' => [
      'street' => $row['street'],
      'houseNumber' => $row['house_number'],
      'postalCode' => $row['postal_code'],
      'city' => $row['city'],
    ],
  ];
}

function mapSupplierToEditablePayload(array $supplier): array
{
  return [
    'firstName' => $supplier['firstName'] ?? null,
    'lastName' => $supplier['lastName'] ?? null,
    'fullName' => $supplier['fullName'] ?? '',
    'businessName' => $supplier['businessName'] ?? '',
    'email' => $supplier['email'] ?? '',
    'phone' => $supplier['phone'] ?? null,
    'website' => $supplier['website'] ?? null,
    'street' => $supplier['address']['street'] ?? '',
    'houseNumber' => $supplier['address']['houseNumber'] ?? '',
    'postalCode' => $supplier['address']['postalCode'] ?? '',
    'city' => $supplier['address']['city'] ?? '',
    'accountHolder' => $supplier['payment']['accountHolder'] ?? null,
    'iban' => $supplier['payment']['iban'] ?? null,
    'paypalLink' => $supplier['payment']['paypalLink'] ?? null,
    'mollieProfileId' => $supplier['payment']['mollieProfileId'] ?? null,
    'referrerName' => null,
    'isActive' => (bool)($supplier['isActive'] ?? true),
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

  return array_values(array_unique(array_filter($variants, static fn($item) => $item !== '')));
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
SQL;

  $postalSql = <<<SQL
SELECT DISTINCT postal_code
FROM supplier_delivery_areas
WHERE supplier_id = :supplier_id
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

  $citySql .= ' ORDER BY city ASC';
  $postalSql .= ' ORDER BY postal_code ASC';

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

  $pdo = db();

  $supplierSql = <<<SQL
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.full_name,
    s.business_name,
    s.email,
    s.phone,
    s.website,
    s.is_active,
    s.created_at,
    s.updated_at,
    s.street,
    s.house_number,
    s.postal_code,
    s.city,
    spd.account_holder,
    spd.iban,
    spd.paypal_link,
    spd.mollie_profile_id
FROM supplier_delivery_areas sda
INNER JOIN suppliers s ON s.id = sda.supplier_id
LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
WHERE s.is_active = 1
  AND (
      sda.postal_code LIKE :postal_code
      OR LOWER(sda.city) LIKE LOWER(:city)
  )
ORDER BY s.business_name ASC, s.full_name ASC
LIMIT 1
SQL;

  $supplierStmt = $pdo->prepare($supplierSql);
  $supplierStmt->execute([
    ':postal_code' => $query . '%',
    ':city' => '%' . $query . '%',
  ]);

  $row = $supplierStmt->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    return null;
  }

  $supplier = mapSupplierToApi($row);
  $deliveryAreas = getSupplierDeliveryAreas($supplier['id'], $query);

  return [
    'supplier' => $supplier,
    'deliveryArea' => [
      'cities' => $deliveryAreas['cities'] ?? [],
      'postalCodes' => $deliveryAreas['postal_codes'] ?? [],
    ],
  ];
}

function getSupplierDeliveryAreaCheck(string $supplierId, string $q = ''): array
{
  $supplier = getSupplierById($supplierId);

  if ($supplier === null) {
    throw new RuntimeException('Supplier not found');
  }

  $deliveryAreas = getSupplierDeliveryAreas($supplierId, $q);

  return [
    'supplier' => [
      'id' => $supplier['id'],
      'fullName' => $supplier['fullName'] ?? null,
      'businessName' => $supplier['businessName'] ?? null,
    ],
    'deliveryArea' => [
      'cities' => array_values($deliveryAreas['cities'] ?? []),
      'postalCodes' => array_values($deliveryAreas['postal_codes'] ?? []),
    ],
  ];
}

function getAllSuppliers(): array
{
  $sql = "
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.full_name,
    s.business_name,
    s.email,
    s.phone,
    s.website,
    s.street,
    s.house_number,
    s.postal_code,
    s.city,
    s.is_active,
    s.created_at,
    s.updated_at,
    spd.account_holder,
    spd.iban,
    spd.paypal_link,
    spd.mollie_profile_id
FROM suppliers s
LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
WHERE s.is_active = 1
ORDER BY s.business_name ASC, s.full_name ASC
";

  $stmt = db()->query($sql);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return array_map('mapSupplierToApi', $rows);
}

function getSupplierById(string $id): ?array
{
  $sql = "
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.full_name,
    s.business_name,
    s.email,
    s.phone,
    s.website,
    s.street,
    s.house_number,
    s.postal_code,
    s.city,
    s.is_active,
    s.created_at,
    s.updated_at,
    spd.account_holder,
    spd.iban,
    spd.paypal_link,
    spd.mollie_profile_id
FROM suppliers s
LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
WHERE s.id = :id
LIMIT 1
";

  $stmt = db()->prepare($sql);
  $stmt->execute([':id' => $id]);
  $supplier = $stmt->fetch(PDO::FETCH_ASSOC);

  return $supplier ? mapSupplierToApi($supplier) : null;
}

function getSupplierAuthRowById(string $id): ?array
{
  $sql = "
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.full_name,
    s.business_name,
    s.email,
    s.password_hash,
    s.phone,
    s.website,
    s.street,
    s.house_number,
    s.postal_code,
    s.city,
    s.is_active,
    s.created_at,
    s.updated_at,
    spd.account_holder,
    spd.iban,
    spd.paypal_link,
    spd.mollie_profile_id
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
    'firstName' => $row['first_name'] ?? null,
    'lastName' => $row['last_name'] ?? null,
    'fullName' => buildFullName(
      $row['first_name'] ?? null,
      $row['last_name'] ?? null,
      $row['full_name'] ?? null
    ),
    'businessName' => $row['business_name'] ?? null,
    'email' => $row['email'],
    'phone' => $row['phone'],
    'website' => $row['website'] ?? null,
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
      'mollieProfileId' => $row['mollie_profile_id'] ?? null,
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

  $firstName = trim((string) ($data['firstName'] ?? ($existing['first_name'] ?? '')));
  $lastName = trim((string) ($data['lastName'] ?? ($existing['last_name'] ?? '')));
  $fullNameInput = trim((string) ($data['fullName'] ?? ''));
  $businessName = trim((string) ($data['businessName'] ?? ($existing['business_name'] ?? '')));
  $email = mb_strtolower(trim((string) ($data['email'] ?? ($existing['email'] ?? ''))));
  $phone = trim((string) ($data['phone'] ?? ($existing['phone'] ?? '')));
  $website = trim((string) ($data['website'] ?? ($existing['website'] ?? '')));
  $street = trim((string) ($data['street'] ?? ($existing['street'] ?? '')));
  $houseNumber = trim((string) ($data['houseNumber'] ?? ($existing['house_number'] ?? '')));
  $postalCode = trim((string) ($data['postalCode'] ?? ($existing['postal_code'] ?? '')));
  $city = trim((string) ($data['city'] ?? ($existing['city'] ?? '')));
  $accountHolder = trim((string) (($data['payment']['accountHolder'] ?? '')));
  $iban = strtoupper(str_replace(' ', '', trim((string) ($data['payment']['iban'] ?? ''))));
  $paypalLink = trim((string) ($data['payment']['paypalLink'] ?? ''));

  $fullName = $fullNameInput !== ''
    ? $fullNameInput
    : buildFullName($firstName, $lastName, $existing['full_name'] ?? '');

  if ($fullName === '') {
    throw new InvalidArgumentException('Name ist erforderlich.');
  }

  if ($businessName === '') {
    throw new InvalidArgumentException('Geschäftsbezeichnung ist erforderlich.');
  }

  if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    throw new InvalidArgumentException('Bitte eine gültige E-Mail-Adresse eingeben.');
  }

  if ($website !== '' && !filter_var($website, FILTER_VALIDATE_URL)) {
    throw new InvalidArgumentException('Bitte eine gültige Website-URL eingeben.');
  }

  if ($website !== '' && !preg_match('#^https?://#i', $website)) {
    throw new InvalidArgumentException('Die Website muss mit http:// oder https:// beginnen.');
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
    first_name = :first_name,
    last_name = :last_name,
    full_name = :full_name,
    business_name = :business_name,
    email = :email,
    phone = :phone,
    website = :website,
    street = :street,
    house_number = :house_number,
    postal_code = :postal_code,
    city = :city
WHERE id = :id
");

    $stmt->execute([
      ':first_name' => $firstName !== '' ? $firstName : null,
      ':last_name' => $lastName !== '' ? $lastName : null,
      ':full_name' => $fullName,
      ':business_name' => $businessName,
      ':email' => $email,
      ':phone' => $phone !== '' ? $phone : null,
      ':website' => $website !== '' ? $website : null,
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
      'mollieProfileId' => $existing['mollie_profile_id'] ?? null,
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

  if (preg_match('/^\d+$/', $q)) {
    $sql = "
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.full_name,
    s.business_name,
    s.email,
    s.phone,
    s.website,
    s.street,
    s.house_number,
    s.postal_code,
    s.city,
    s.is_active,
    s.created_at,
    s.updated_at,
    spd.account_holder,
    spd.iban,
    spd.paypal_link,
    spd.mollie_profile_id
FROM suppliers s
LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
WHERE s.is_active = 1
  AND s.postal_code LIKE :pattern
ORDER BY s.business_name ASC, s.full_name ASC
";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
      ':pattern' => $q . '%'
    ]);

    return array_map('mapSupplierToApi', $stmt->fetchAll(PDO::FETCH_ASSOC));
  }

  $sql = "
SELECT
    s.id,
    s.first_name,
    s.last_name,
    s.full_name,
    s.business_name,
    s.email,
    s.phone,
    s.website,
    s.street,
    s.house_number,
    s.postal_code,
    s.city,
    s.is_active,
    s.created_at,
    s.updated_at,
    spd.account_holder,
    spd.iban,
    spd.paypal_link,
    spd.mollie_profile_id
FROM suppliers s
LEFT JOIN supplier_payment_details spd ON spd.supplier_id = s.id
WHERE s.is_active = 1
  AND (
      LOWER(s.full_name) LIKE LOWER(:pattern)
      OR LOWER(COALESCE(s.business_name, '')) LIKE LOWER(:pattern)
      OR LOWER(s.city) LIKE LOWER(:pattern)
  )
ORDER BY s.business_name ASC, s.full_name ASC
";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':pattern' => $q . '%'
  ]);

  return array_map('mapSupplierToApi', $stmt->fetchAll(PDO::FETCH_ASSOC));
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
    first_name,
    last_name,
    full_name,
    business_name,
    email,
    password_hash,
    phone,
    website,
    street,
    house_number,
    postal_code,
    city,
    is_active
) VALUES (
    :id,
    :first_name,
    :last_name,
    :full_name,
    :business_name,
    :email,
    :password_hash,
    :phone,
    :website,
    :street,
    :house_number,
    :postal_code,
    :city,
    :is_active
)
");

    $stmt->execute([
      ':id' => $supplierId,
      ':first_name' => $normalized['firstName'],
      ':last_name' => $normalized['lastName'],
      ':full_name' => $normalized['fullName'],
      ':business_name' => $normalized['businessName'],
      ':email' => $normalized['email'],
      ':password_hash' => password_hash($normalized['password'], PASSWORD_DEFAULT),
      ':phone' => $normalized['phone'],
      ':website' => $normalized['website'],
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
    first_name = :first_name,
    last_name = :last_name,
    full_name = :full_name,
    business_name = :business_name,
    email = :email,
    phone = :phone,
    website = :website,
    street = :street,
    house_number = :house_number,
    postal_code = :postal_code,
    city = :city,
    is_active = :is_active
";

    $params = [
      ':first_name' => $normalized['firstName'],
      ':last_name' => $normalized['lastName'],
      ':full_name' => $normalized['fullName'],
      ':business_name' => $normalized['businessName'],
      ':email' => $normalized['email'],
      ':phone' => $normalized['phone'],
      ':website' => $normalized['website'],
      ':street' => $normalized['street'],
      ':house_number' => $normalized['houseNumber'],
      ':postal_code' => $normalized['postalCode'],
      ':city' => $normalized['city'],
      ':is_active' => $normalized['isActive'] ? 1 : 0,
      ':id' => $id,
    ];

    if ($normalized['password'] !== null) {
      $sql .= ', password_hash = :password_hash';
      $params[':password_hash'] = password_hash($normalized['password'], PASSWORD_DEFAULT);
    }

    $sql .= ' WHERE id = :id';

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

function patchSupplier(string $id, array $data): ?array
{
  $existing = getSupplierById($id);

  if ($existing === null) {
    return null;
  }

  $baseData = mapSupplierToEditablePayload($existing);
  $merged = array_merge($baseData, $data);

  if (array_key_exists('payment', $data) && is_array($data['payment'])) {
    $merged['accountHolder'] = array_key_exists('accountHolder', $data['payment'])
      ? $data['payment']['accountHolder']
      : $baseData['accountHolder'];

    $merged['iban'] = array_key_exists('iban', $data['payment'])
      ? $data['payment']['iban']
      : $baseData['iban'];

    $merged['paypalLink'] = array_key_exists('paypalLink', $data['payment'])
      ? $data['payment']['paypalLink']
      : $baseData['paypalLink'];

    $merged['mollieProfileId'] = array_key_exists('mollieProfileId', $data['payment'])
      ? $data['payment']['mollieProfileId']
      : $baseData['mollieProfileId'];
  }

  if (array_key_exists('address', $data) && is_array($data['address'])) {
    $merged['street'] = array_key_exists('street', $data['address'])
      ? $data['address']['street']
      : $baseData['street'];

    $merged['houseNumber'] = array_key_exists('houseNumber', $data['address'])
      ? $data['address']['houseNumber']
      : $baseData['houseNumber'];

    $merged['postalCode'] = array_key_exists('postalCode', $data['address'])
      ? $data['address']['postalCode']
      : $baseData['postalCode'];

    $merged['city'] = array_key_exists('city', $data['address'])
      ? $data['address']['city']
      : $baseData['city'];
  }

  return updateSupplier($id, $merged);
}

function validateAndNormalizeSupplierPayload(array $data, bool $isUpdate = false): array
{
  $firstName = trim((string) ($data['firstName'] ?? ''));
  $lastName = trim((string) ($data['lastName'] ?? ''));
  $fullNameInput = trim((string) ($data['fullName'] ?? ''));
  $businessName = trim((string) ($data['businessName'] ?? ''));
  $website = trim((string) ($data['website'] ?? ''));
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
  $mollieProfileId = trim((string) ($data['mollieProfileId'] ?? ''));
  $referrerName = trim((string) ($data['referrerName'] ?? ''));
  $isActive = isset($data['isActive']) ? (bool) $data['isActive'] : true;

  $fullName = $fullNameInput !== ''
    ? $fullNameInput
    : buildFullName($firstName, $lastName);

  if ($fullName === '') {
    throw new InvalidArgumentException('Name des Händlers ist erforderlich.');
  }

  if ($businessName === '') {
    throw new InvalidArgumentException('Geschäftsbezeichnung ist erforderlich.');
  }

  if ($website !== '' && !filter_var($website, FILTER_VALIDATE_URL)) {
    throw new InvalidArgumentException('Bitte eine gültige Website-URL eingeben.');
  }

  if ($website !== '' && !preg_match('#^https?://#i', $website)) {
    throw new InvalidArgumentException('Die Website muss mit http:// oder https:// beginnen.');
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
    'firstName' => $firstName !== '' ? $firstName : null,
    'lastName' => $lastName !== '' ? $lastName : null,
    'fullName' => $fullName,
    'businessName' => $businessName,
    'website' => $website !== '' ? $website : null,
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
    'mollieProfileId' => $mollieProfileId !== '' ? $mollieProfileId : null,
    'referrerName' => $referrerName !== '' ? $referrerName : null,
    'isActive' => $isActive,
  ];
}

function ensureSupplierEmailIsUnique(string $email, ?string $excludeId = null): void
{
  $pdo = db();

  $sql = 'SELECT id FROM suppliers WHERE email = :email';
  $params = [':email' => $email];

  if ($excludeId !== null) {
    $sql .= ' AND id <> :exclude_id';
    $params[':exclude_id'] = $excludeId;
  }

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  if ($stmt->fetch()) {
    throw new InvalidArgumentException('Diese E-Mail-Adresse ist bereits vergeben.');
  }
}

function assertMollieProfileIdIsUniqueViolation(PDOException $e): bool
{
  $errorInfo = $e->errorInfo ?? [];
  $mysqlCode = $errorInfo[1] ?? null;
  $message = $e->getMessage();

  return ((string) $e->getCode() === '23000' || $mysqlCode === 1062)
    && strpos($message, 'uk_supplier_payment_details_mollie_profile_id') !== false;
}

function insertSupplierPaymentDetails(PDO $pdo, string $supplierId, array $data): void
{
  try {
    $stmt = $pdo->prepare("
INSERT INTO supplier_payment_details (
    id,
    account_holder,
    iban,
    paypal_link,
    mollie_profile_id,
    supplier_id
) VALUES (
    :id,
    :account_holder,
    :iban,
    :paypal_link,
    :mollie_profile_id,
    :supplier_id
)
");

    $stmt->execute([
      ':id' => uuidToBinary(generateUuidV4()),
      ':account_holder' => $data['accountHolder'],
      ':iban' => $data['iban'],
      ':paypal_link' => $data['paypalLink'],
      ':mollie_profile_id' => $data['mollieProfileId'] ?? null,
      ':supplier_id' => $supplierId,
    ]);
  } catch (PDOException $e) {
    if (assertMollieProfileIdIsUniqueViolation($e)) {
      throw new InvalidArgumentException('Diese Mollie-Profil-ID ist bereits einem anderen Lieferanten zugeordnet.');
    }

    throw $e;
  }
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

  $existing = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($existing) {
    try {
      $updateStmt = $pdo->prepare("
UPDATE supplier_payment_details
SET
    account_holder = :account_holder,
    iban = :iban,
    paypal_link = :paypal_link,
    mollie_profile_id = :mollie_profile_id
WHERE supplier_id = :supplier_id
");

      $updateStmt->execute([
        ':account_holder' => $data['accountHolder'],
        ':iban' => $data['iban'],
        ':paypal_link' => $data['paypalLink'],
        ':mollie_profile_id' => $data['mollieProfileId'] ?? null,
        ':supplier_id' => $supplierId,
      ]);
    } catch (PDOException $e) {
      if (assertMollieProfileIdIsUniqueViolation($e)) {
        throw new InvalidArgumentException('Diese Mollie-Profil-ID ist bereits einem anderen Lieferanten zugeordnet.');
      }

      throw $e;
    }

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

function mapSupplierDeliveryAreaToApi(array $row): array
{
  return [
    'id' => $row['id'],
    'city' => $row['city'],
    'postalCode' => $row['postal_code'],
    'createdAt' => $row['created_at'] ?? null,
  ];
}

function validateAndNormalizeSupplierDeliveryAreaPayload(array $data): array
{
  $city = trim((string)($data['city'] ?? ''));
  $postalCode = preg_replace('/\D+/', '', (string)($data['postalCode'] ?? ''));

  if ($city === '') {
    throw new InvalidArgumentException('Stadt ist erforderlich.');
  }

  if ($postalCode === '') {
    throw new InvalidArgumentException('PLZ ist erforderlich.');
  }

  if (!preg_match('/^\d{5}$/', $postalCode)) {
    throw new InvalidArgumentException('PLZ muss aus genau 5 Ziffern bestehen.');
  }

  return [
    'city' => $city,
    'postalCode' => $postalCode,
  ];
}

function getSupplierDeliveryAreaById(string $supplierId, string $areaId): ?array
{
  $stmt = db()->prepare("
    SELECT id, supplier_id, city, postal_code, created_at
    FROM supplier_delivery_areas
    WHERE supplier_id = :supplier_id
      AND id = :id
    LIMIT 1
  ");

  $stmt->execute([
    ':supplier_id' => $supplierId,
    ':id' => $areaId,
  ]);

  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  return $row ? mapSupplierDeliveryAreaToApi($row) : null;
}

function listSupplierDeliveryAreas(string $supplierId): array
{
  if (trim($supplierId) === '') {
    throw new InvalidArgumentException('supplier id is required');
  }

  $stmt = db()->prepare("
    SELECT id, supplier_id, city, postal_code, created_at
    FROM supplier_delivery_areas
    WHERE supplier_id = :supplier_id
    ORDER BY city ASC, postal_code ASC
  ");

  $stmt->execute([
    ':supplier_id' => $supplierId,
  ]);

  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  return array_map('mapSupplierDeliveryAreaToApi', $rows);
}

function createSupplierDeliveryArea(string $supplierId, array $data): array
{
  if (trim($supplierId) === '') {
    throw new InvalidArgumentException('supplier id is required');
  }

  $normalized = validateAndNormalizeSupplierDeliveryAreaPayload($data);
  $pdo = db();

  try {
    $id = generateUuidV4();

    $stmt = $pdo->prepare("
      INSERT INTO supplier_delivery_areas (
        id,
        supplier_id,
        city,
        postal_code
      ) VALUES (
        :id,
        :supplier_id,
        :city,
        :postal_code
      )
    ");

    $stmt->execute([
      ':id' => $id,
      ':supplier_id' => $supplierId,
      ':city' => $normalized['city'],
      ':postal_code' => $normalized['postalCode'],
    ]);

    $created = getSupplierDeliveryAreaById($supplierId, $id);

    if ($created === null) {
      throw new RuntimeException('Liefergebiet konnte nicht geladen werden.');
    }

    return $created;
  } catch (PDOException $e) {
    $errorInfo = $e->errorInfo ?? [];
    $mysqlCode = $errorInfo[1] ?? null;

    if ((string)$e->getCode() === '23000' || $mysqlCode === 1062) {
      throw new InvalidArgumentException('Dieses Liefergebiet existiert bereits.');
    }

    throw $e;
  }
}

function updateSupplierDeliveryArea(string $supplierId, string $areaId, array $data): ?array
{
  if (trim($supplierId) === '' || trim($areaId) === '') {
    throw new InvalidArgumentException('supplier id and delivery area id are required');
  }

  $existing = getSupplierDeliveryAreaById($supplierId, $areaId);

  if ($existing === null) {
    return null;
  }

  $normalized = validateAndNormalizeSupplierDeliveryAreaPayload($data);
  $pdo = db();

  try {
    $stmt = $pdo->prepare("
      UPDATE supplier_delivery_areas
      SET city = :city,
          postal_code = :postal_code
      WHERE supplier_id = :supplier_id
        AND id = :id
    ");

    $stmt->execute([
      ':city' => $normalized['city'],
      ':postal_code' => $normalized['postalCode'],
      ':supplier_id' => $supplierId,
      ':id' => $areaId,
    ]);

    return getSupplierDeliveryAreaById($supplierId, $areaId);
  } catch (PDOException $e) {
    $errorInfo = $e->errorInfo ?? [];
    $mysqlCode = $errorInfo[1] ?? null;

    if ((string)$e->getCode() === '23000' || $mysqlCode === 1062) {
      throw new InvalidArgumentException('Dieses Liefergebiet existiert bereits.');
    }

    throw $e;
  }
}

function deleteSupplierDeliveryArea(string $supplierId, string $areaId): bool
{
  if (trim($supplierId) === '' || trim($areaId) === '') {
    throw new InvalidArgumentException('supplier id and delivery area id are required');
  }

  $stmt = db()->prepare("
    DELETE FROM supplier_delivery_areas
    WHERE supplier_id = :supplier_id
      AND id = :id
  ");

  $stmt->execute([
    ':supplier_id' => $supplierId,
    ':id' => $areaId,
  ]);

  return $stmt->rowCount() > 0;
}