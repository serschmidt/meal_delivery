<?php
// src/mailer.php

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../vendor/autoload.php';

function e(?string $value): string
{
    return htmlspecialchars(
        (string) $value,
        ENT_QUOTES | ENT_SUBSTITUTE,
        'UTF-8'
    );
}

function createMailer(): PHPMailer
{
    $config = require __DIR__ . '/../config/mail.php';

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_user'];
    $mail->Password = $config['smtp_password'];
    $mail->Port = (int) $config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['from_email'], $config['from_name']);

    if ((int) $config['smtp_port'] === 465) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    }

    $mail->SMTPDebug = 0; // Debugging aus
    //$mail->Debugoutput = static function (string $str, int $level): void {
    //    error_log("PHPMailer[$level]: " . $str);
    //};

    $mail->addBCC($config['from_email'], $config['from_name']);

    return $mail;
}

// ── E-Mail an Kunden ──────────────────────────────────────────────────────
function sendOrderConfirmationToCustomer(array $order, array $customer, array $supplier): void
{
    $email = trim((string) ($customer['email'] ?? ''));
    if ($email === '') {
        throw new InvalidArgumentException('Customer email is missing');
    }

    $mail = createMailer();
    $mail->addAddress($email, (string) ($customer['full_name'] ?? 'Kunde'));
    $mail->isHTML(true);
    $mail->Subject = 'Ihre Bestellbestätigung – Marie kocht';
    $mail->Body = buildCustomerEmailHtml($order, $customer, $supplier);
    $mail->AltBody = buildCustomerEmailText($order, $customer, $supplier);
    $mail->send();
}

// ── E-Mail an Lieferanten ─────────────────────────────────────────────────
function sendOrderNotificationToSupplier(array $order, array $customer, array $supplier): void
{
    $email = trim((string) ($supplier['email'] ?? ''));
    if ($email === '') {
        throw new InvalidArgumentException('Supplier email is missing');
    }

    $mail = createMailer();
    $mail->addAddress($email, (string) ($supplier['fullName'] ?? 'Lieferant'));
    $mail->isHTML(true);
    $mail->Subject = 'Neue Bestellung eingegangen – ' . (string) ($customer['full_name'] ?? 'Kunde');
    $mail->Body = buildSupplierEmailHtml($order, $customer, $supplier);
    $mail->AltBody = buildSupplierEmailText($order, $customer, $supplier);
    $mail->send();
}

// ── Hilfsfunktion: Items HTML ─────────────────────────────────────────────
function buildItemsHtml(array $items): string
{
    $html = '';

    foreach ($items as $item) {
        $quantity = (int) ($item['quantity'] ?? 0);
        $lineTotal = number_format((float) ($item['line_total'] ?? 0), 2, ',', '.');
        $mealName = e($item['meal_name'] ?? '–');
        $menuDate = !empty($item['menu_date'])
            ? date('d.m.Y', strtotime((string) $item['menu_date']))
            : '';

        $html .= "
            <tr>
                <td style='padding:8px;border-bottom:1px solid #eee;'>{$quantity}×</td>
                <td style='padding:8px;border-bottom:1px solid #eee;'>
                    {$mealName}
                    " . ($menuDate ? "<br><small style='color:#999;'>Liefertag: " . e($menuDate) . "</small>" : "") . "
                </td>
                <td style='padding:8px;border-bottom:1px solid #eee;text-align:right;'>€ {$lineTotal}</td>
            </tr>";
    }

    return $html;
}

// ── Hilfsfunktion: Items Text ─────────────────────────────────────────────
function buildItemsText(array $items): string
{
    $text = '';

    foreach ($items as $item) {
        $quantity = (int) ($item['quantity'] ?? 0);
        $mealName = (string) ($item['meal_name'] ?? '–');
        $menuDate = !empty($item['menu_date'])
            ? date('d.m.Y', strtotime((string) $item['menu_date']))
            : '';

        $text .= "- {$quantity}× {$mealName}"
            . ($menuDate ? " (Liefertag: {$menuDate})" : "")
            . "\n";
    }

    return $text;
}

