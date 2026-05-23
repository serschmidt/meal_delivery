<?php
// backend/config/jwt_config.php

return [
    'secret_key'           => 'LieferMonopol_JWT_Secret_2026_XantenNRW_Secure!Key#42',
    'access_token_expiry'  => 900, // 15 Minuten
    'refresh_token_expiry' => 2592000,
    'algorithm'            => 'HS256',
    'issuer'               => 'liefermonopol.de',
    'audience'             => 'liefermonopol-admin',
];