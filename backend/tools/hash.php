<?php
// hash.php
$hash = password_hash('lieferant', PASSWORD_DEFAULT);
echo $hash . PHP_EOL;