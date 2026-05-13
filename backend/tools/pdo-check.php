<?php

header('Content-Type: text/plain; charset=utf-8');

echo 'PDO exists: ';
var_dump(class_exists('PDO'));

echo PHP_EOL;

echo 'pdo_mysql loaded: ';
var_dump(extension_loaded('pdo_mysql'));

echo PHP_EOL;

if (class_exists('PDO')) {
    print_r(PDO::getAvailableDrivers());
}

