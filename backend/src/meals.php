<?php
// /src/meals.php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

function mapMealRowToApi(array $row): array
{
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'price' => isset($row['price']) ? round((float) $row['price'], 2) : 0,
        'description' => $row['description'],
        'imageUrl' => $row['image_url'],
        'available' => (bool) $row['available'],
    ];
}

// -----------------------------------------------
// GET /meals – existiert bereits
// -----------------------------------------------
function getAllMeals(): array
{
    $sql = "
        SELECT
            m.id,
            m.name,
            m.price,
            m.description,
            m.image_url,
            m.available
        FROM meals m
        ORDER BY m.name
    ";

    $stmt = db()->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return array_map(function (array $row): array {
        $row['id'] = binToUuid($row['id']);
        return mapMealRowToApi($row);
    }, $rows);
}

// -----------------------------------------------
// POST /meals – existiert bereits
// -----------------------------------------------

function createMeal(array $data): array
{
    $name = trim((string)($data['name'] ?? ''));
    $price = $data['price'] ?? null;
    $description = trim((string)($data['description'] ?? ''));
    $imageUrl = trim((string)($data['imageUrl'] ?? $data['image_url'] ?? ''));
    $available = $data['available'] ?? true;

    if ($name === '') {
        throw new InvalidArgumentException('name is required');
    }

    if ($price === null || !is_numeric($price)) {
        throw new InvalidArgumentException('price must be numeric');
    }

    $uuid = generateUuid();
    $id = uuidToBin($uuid);

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
        'id' => $uuid,
        'name' => $name,
        'price' => (float) $price,
        'description' => $description !== '' ? $description : null,
        'imageUrl' => $imageUrl !== '' ? $imageUrl : null,
        'available' => (bool) $available,
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
    $imageUrl = trim((string)($data['imageUrl'] ?? $data['image_url'] ?? ''));
    $available = $data['available'] ?? true;

    if ($name === '') {
        throw new InvalidArgumentException('name is required');
    }

    if ($price === null || !is_numeric($price)) {
        throw new InvalidArgumentException('price must be numeric');
    }

    $id = uuidToBin($uuid);

    $sql = "SELECT id FROM meals WHERE id = :id";
    $stmt = db()->prepare($sql);
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        return null;
    }

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
        'name' => $name,
        'price' => (float) $price,
        'description' => $description !== '' ? $description : null,
        'imageUrl' => $imageUrl !== '' ? $imageUrl : null,
        'available' => (bool) $available,
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
