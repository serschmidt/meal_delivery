<?php
// src/payment_qr.php

declare(strict_types=1);

use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

function paymentQrNormalizeText(string $value, int $maxLength): string
{
    $value = trim(preg_replace('/\s+/u', ' ', $value) ?? '');

    if ($value === '') {
        return '';
    }

    if (mb_strlen($value) > $maxLength) {
        $value = mb_substr($value, 0, $maxLength);
    }

    return $value;
}

function paymentQrNormalizeAmount(float $amount): string
{
    if ($amount <= 0) {
        throw new InvalidArgumentException('Amount must be greater than 0.');
    }

    return number_format($amount, 2, '.', '');
}

function paymentQrNormalizeIban(string $iban): string
{
    $iban = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $iban) ?? '');

    if ($iban === '') {
        throw new InvalidArgumentException('IBAN is required.');
    }

    if (strlen($iban) < 15 || strlen($iban) > 34) {
        throw new InvalidArgumentException('Invalid IBAN length.');
    }

    return $iban;
}

function paymentQrNormalizeBic(?string $bic): string
{
    $bic = strtoupper(trim((string) $bic));

    if ($bic === '') {
        return '';
    }

    if (!preg_match('/^[A-Z0-9]{8}([A-Z0-9]{3})?$/', $bic)) {
        throw new InvalidArgumentException('Invalid BIC format.');
    }

    return $bic;
}

function buildEpcQrPayload(
    string $recipient,
    string $iban,
    float $amount,
    string $reference,
    ?string $bic = null,
    string $purpose = '',
    string $message = ''
): string {
    $recipient = paymentQrNormalizeText($recipient, 70);
    $iban = paymentQrNormalizeIban($iban);
    $bic = paymentQrNormalizeBic($bic);
    $reference = paymentQrNormalizeText($reference, 140);
    $purpose = strtoupper(paymentQrNormalizeText($purpose, 4));
    $purpose = preg_replace('/[^A-Z0-9]/', '', $purpose) ?? '';
    $message = paymentQrNormalizeText($message, 70);
    $amountValue = paymentQrNormalizeAmount($amount);

    if ($recipient === '') {
        throw new InvalidArgumentException('Recipient is required.');
    }

    if ($reference === '') {
        throw new InvalidArgumentException('Reference is required.');
    }

    $lines = [
        'BCD',                 // Service Tag
        '002',                 // Version
        '1',                   // Charset: UTF-8
        'SCT',                 // SEPA Credit Transfer
        $bic,                  // BIC optional
        $recipient,            // Name
        $iban,                 // IBAN
        'EUR' . $amountValue,  // Amount
        $purpose,              // Purpose (optional, 4 chars)
        $reference,            // Remittance (unstructured)
        $message,              // Beneficiary to originator information
    ];

    return rtrim(implode("\n", $lines), "\n");
}

function generateEpcQrPngData(
    string $recipient,
    string $iban,
    float $amount,
    string $reference,
    ?string $bic = null,
    string $purpose = '',
    string $message = ''
): string {
    $payload = buildEpcQrPayload(
        $recipient,
        $iban,
        $amount,
        $reference,
        $bic,
        $purpose,
        $message
    );

    $writer = new PngWriter();

    $qrCode = new QrCode(
        data: $payload,
        encoding: new Encoding('UTF-8'),
        errorCorrectionLevel: ErrorCorrectionLevel::Low,
        size: 320,
        margin: 12,
        roundBlockSizeMode: RoundBlockSizeMode::Margin,
        foregroundColor: new Color(0, 0, 0),
        backgroundColor: new Color(255, 255, 255)
    );

    $result = $writer->write($qrCode);

    return $result->getString();
}