// ── HTML Template Kunde ───────────────────────────────────────────────────
function buildCustomerEmailHtml(array $order, array $customer, array $supplier): string
{
    $itemsHtml = buildItemsHtml($order['items'] ?? []);
    $totalPrice = number_format((float) ($order['total_price'] ?? 0), 2, ',', '.');
    $createdAt = !empty($order['created_at'])
        ? date('d.m.Y H:i', strtotime((string) $order['created_at']))
        : '';
    $status = e((string) ($order['status'] ?? ''));
    $name = e((string) ($customer['full_name'] ?? 'Kunde'));
    $street = e(trim((string) ($customer['street'] ?? '') . ' ' . (string) ($customer['house_number'] ?? '')));
    $city = e(trim((string) ($customer['postal_code'] ?? '') . ' ' . (string) ($customer['city'] ?? '')));

    $paymentHtml = '';
    $hasIban = !empty($supplier['payment']['iban']);
    // $hasPaypal = !empty($supplier['payment']['paypalLink']);

    if ($hasIban) {
        $holder = e((string) ($supplier['payment']['accountHolder'] ?? $supplier['fullName'] ?? ''));
        $iban = e((string) ($supplier['payment']['iban'] ?? ''));

        $paymentHtml .= "
        <h3>Zahlung per Überweisung</h3>
        <table style='border-collapse:collapse;margin:8px 0;font-size:14px;'>
            <tr>
                <td style='padding:4px 12px 4px 0;color:#666;'>Kontoinhaber</td>
                <td style='padding:4px 0;font-weight:bold;'>{$holder}</td>
            </tr>
            <tr>
                <td style='padding:4px 12px 4px 0;color:#666;'>IBAN</td>
                <td style='padding:4px 0;font-weight:bold;'>{$iban}</td>
            </tr>
        </table>";
    }

    // if ($hasPaypal) {
    //     $paypalLink = e((string) ($supplier['payment']['paypalLink'] ?? ''));

    //     $paymentHtml .= "
    //     <h3>Zahlung per PayPal</h3>
    //     <p>
    //         <a href='{$paypalLink}'
    //            style='background:#0070ba;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;'>
    //             Jetzt per PayPal bezahlen
    //         </a>
    //     </p>
    //     <p style='font-size:12px;color:#666;'>{$paypalLink}</p>";
    // }

    if (!$hasIban) {
    // if (!$hasIban && !$hasPaypal) {
        $paymentHtml = "<p>Bitte kontaktieren Sie den Lieferanten direkt für Zahlungsdetails.</p>";
    }

    return "
    <!DOCTYPE html>
    <html lang='de'>
    <head>
        <meta charset='UTF-8'>
        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    </head>
    <body style='font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;'>
        <h1 style='color:#1a1a1a;border-bottom:2px solid #f0f0f0;padding-bottom:10px;'>
            Ihre Bestellbestätigung
        </h1>

        <p>Guten Tag {$name},</p>
        <p>vielen Dank für Ihre Bestellung bei <strong>Marie kocht</strong>.
        Wir haben Ihre Bestellung verbindlich aufgenommen.</p>

        <table style='width:100%;border-collapse:collapse;margin:20px 0;'>
            <tr style='background:#f8f8f8;'>
                <th style='padding:8px;text-align:left;'>Menge</th>
                <th style='padding:8px;text-align:left;'>Gericht</th>
                <th style='padding:8px;text-align:right;'>Preis</th>
            </tr>
            {$itemsHtml}
            <tr>
                <td colspan='2' style='padding:8px;font-weight:bold;'>Gesamtsumme</td>
                <td style='padding:8px;font-weight:bold;text-align:right;'>€ {$totalPrice}</td>
            </tr>
        </table>

        <h3>Lieferadresse</h3>
        <p>{$street}<br>{$city}</p>

        {$paymentHtml}

        <p style='color:#666;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:10px;'>
            Bestellung vom " . e($createdAt) . " · Status: {$status}
        </p>

        <p style='color:#666;font-size:11px;'>
            <strong>Widerrufshinweis:</strong> Das Widerrufsrecht ist bei frisch
            zubereiteten Speisen gemäß § 312g Abs. 2 Nr. 9 BGB ausgeschlossen.
        </p>
    </body>
    </html>";
}

