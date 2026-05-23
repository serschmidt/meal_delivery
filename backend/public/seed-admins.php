<?php

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/config/db.php';

echo "Seed admins\n";
echo "Generated: " . date('Y-m-d H:i:s') . "\n";
echo "baseDir: {$baseDir}\n";
echo "configFile exists: " . (file_exists($configFile) ? 'yes' : 'no') . "\n";
echo str_repeat('=', 80) . "\n\n";

if (!file_exists($configFile)) {
    http_response_code(500);
    echo "Fehler: config/db.php nicht gefunden.\n";
    exit;
}

require_once $configFile;

if (!function_exists('db')) {
    http_response_code(500);
    echo "Fehler: Funktion db() wurde aus config/db.php nicht geladen.\n";
    exit;
}

function uuidV4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$admins = [
    [
        'full_name' => 'Sergej Schmidt',
        'email' => 'sergej-schmidt@online.de',
        'password' => 'Di01Ci03Be09To21.',
        'is_active' => 1,
    ],
    [
        'full_name' => 'Dagma Preuten',
        'email' => 'DagmarPreuten@web.de',
        'password' => 'Lotte28',
        'is_active' => 1,
    ],
    [
        'full_name' => 'Hans-Dieter Riechmann',
        'email' => 'riechmann@typeqxx.de',
        'password' => 'Riechmann',
        'is_active' => 1,
    ],
];

try {
    $pdo = db();

    echo "DB Verbindung OK\n";
    echo "Server time: " . date('Y-m-d H:i:s') . "\n\n";

    $stmt = $pdo->query("SHOW TABLES LIKE 'admins'");
    $adminsTableExists = (bool) $stmt->fetchColumn();

    echo "Voraussetzung:\n";
    echo " - admins vorhanden: " . ($adminsTableExists ? 'yes' : 'no') . "\n\n";

    if (!$adminsTableExists) {
        throw new RuntimeException("Tabelle 'admins' fehlt.");
    }

    $selectStmt = $pdo->prepare(
        "SELECT id, email FROM admins WHERE email = :email LIMIT 1"
    );

    $insertStmt = $pdo->prepare(
        "INSERT INTO admins (id, full_name, email, password_hash, is_active)
         VALUES (:id, :full_name, :email, :password_hash, :is_active)"
    );

    foreach ($admins as $admin) {
        $selectStmt->execute(['email' => $admin['email']]);
        $existing = $selectStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            echo "Übersprungen, bereits vorhanden: {$admin['email']} (ID: {$existing['id']})\n";
            continue;
        }

        $id = uuidV4();
        $passwordHash = password_hash($admin['password'], PASSWORD_DEFAULT);

        $insertStmt->execute([
            'id' => $id,
            'full_name' => $admin['full_name'],
            'email' => $admin['email'],
            'password_hash' => $passwordHash,
            'is_active' => $admin['is_active'],
        ]);

        echo "Eingefügt: {$admin['email']} (ID: {$id})\n";
    }

    echo "\nKontrolle:\n";

    $checkStmt = $pdo->query(
        "SELECT id, full_name, email, is_active, created_at
         FROM admins
         ORDER BY created_at ASC, email ASC"
    );

    $rows = $checkStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as $row) {
        echo sprintf(
            " - %s | %s | %s | active=%s | created_at=%s\n",
            $row['id'],
            $row['full_name'],
            $row['email'],
            (string) $row['is_active'],
            $row['created_at']
        );
    }

    echo "\nFertig.\n";
    echo "Standard-Passwort für neu eingefügte Admins: Admin123!\n";
    echo "Bitte nach dem ersten Login sofort ändern.\n";
} catch (Throwable $e) {
    http_response_code(500);
    echo "Fehler:\n";
    echo $e->getMessage() . "\n";
}
