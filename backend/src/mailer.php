<?php
// src/mailer.php

declare(strict_types=1);

use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;


require_once __DIR__ . '/payment_qr.php';
require_once __DIR__ . '/../vendor/autoload.php';

function e(?string $value): string
{
    return htmlspecialchars(
        (string) $value,
        ENT_QUOTES | ENT_SUBSTITUTE,
        'UTF-8'
    );
}

function supplierDisplayName(array $supplier): string
{
    $businessName = trim((string) ($supplier['businessName'] ?? ''));
    if ($businessName !== '') {
        return $businessName;
    }

    $fullName = trim((string) ($supplier['fullName'] ?? ''));
    if ($fullName !== '') {
        return $fullName;
    }

    return 'Lieferant';
}

function orderDisplayNumber(array $order): string
{
    $number = trim((string) ($order['order_number'] ?? ''));

    if ($number !== '') {
        return $number;
    }

    if (function_exists('formatExternalOrderNumber')) {
        $generated = formatExternalOrderNumber($order);
        if (!empty($generated)) {
            return $generated;
        }
    }

    return '–';
}

function orderPaymentPurpose(array $order): string
{
    return 'Bestellung ' . orderDisplayNumber($order);
}

function buildPaymentQrImageData(array $order, array $supplier): ?string
{
    $iban = trim((string) ($supplier['payment']['iban'] ?? ''));
    if ($iban === '') {
        return null;
    }

    $recipient = trim((string) (
        $supplier['payment']['accountHolder']
        ?? $supplier['businessName']
        ?? $supplier['fullName']
        ?? ''
    ));

    if ($recipient === '') {
        return null;
    }

    $amount = (float) ($order['total_price'] ?? 0);
    if ($amount <= 0) {
        return null;
    }

    $reference = orderPaymentPurpose($order);

    $bic = trim((string) ($supplier['payment']['bic'] ?? ''));
    if ($bic === '') {
        $bic = null;
    }

    return generateEpcQrPngData(
        $recipient,
        $iban,
        $amount,
        $reference,
        $bic,
        '',
        ''
    );
}

