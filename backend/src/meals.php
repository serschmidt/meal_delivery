<?php

require_once __DIR__ . '/../config/db.php';

// -----------------------------------------------
// Hilfsfunktionen (UUID‑Konvertierung)
// -----------------------------------------------
if (!function_exists('generateUuid')) {
    function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

        $hex = bin2hex($data);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split($hex, 4));
    }
}

if (!function_exists('uuidToBin')) {
    function uuidToBin(string $uuid): string
    {
        return hex2bin(str_replace('-', '', $uuid));
    }
}

if (!function_exists('binToUuid')) {
    function binToUuid(string $binary): string
    {
        $hex = bin2hex($binary);

        return sprintf(
            '%s-%s-%s-%s-%s',
            substr($hex, 0, 8),
            substr($hex, 8, 4),
            substr($hex, 12, 4),
            substr($hex, 16, 4),
            substr($hex, 20, 12)
        );
    }
}

// -----------------------------------------------
// GET /meals – existiert bereits
// -----------------------------------------------

function getAllMeals(): array
{
    $sql = "
        SELECT
            BIN_TO_UUID(m.id) AS id,
            m.name,
            m.price,
            m.description,
            m.image_url,
            m.available
        FROM meals m
        ORDER BY m.name
    ";

    $stmt = db()->query($sql);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $row['available'] = (bool)$row['available'];
    }

    return $rows;
}

// -----------------------------------------------
// POST /meals – existiert bereits
// -----------------------------------------------

function createMeal(array $data): array
{
    $name = trim((string)($data['name'] ?? ''));
    $price = $data['price'] ?? null;
    $description = trim((string)($data['description'] ?? ''));
    $imageUrl = trim((string)($data['image_url'] ?? ''));
    $available = $data['available'] ?? true;

    if ($name === '') {
        throw new InvalidArgumentException('name is required');
    }

    if ($price === null || !is_numeric($price)) {
        throw new InvalidArgumentException('price must be numeric');
    }

    $id = uuidToBin(generateUuid());

    $sql = "
        INSERT INTO meals (id, available, description, image_url, name, price)
        VALUES (:id, :available, :description, :image_url, :name, :price)
    ";

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':id' => $id,
        ':available' => $available ? 1 : 0,
        ':description' => $description !== '' ? $description : null,
        ':image_url' => $imageUrl !== '' ? $imageUrl : null,
        ':name' => $name,
        ':price' => $price,
    ]);

    return [
        'id' => binToUuid($id),
        'available' => (bool)$available,
        'description' => $description !== '' ? $description : null,
        'image_url' => $imageUrl !== '' ? $imageUrl : null,
        'name' => $name,
        'price' => (float)$price,
    ];
}

// -----------------------------------------------
// PUT /meals/{id}
// -----------------------------------------------

function updateMeal(string $uuid, array $data): ?array
{
    $name = trim((string)($data['name'] ?? ''));
    $price = $data['price'] ?? null;
    $description = trim((string)($data['description'] ?? ''));
    $imageUrl = trim((string)($data['image_url'] ?? ''));
    $available = $data['available'] ?? true;

    if ($name === '') {
        throw new InvalidArgumentException('name is required');
    }

    if ($price === null || !is_numeric($price)) {
        throw new InvalidArgumentException('price must be numeric');
    }

    $id = uuidToBin($uuid);

    // Zuerst prüfen, ob Meal überhaupt existiert
    $sql = "SELECT id FROM meals WHERE id = :id";
    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return null; // Meal not found
    }

    // Nun aktualisieren
    $sql = "
        UPDATE meals
        SET
            name = :name,
            price = :price,
            description = :description,
            image_url = :image_url,
            available = :available
        WHERE id = :id
    ";

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':id' => $id,
        ':name' => $name,
        ':price' => $price,
        ':description' => $description !== '' ? $description : null,
        ':image_url' => $imageUrl !== '' ? $imageUrl : null,
        ':available' => $available ? 1 : 0,
    ]);

    return [
        'id' => $uuid,
        'available' => (bool)$available,
        'description' => $description !== '' ? $description : null,
        'image_url' => $imageUrl !== '' ? $imageUrl : null,
        'name' => $name,
        'price' => (float)$price,
    ];
}

// -----------------------------------------------
// DELETE /meals/{id}
// -----------------------------------------------

function deleteMeal(string $uuid): bool
{
    $id = uuidToBin($uuid);

    $sql = "DELETE FROM meals WHERE id = :id";
    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => $id]);

    return $stmt->rowCount() > 0;
}