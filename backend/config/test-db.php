<?php

require_once __DIR__ . '/../config/db.php';

try {
    $pdo = db();

    echo "<p>DB-Verbindung OK.</p>";

    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_NUM);

    echo "<p>Gefundene Tabellen:</p><ul>";
    foreach ($tables as $row) {
        echo "<li>" . htmlspecialchars($row[0], ENT_QUOTES, 'UTF-8') . "</li>";
    }
    echo "</ul>";

    $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM meals");
    $row = $stmt->fetch();

    echo "<p>meals: " . (int) $row['cnt'] . " Datensätze</p>";

} catch (PDOException $e) {
    echo "<p>DB-Verbindung fehlgeschlagen:</p>";
    echo "<pre>" . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . "</pre>";
}