function buildPaymentQrResponseData(array $order, array $supplier): array
{
    try {
        $pngData = buildPaymentQrImageData($order, $supplier);

        if ($pngData === null) {
            return [
                'available' => false,
                'mimeType' => null,
                'imageBase64' => null,
                'purpose' => orderPaymentPurpose($order),
            ];
        }

        return [
            'available' => true,
            'mimeType' => 'image/png',
            'imageBase64' => base64_encode($pngData),
            'purpose' => orderPaymentPurpose($order),
        ];
    } catch (Throwable $e) {
        return [
            'available' => false,
            'mimeType' => null,
            'imageBase64' => null,
            'purpose' => orderPaymentPurpose($order),
        ];
    }
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
    $qrImageData = null;

try {
    $qrImageData = buildPaymentQrImageData($order, $supplier);
} catch (Throwable $e) {
    error_log('QR ERROR message=' . $e->getMessage());
}

    $email = trim((string) ($customer['email'] ?? ''));
    if ($email === '') {
        throw new InvalidArgumentException('Customer email is missing');
    }

    $mail = createMailer();
    $mail->addAddress($email, (string) ($customer['full_name'] ?? 'Kunde'));
    $mail->isHTML(true);
    $mail->Subject = 'Ihre Bestellübersicht – Marie kocht';
    $mail->Body = buildCustomerEmailHtml($order, $customer, $supplier);
    $mail->AltBody = buildCustomerEmailText($order, $customer, $supplier);
    if ($qrImageData !== null) {
        $mail->addStringEmbeddedImage(
            $qrImageData,
            'payment_qr',
            'payment-qr.png',
            'base64',
            'image/png'
        );
    }
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
    $mail->addAddress($email, supplierDisplayName($supplier));
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
    $orderNumber = e(orderDisplayNumber($order));
    $paymentPurpose = e(orderPaymentPurpose($order));
    $supplierName = e(supplierDisplayName($supplier));
    $itemsHtml = buildItemsHtml($order['items'] ?? []);
    $totalPrice = number_format((float) ($order['total_price'] ?? 0), 2, ',', '.');
    $createdAt = !empty($order['created_at'])
        ? date('d.m.Y H:i', strtotime((string) $order['created_at']))
        : '';
    $status = e((string) ($order['status'] ?? ''));
    $name = e((string) ($customer['full_name'] ?? 'Kunde'));
    $street = e(trim((string) ($customer['street'] ?? '') . ' ' . (string) ($customer['house_number'] ?? '')));
    $city = e(trim((string) ($customer['postal_code'] ?? '') . ' ' . (string) ($customer['city'] ?? '')));
$hasIban = !empty($supplier['payment']['iban']);
// $hasPaypal = !empty($supplier['payment']['paypalLink']);
$hasPaymentQr = $hasIban;

$paymentHtml = "<h3>Zahlungsinformationen</h3>";

if ($hasIban) {
    $holder = e((string) ($supplier['payment']['accountHolder'] ?? supplierDisplayName($supplier)));
    $iban = e((string) ($supplier['payment']['iban'] ?? ''));

    $paymentHtml .= "
    <p>Bitte übernehmen Sie die folgenden Zahlungsdaten exakt in Ihre Überweisung:</p>
    <table style='border-collapse:collapse;margin:8px 0;font-size:14px;'>
        <tr>
            <td style='padding:4px 12px 4px 0;color:#666;'>Empfänger</td>
            <td style='padding:4px 0;font-weight:bold;'>{$holder}</td>
        </tr>
        <tr>
            <td style='padding:4px 12px 4px 0;color:#666;'>IBAN</td>
            <td style='padding:4px 0;font-weight:bold;'>{$iban}</td>
        </tr>
        <tr>
            <td style='padding:4px 12px 4px 0;color:#666;'>Betrag</td>
            <td style='padding:4px 0;font-weight:bold;'>€ {$totalPrice}</td>
        </tr>
        <tr>
            <td style='padding:4px 12px 4px 0;color:#666;'>Verwendungszweck</td>
            <td style='padding:4px 0;font-weight:bold;'>{$paymentPurpose}</td>
        </tr>
        <tr>
            <td style='padding:4px 12px 4px 0;color:#666;'>Bestellnummer</td>
            <td style='padding:4px 0;font-weight:bold;'>{$orderNumber}</td>
        </tr>
    </table>
    <p style='font-size:12px;color:#666;'>Tipp: Sie können diese Daten direkt aus dieser E-Mail in Ihr Online-Banking übernehmen.</p>";
} else {
    $paymentHtml .= "
    <p>Bitte kontaktieren Sie den Lieferanten direkt für Zahlungsdetails.</p>
    <p><strong>Bestellnummer:</strong> {$orderNumber}<br>
    <strong>Verwendungszweck:</strong> {$paymentPurpose}</p>";
}

if ($hasPaymentQr) {
    $paymentHtml .= "
    <div style='margin-top:16px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fafafa;text-align:center;'>
        <p style='margin:0 0 12px 0;font-size:14px;color:#374151;font-weight:600;'>
            QR-Code für Ihre Überweisung
        </p>
        <p style='margin:0 0 12px 0;font-size:13px;color:#6b7280;line-height:1.5;'>
            Scannen Sie den QR-Code mit Ihrer Banking-App, um Empfänger, IBAN, Betrag und Verwendungszweck automatisch zu übernehmen.
        </p>
        <img
            src='cid:payment_qr'
            alt='QR-Code für SEPA-Überweisung'
            width='220'
            height='220'
            style='display:block;margin:0 auto;max-width:220px;height:auto;'
        />
    </div>";
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



    return "
    <!DOCTYPE html>
    <html lang='de'>
    <head>
        <meta charset='UTF-8'>
        <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
    </head>
    <body style='font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px;'>
        <h1 style='color:#1a1a1a;border-bottom:2px solid #f0f0f0;padding-bottom:10px;'>
            Ihre Bestellübersicht
        </h1>
        
        <p>Guten Tag {$name},</p>
        <p>vielen Dank für Ihre Bestellung bei <strong>Marie kocht</strong>.
            Wir haben Ihre Bestellung verbindlich aufgenommen.</p>
        <p><strong>Bestellnummer:</strong> {$orderNumber}</p>

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
    $orderNumber = e(orderDisplayNumber($order));
    $itemsHtml = buildItemsHtml($order['items'] ?? []);
    $totalPrice = number_format((float) ($order['total_price'] ?? 0), 2, ',', '.');
    $createdAt = !empty($order['created_at'])
        ? date('d.m.Y H:i', strtotime((string) $order['created_at']))
        : '';
    $supplierName = e(supplierDisplayName($supplier));
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
        <p>eine neue Bestellung wurde aufgegeben. </p>
        <p><strong>Bestellnummer:</strong> {$orderNumber}</p>
        <p>Bitte bereiten Sie die Lieferung vor.</p>

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
    $orderNumber = orderDisplayNumber($order);
    $paymentPurpose = orderPaymentPurpose($order);
    $total = number_format((float) ($order['total_price'] ?? 0), 2, ',', '.');
    $items = buildItemsText($order['items'] ?? []);
    $status = (string) ($order['status'] ?? '');

    $paymentText = '';
    if (!empty($supplier['payment']['iban'])) {
        $holder = (string) ($supplier['payment']['accountHolder'] ?? supplierDisplayName($supplier));
        $paymentText .= "\nZahlung per Überweisung:\n"
            . "Empfänger: {$holder}\n"
            . "IBAN: " . (string) $supplier['payment']['iban'] . "\n"
            . "Betrag: € {$total}\n"
            . "Verwendungszweck: {$paymentPurpose}\n";
    }
    // if (!empty($supplier['payment']['paypalLink'])) {
    //     $paymentText .= "\nZahlung per PayPal:\n"
    //         . (string) $supplier['payment']['paypalLink'] . "\n";
    // }
if (empty($supplier['payment']['iban']) && empty($supplier['payment']['paypalLink'])) {
    $paymentText .= "\nBitte kontaktieren Sie den Lieferanten direkt für Zahlungsdetails.\n"
        . "Bestellnummer: {$orderNumber}\n"
        . "Verwendungszweck: {$paymentPurpose}\n";
}

    return "Ihre Bestellübersicht – Marie kocht\n\n"
        . "Bestellnummer: {$orderNumber}\n\n"
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
    $orderNumber = orderDisplayNumber($order);

    return "Neue Bestellung – Marie kocht\n\n"
        . "Bestellnummer: {$orderNumber}\n"
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
