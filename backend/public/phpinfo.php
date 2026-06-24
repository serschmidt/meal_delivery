<?php
header('Content-Type: text/plain; charset=utf-8');

echo 'PHP Version: ' . PHP_VERSION . PHP_EOL;
echo 'GD loaded: ' . (extension_loaded('gd') ? 'yes' : 'no') . PHP_EOL;
echo 'Imagick loaded: ' . (extension_loaded('imagick') ? 'yes' : 'no') . PHP_EOL;