<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/mailer.php';

// Fake-Testdaten
$order = [
    'id'          => '00000000-0000-0000-0000-000000000001',
    'created_at'  => date('Y-m-d H:i:s'),
    'status'      => 'neu',
    'total_price' => 23.50,
    'items'       => [
        [
            'id'          => 'item-1',
            'line_total'  => 11.75,
            'price'       => 11.75,
            'quantity'    => 1,
            'unit_price'  => 11.75,
            'meal_name'   => 'Spaghetti Bolognese',
            'menu_date'   => date('Y-m-d'),
        ],
        [
            'id'          => 'item-2',
            'line_total'  => 11.75,
            'price'       => 11.75,
            'quantity'    => 1,
            'unit_price'  => 11.75,
            'meal_name'   => 'Gemüselasagne',
            'menu_date'   => date('Y-m-d', strtotime('+1 day')),
        ],
    ],
];

$customer = [
    'full_name'    => 'Max Mustermann',
    'email'        => 'sergej-schmidt@online.de', // hier echte andere Adresse
    'street'       => 'Musterstraße',
    'house_number' => '12a',
    'postal_code'  => '12345',
    'city'         => 'Musterstadt',
    'phone'        => '0157 12345678',
    'notes'        => 'Bitte bei Nachbarn klingeln.',
];

$supplier = [
    'fullName' => 'Marie kocht – Liefermonopol',
    'email'    => 'info.liefermonopol@web.de',
    'payment'  => [
        'accountHolder' => 'Marie kocht – Liefermonopol',
        'iban'          => 'DE00 0000 0000 0000 0000 00',
        'paypalLink'    => 'https://paypal.me/deinlink',
    ],
];

try {
    sendOrderConfirmationToCustomer($order, $customer, $supplier);
    echo "OK: Test-Kundenmail wurde gesendet.";
} catch (Throwable $e) {
    http_response_code(500);
    echo "FEHLER: " . $e->getMessage();
}