// ── HTML Template Lieferant ───────────────────────────────────────────────
function buildSupplierEmailHtml(array $order, array $customer, array $supplier): string
{
    $itemsHtml = buildItemsHtml($order['items'] ?? []);
    $totalPrice = number_format((float) ($order['total_price'] ?? 0), 2, ',', '.');
    $createdAt = !empty($order['created_at'])
        ? date('d.m.Y H:i', strtotime((string) $order['created_at']))
        : '';
    $supplierName = e((string) ($supplier['fullName'] ?? 'Lieferant'));
    $custName = e((string) ($customer['full_name'] ?? 'Kunde'));
    $street = e(trim((string) ($customer['street'] ?? '') . ' ' . (string) ($customer['house_number'] ?? '')));
    $city = e(trim((string) ($customer['postal_code'] ?? '') . ' ' . (string) ($customer['city'] ?? '')));
    $phone = !empty($customer['phone'])
        ? "<br>Tel: " . e((string) $customer['phone'])
        : '';
    $notes = !empty($customer['notes'])
        ? "<br><em>Hinweis: " . e((string) $customer['notes']) . "</em>"
        : '';

    return "
    <!DOCTYPE html>
    <html lang='de'>
    <head>
        <meta charset='UTF-8'>
        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    </head>
    <body style='font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;'>
        <h1 style='color:#1a1a1a;border-bottom:2px solid #f0f0f0;padding-bottom:10px;'>
            Neue Bestellung eingegangen
        </h1>

        <p>Guten Tag {$supplierName},</p>
        <p>eine neue Bestellung wurde aufgegeben. Bitte bereiten Sie die Lieferung vor.</p>

        <h3>Kunde</h3>
        <p>
            <strong>{$custName}</strong><br>
            {$street}<br>
            {$city}
            {$phone}
            {$notes}
        </p>

        <h3>Bestellte Gerichte</h3>
        <table style='width:100%;border-collapse:collapse;margin:10px 0;'>
            <tr style='background:#f8f8f8;'>
                <th style='padding:8px;text-align:left;'>Menge</th>
                <th style='padding:8px;text-align:left;'>Gericht</th>
                <th style='padding:8px;text-align:right;'>Preis</th>
            </tr>
            {$itemsHtml}
            <tr>
                <td colspan='2' style='padding:8px;font-weight:bold;'>Gesamtsumme</td>
                <td style='padding:8px;font-weight:bold;text-align:right;'>€ {$totalPrice}</td>
            </tr>
        </table>

        <h3>Zahlungsaufforderung</h3>
        <p>
            Bitte fordern Sie den Betrag von <strong>€ {$totalPrice}</strong>
            direkt beim Kunden an – per Überweisung oder PayPal.
        </p>

        <p style='color:#666;font-size:12px;margin-top:30px;border-top:1px solid #eee;padding-top:10px;'>
            Bestellung eingegangen am " . e($createdAt) . "
        </p>
    </body>
    </html>";
}

// ── Plain Text Fallbacks ──────────────────────────────────────────────────
function buildCustomerEmailText(array $order, array $customer, array $supplier): string
{
    $total = number_format((float) ($order['total_price'] ?? 0), 2, ',', '.');
    $items = buildItemsText($order['items'] ?? []);
    $status = (string) ($order['status'] ?? '');

    $paymentText = '';
    if (!empty($supplier['payment']['iban'])) {
        $holder = (string) ($supplier['payment']['accountHolder'] ?? $supplier['fullName'] ?? '');
        $paymentText .= "\nZahlung per Überweisung:\n"
            . "Kontoinhaber: {$holder}\n"
            . "IBAN: " . (string) $supplier['payment']['iban'] . "\n";
    }
    // if (!empty($supplier['payment']['paypalLink'])) {
    //     $paymentText .= "\nZahlung per PayPal:\n"
    //         . (string) $supplier['payment']['paypalLink'] . "\n";
    // }
    if (empty($supplier['payment']['iban']) && empty($supplier['payment']['paypalLink'])) {
        $paymentText .= "\nBitte kontaktieren Sie den Lieferanten direkt für Zahlungsdetails.\n";
    }

    return "Ihre Bestellbestätigung – Marie kocht\n\n"
        . "Guten Tag " . (string) ($customer['full_name'] ?? 'Kunde') . ",\n"
        . "vielen Dank für Ihre Bestellung.\n\n"
        . $items . "\n"
        . "Gesamtsumme: € {$total}\n"
        . "Status: {$status}\n"
        . $paymentText;
}

function buildSupplierEmailText(array $order, array $customer, array $supplier): string
{
    $total = number_format((float) ($order['total_price'] ?? 0), 2, ',', '.');
    $items = buildItemsText($order['items'] ?? []);

    return "Neue Bestellung – Marie kocht\n\n"
        . "Kunde: " . (string) ($customer['full_name'] ?? 'Kunde') . "\n"
        . (string) ($customer['street'] ?? '') . ' ' . (string) ($customer['house_number'] ?? '') . ", "
        . (string) ($customer['postal_code'] ?? '') . ' ' . (string) ($customer['city'] ?? '') . "\n"
        . (!empty($customer['phone']) ? "Telefon: " . (string) $customer['phone'] . "\n" : '')
        . (!empty($customer['notes']) ? "Hinweis: " . (string) $customer['notes'] . "\n" : '')
        . "\n"
        . $items . "\n"
        . "Gesamtsumme: € {$total}\n"
        . "Bitte Zahlung beim Kunden anfordern.";
}
