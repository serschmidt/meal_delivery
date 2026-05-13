<?php
// src/helpers.php

function generateUuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function uuidToBin(string $uuid): string
{
    return hex2bin(str_replace('-', '', $uuid));
}

function binToUuid(?string $binary): ?string
{
    if ($binary === null) {
        return null;
    }

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($binary), 4));
}