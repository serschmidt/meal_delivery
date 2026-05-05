<?php

require_once __DIR__ . '/../config/db.php';

function getAllSuppliers(): array
{
    $sql = "
        SELECT
            id,
            full_name,
            email,
            phone,
            street,
            house_number,
            postal_code,
            city,
            is_active,
            created_at,
            updated_at
        FROM suppliers
        ORDER BY full_name
    ";

    $stmt = db()->query($sql);
    return $stmt->fetchAll();
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
                id,
                full_name,
                email,
                phone,
                street,
                house_number,
                postal_code,
                city,
                is_active,
                created_at,
                updated_at
            FROM suppliers
            WHERE postal_code LIKE :pattern
            ORDER BY full_name
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':pattern' => $q . '%'
        ]);

        return $stmt->fetchAll();
    }

    $sql = "
        SELECT
            id,
            full_name,
            email,
            phone,
            street,
            house_number,
            postal_code,
            city,
            is_active,
            created_at,
            updated_at
        FROM suppliers
        WHERE LOWER(city) LIKE LOWER(:pattern)
        ORDER BY full_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':pattern' => $q . '%'
    ]);

    return $stmt->fetchAll();
}