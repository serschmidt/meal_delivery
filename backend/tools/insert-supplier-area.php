<?php

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$baseDir = dirname(__DIR__);
$configFile = $baseDir . '/config/db.php';

if (!file_exists($configFile)) {
    http_response_code(500);
    exit("config/db.php nicht gefunden.\n");
}

require_once $configFile;

if (!function_exists('db')) {
    http_response_code(500);
    exit("Die Funktion db() wurde in config/db.php nicht gefunden.\n");
}

$pdo = db();

function uuidV4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$supplierId = '204ce641-e8d5-497f-8986-46b3dee87c46';

$areas = [
    // Charlottenburg-Wilmersdorf
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10585'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10587'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10589'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10623'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10625'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10627'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10629'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10707'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10709'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10711'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10719'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10787'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '10789'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '14050'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '14055'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '14057'],
    ['city' => 'Berlin-Charlottenburg',        'postal_code' => '14059'],

    ['city' => 'Berlin-Charlottenburg-Nord',   'postal_code' => '10589'],
    ['city' => 'Berlin-Charlottenburg-Nord',   'postal_code' => '13353'],
    ['city' => 'Berlin-Charlottenburg-Nord',   'postal_code' => '13627'],
    ['city' => 'Berlin-Charlottenburg-Nord',   'postal_code' => '13629'],

    ['city' => 'Berlin-Grunewald',             'postal_code' => '10711'],
    ['city' => 'Berlin-Grunewald',             'postal_code' => '14055'],
    ['city' => 'Berlin-Grunewald',             'postal_code' => '14193'],
    ['city' => 'Berlin-Grunewald',             'postal_code' => '14195'],
    ['city' => 'Berlin-Grunewald',             'postal_code' => '14199'],

    ['city' => 'Berlin-Halensee',              'postal_code' => '10709'],
    ['city' => 'Berlin-Halensee',              'postal_code' => '10711'],
    ['city' => 'Berlin-Halensee',              'postal_code' => '10713'],

    ['city' => 'Berlin-Schmargendorf',         'postal_code' => '14193'],
    ['city' => 'Berlin-Schmargendorf',         'postal_code' => '14195'],
    ['city' => 'Berlin-Schmargendorf',         'postal_code' => '14197'],
    ['city' => 'Berlin-Schmargendorf',         'postal_code' => '14199'],

    ['city' => 'Berlin-Westend',               'postal_code' => '14050'],
    ['city' => 'Berlin-Westend',               'postal_code' => '14052'],
    ['city' => 'Berlin-Westend',               'postal_code' => '14053'],
    ['city' => 'Berlin-Westend',               'postal_code' => '14055'],
    ['city' => 'Berlin-Westend',               'postal_code' => '14057'],
    ['city' => 'Berlin-Westend',               'postal_code' => '14059'],

    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10707'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10709'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10711'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10713'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10715'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10717'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10719'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10777'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10779'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10789'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '10825'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '14195'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '14197'],
    ['city' => 'Berlin-Wilmersdorf',           'postal_code' => '14199'],

    // Friedrichshain-Kreuzberg
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10243'],
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10179'],
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10245'],
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10317'],
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10247'],
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10249'],
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10178'],
    ['city' => 'Berlin-Friedrichshain',        'postal_code' => '10179'],

    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10961'],
    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10969'],
    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10963'],
    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10785'],
    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10965'],
    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10967'],
    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10997'],
    ['city' => 'Berlin-Kreuzberg',             'postal_code' => '10999'],

    // Lichtenberg / Hohenschönhausen
    ['city' => 'Berlin-Alt-Hohenschönhausen',  'postal_code' => '12681'],
    ['city' => 'Berlin-Alt-Hohenschönhausen',  'postal_code' => '13051'],
    ['city' => 'Berlin-Alt-Hohenschönhausen',  'postal_code' => '13053'],
    ['city' => 'Berlin-Alt-Hohenschönhausen',  'postal_code' => '13055'],

    ['city' => 'Berlin-Falkenberg',            'postal_code' => '13057'],

    ['city' => 'Berlin-Fennpfuhl',             'postal_code' => '10367'],
    ['city' => 'Berlin-Fennpfuhl',             'postal_code' => '10369'],

    ['city' => 'Berlin-Friedrichsfelde',       'postal_code' => '10315'],
    ['city' => 'Berlin-Friedrichsfelde',       'postal_code' => '10317'],
    ['city' => 'Berlin-Friedrichsfelde',       'postal_code' => '10319'],

    ['city' => 'Berlin-Lichtenberg',           'postal_code' => '10315'],
    ['city' => 'Berlin-Lichtenberg',           'postal_code' => '10365'],
    ['city' => 'Berlin-Lichtenberg',           'postal_code' => '10367'],
    ['city' => 'Berlin-Lichtenberg',           'postal_code' => '10317'],
    ['city' => 'Berlin-Lichtenberg',           'postal_code' => '10369'],

    ['city' => 'Berlin-Karlshorst',            'postal_code' => '10317'],
    ['city' => 'Berlin-Karlshorst',            'postal_code' => '10318'],

    ['city' => 'Berlin-Malchow',               'postal_code' => '13051'],

    ['city' => 'Berlin-Neu-Hohenschönhausen',  'postal_code' => '13051'],
    ['city' => 'Berlin-Neu-Hohenschönhausen',  'postal_code' => '13053'],
    ['city' => 'Berlin-Neu-Hohenschönhausen',  'postal_code' => '13057'],
    ['city' => 'Berlin-Neu-Hohenschönhausen',  'postal_code' => '13059'],

    ['city' => 'Berlin-Rummelsburg',           'postal_code' => '10315'],
    ['city' => 'Berlin-Rummelsburg',           'postal_code' => '10317'],
    ['city' => 'Berlin-Rummelsburg',           'postal_code' => '10318'],
    ['city' => 'Berlin-Rummelsburg',           'postal_code' => '10365'],

    ['city' => 'Berlin-Wartenberg',            'postal_code' => '13051'],
    ['city' => 'Berlin-Wartenberg',            'postal_code' => '13059'],

    // Marzahn-Hellersdorf
    ['city' => 'Berlin-Biesdorf',              'postal_code' => '12683'],
    ['city' => 'Berlin-Biesdorf',              'postal_code' => '12685'],

    ['city' => 'Berlin-Kaulsdorf',             'postal_code' => '12555'],
    ['city' => 'Berlin-Kaulsdorf',             'postal_code' => '12619'],
    ['city' => 'Berlin-Kaulsdorf',             'postal_code' => '12621'],
    ['city' => 'Berlin-Kaulsdorf',             'postal_code' => '12623'],

    ['city' => 'Berlin-Hellersdorf',           'postal_code' => '12619'],
    ['city' => 'Berlin-Hellersdorf',           'postal_code' => '12621'],
    ['city' => 'Berlin-Hellersdorf',           'postal_code' => '12627'],
    ['city' => 'Berlin-Hellersdorf',           'postal_code' => '12629'],

    ['city' => 'Berlin-Marzahn',               'postal_code' => '12679'],
    ['city' => 'Berlin-Marzahn',               'postal_code' => '12681'],
    ['city' => 'Berlin-Marzahn',               'postal_code' => '12683'],
    ['city' => 'Berlin-Marzahn',               'postal_code' => '12685'],
    ['city' => 'Berlin-Marzahn',               'postal_code' => '12687'],
    ['city' => 'Berlin-Marzahn',               'postal_code' => '12689'],

    ['city' => 'Berlin-Mahlsdorf',             'postal_code' => '12621'],
    ['city' => 'Berlin-Mahlsdorf',             'postal_code' => '12623'],

    // Mitte
    ['city' => 'Berlin-Gesundbrunnen',         'postal_code' => '13347'],
    ['city' => 'Berlin-Gesundbrunnen',         'postal_code' => '13353'],
    ['city' => 'Berlin-Gesundbrunnen',         'postal_code' => '13355'],
    ['city' => 'Berlin-Gesundbrunnen',         'postal_code' => '13357'],
    ['city' => 'Berlin-Gesundbrunnen',         'postal_code' => '13359'],
    ['city' => 'Berlin-Gesundbrunnen',         'postal_code' => '13409'],

    ['city' => 'Berlin-Hansaviertel',          'postal_code' => '10555'],
    ['city' => 'Berlin-Hansaviertel',          'postal_code' => '10557'],

    ['city' => 'Berlin-Mitte',                 'postal_code' => '10115'],
    ['city' => 'Berlin-Mitte',                 'postal_code' => '10117'],
    ['city' => 'Berlin-Mitte',                 'postal_code' => '10119'],
    ['city' => 'Berlin-Mitte',                 'postal_code' => '10178'],
    ['city' => 'Berlin-Mitte',                 'postal_code' => '10179'],
    ['city' => 'Berlin-Mitte',                 'postal_code' => '10435'],

    ['city' => 'Berlin-Moabit',                'postal_code' => '10551'],
    ['city' => 'Berlin-Moabit',                'postal_code' => '10553'],
    ['city' => 'Berlin-Moabit',                'postal_code' => '10555'],
    ['city' => 'Berlin-Moabit',                'postal_code' => '10557'],
    ['city' => 'Berlin-Moabit',                'postal_code' => '10559'],
    ['city' => 'Berlin-Moabit',                'postal_code' => '13353'],

    ['city' => 'Berlin-Tiergarten',            'postal_code' => '10117'],
    ['city' => 'Berlin-Tiergarten',            'postal_code' => '10557'],
    ['city' => 'Berlin-Tiergarten',            'postal_code' => '10623'],
    ['city' => 'Berlin-Tiergarten',            'postal_code' => '10785'],
    ['city' => 'Berlin-Tiergarten',            'postal_code' => '10787'],
    ['city' => 'Berlin-Tiergarten',            'postal_code' => '10963'],

    ['city' => 'Berlin-Wedding',               'postal_code' => '13347'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13349'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13351'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13353'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13357'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13359'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13405'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13407'],
    ['city' => 'Berlin-Wedding',               'postal_code' => '13409'],

    // Neukölln
    ['city' => 'Berlin-Britz',                 'postal_code' => '12051'],
    ['city' => 'Berlin-Britz',                 'postal_code' => '12057'],
    ['city' => 'Berlin-Britz',                 'postal_code' => '12099'],
    ['city' => 'Berlin-Britz',                 'postal_code' => '12347'],
    ['city' => 'Berlin-Britz',                 'postal_code' => '12349'],
    ['city' => 'Berlin-Britz',                 'postal_code' => '12351'],
    ['city' => 'Berlin-Britz',                 'postal_code' => '12359'],

    ['city' => 'Berlin-Buckow',                'postal_code' => '12107'],
    ['city' => 'Berlin-Buckow',                'postal_code' => '12305'],
    ['city' => 'Berlin-Buckow',                'postal_code' => '12349'],
    ['city' => 'Berlin-Buckow',                'postal_code' => '12351'],
    ['city' => 'Berlin-Buckow',                'postal_code' => '12353'],
    ['city' => 'Berlin-Buckow',                'postal_code' => '12357'],
    ['city' => 'Berlin-Buckow',                'postal_code' => '12359'],

    ['city' => 'Berlin-Gropiusstadt',          'postal_code' => '12351'],
    ['city' => 'Berlin-Gropiusstadt',          'postal_code' => '12353'],
    ['city' => 'Berlin-Gropiusstadt',          'postal_code' => '12357'],

    ['city' => 'Berlin-Neukölln',              'postal_code' => '10965'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '10967'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12043'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12045'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12047'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12049'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12051'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12053'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12055'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12057'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12059'],
    ['city' => 'Berlin-Neukölln',              'postal_code' => '12099'],

    ['city' => 'Berlin-Rudow',                 'postal_code' => '12351'],
    ['city' => 'Berlin-Rudow',                 'postal_code' => '12353'],
    ['city' => 'Berlin-Rudow',                 'postal_code' => '12355'],
    ['city' => 'Berlin-Rudow',                 'postal_code' => '12357'],
    ['city' => 'Berlin-Rudow',                 'postal_code' => '12359'],

    // Pankow
    ['city' => 'Berlin-Blankenburg',           'postal_code' => '13051'],
    ['city' => 'Berlin-Blankenburg',           'postal_code' => '13125'],
    ['city' => 'Berlin-Blankenburg',           'postal_code' => '13129'],

    ['city' => 'Berlin-Blankenfelde',          'postal_code' => '13127'],
    ['city' => 'Berlin-Blankenfelde',          'postal_code' => '13158'],
    ['city' => 'Berlin-Blankenfelde',          'postal_code' => '13159'],

    ['city' => 'Berlin-Buch',                  'postal_code' => '13125'],
    ['city' => 'Berlin-Buch',                  'postal_code' => '13127'],

    ['city' => 'Berlin-Französisch Buchholz',  'postal_code' => '13127'],
    ['city' => 'Berlin-Französisch Buchholz',  'postal_code' => '13129'],
    ['city' => 'Berlin-Französisch Buchholz',  'postal_code' => '13156'],

    ['city' => 'Berlin-Heinersdorf',           'postal_code' => '13086'],
    ['city' => 'Berlin-Heinersdorf',           'postal_code' => '13088'],
    ['city' => 'Berlin-Heinersdorf',           'postal_code' => '13089'],
    ['city' => 'Berlin-Heinersdorf',           'postal_code' => '13129'],

    ['city' => 'Berlin-Karow',                 'postal_code' => '13125'],

    ['city' => 'Berlin-Niederschönhausen',     'postal_code' => '13127'],
    ['city' => 'Berlin-Niederschönhausen',     'postal_code' => '13156'],
    ['city' => 'Berlin-Niederschönhausen',     'postal_code' => '13158'],
    ['city' => 'Berlin-Niederschönhausen',     'postal_code' => '13187'],

    ['city' => 'Berlin-Pankow',                'postal_code' => '10439'],
    ['city' => 'Berlin-Pankow',                'postal_code' => '13129'],
    ['city' => 'Berlin-Pankow',                'postal_code' => '13187'],
    ['city' => 'Berlin-Pankow',                'postal_code' => '13189'],

    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10119'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10247'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10249'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10369'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10405'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10407'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10409'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10435'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10437'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '10439'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '13187'],
    ['city' => 'Berlin-Prenzlauer Berg',       'postal_code' => '13189'],

    ['city' => 'Berlin-Rosenthal',             'postal_code' => '13156'],
    ['city' => 'Berlin-Rosenthal',             'postal_code' => '13158'],

    ['city' => 'Berlin-Stadtrandsiedlung Malchow', 'postal_code' => '13051'],
    ['city' => 'Berlin-Stadtrandsiedlung Malchow', 'postal_code' => '13088'],
    ['city' => 'Berlin-Stadtrandsiedlung Malchow', 'postal_code' => '13089'],
    ['city' => 'Berlin-Stadtrandsiedlung Malchow', 'postal_code' => '13129'],

    ['city' => 'Berlin-Weißensee',             'postal_code' => '13051'],
    ['city' => 'Berlin-Weißensee',             'postal_code' => '13086'],
    ['city' => 'Berlin-Weißensee',             'postal_code' => '13088'],

    ['city' => 'Berlin-Wilhelmsruh',           'postal_code' => '13156'],
    ['city' => 'Berlin-Wilhelmsruh',           'postal_code' => '13158'],

    // Reinickendorf
    ['city' => 'Berlin-Borsigwalde',           'postal_code' => '13403'],
    ['city' => 'Berlin-Borsigwalde',           'postal_code' => '13509'],

    ['city' => 'Berlin-Frohnau',               'postal_code' => '13465'],

    ['city' => 'Berlin-Heiligensee',           'postal_code' => '13503'],
    ['city' => 'Berlin-Heiligensee',           'postal_code' => '13505'],

    ['city' => 'Berlin-Hermsdorf',             'postal_code' => '13465'],
    ['city' => 'Berlin-Hermsdorf',             'postal_code' => '13467'],

    ['city' => 'Berlin-Konradshöhe',           'postal_code' => '13505'],

    ['city' => 'Berlin-Lübars',                'postal_code' => '13435'],
    ['city' => 'Berlin-Lübars',                'postal_code' => '13469'],

    ['city' => 'Berlin-Märkisches Viertel',    'postal_code' => '13435'],
    ['city' => 'Berlin-Märkisches Viertel',    'postal_code' => '13439'],

    ['city' => 'Berlin-Reinickendorf',         'postal_code' => '13403'],
    ['city' => 'Berlin-Reinickendorf',         'postal_code' => '13405'],
    ['city' => 'Berlin-Reinickendorf',         'postal_code' => '13407'],
    ['city' => 'Berlin-Reinickendorf',         'postal_code' => '13409'],
    ['city' => 'Berlin-Reinickendorf',         'postal_code' => '13437'],
    ['city' => 'Berlin-Reinickendorf',         'postal_code' => '13509'],

    ['city' => 'Berlin-Tegel',                 'postal_code' => '13403'],
    ['city' => 'Berlin-Tegel',                 'postal_code' => '13405'],
    ['city' => 'Berlin-Tegel',                 'postal_code' => '13503'],
    ['city' => 'Berlin-Tegel',                 'postal_code' => '13505'],
    ['city' => 'Berlin-Tegel',                 'postal_code' => '13507'],
    ['city' => 'Berlin-Tegel',                 'postal_code' => '13509'],
    ['city' => 'Berlin-Tegel',                 'postal_code' => '13599'],
    ['city' => 'Berlin-Tegel',                 'postal_code' => '13629'],

    ['city' => 'Berlin-Waidmannslust',         'postal_code' => '13469'],

    ['city' => 'Berlin-Wittenau',              'postal_code' => '13403'],
    ['city' => 'Berlin-Wittenau',              'postal_code' => '13407'],
    ['city' => 'Berlin-Wittenau',              'postal_code' => '13435'],
    ['city' => 'Berlin-Wittenau',              'postal_code' => '13437'],
    ['city' => 'Berlin-Wittenau',              'postal_code' => '13439'],
    ['city' => 'Berlin-Wittenau',              'postal_code' => '13469'],
    ['city' => 'Berlin-Wittenau',              'postal_code' => '13509'],

    // Spandau
    ['city' => 'Berlin-Falkenhagener Feld',    'postal_code' => '13583'],
    ['city' => 'Berlin-Falkenhagener Feld',    'postal_code' => '13585'],
    ['city' => 'Berlin-Falkenhagener Feld',    'postal_code' => '13589'],
    ['city' => 'Berlin-Falkenhagener Feld',    'postal_code' => '13591'],

    ['city' => 'Berlin-Gatow',                 'postal_code' => '14089'],

    ['city' => 'Berlin-Hakenfelde',            'postal_code' => '13585'],
    ['city' => 'Berlin-Hakenfelde',            'postal_code' => '13587'],
    ['city' => 'Berlin-Hakenfelde',            'postal_code' => '13589'],

    ['city' => 'Berlin-Haselhorst',            'postal_code' => '13597'],
    ['city' => 'Berlin-Haselhorst',            'postal_code' => '13599'],

    ['city' => 'Berlin-Kladow',                'postal_code' => '14089'],

    ['city' => 'Berlin-Siemensstadt',          'postal_code' => '13599'],
    ['city' => 'Berlin-Siemensstadt',          'postal_code' => '13627'],
    ['city' => 'Berlin-Siemensstadt',          'postal_code' => '13629'],

    ['city' => 'Berlin-Spandau',               'postal_code' => '13581'],
    ['city' => 'Berlin-Spandau',               'postal_code' => '13583'],
    ['city' => 'Berlin-Spandau',               'postal_code' => '13585'],
    ['city' => 'Berlin-Spandau',               'postal_code' => '13587'],
    ['city' => 'Berlin-Spandau',               'postal_code' => '13597'],
    ['city' => 'Berlin-Spandau',               'postal_code' => '14052'],

    ['city' => 'Berlin-Staaken',               'postal_code' => '13581'],
    ['city' => 'Berlin-Staaken',               'postal_code' => '13589'],
    ['city' => 'Berlin-Staaken',               'postal_code' => '13591'],
    ['city' => 'Berlin-Staaken',               'postal_code' => '13593'],

    ['city' => 'Berlin-Wilhelmstadt',          'postal_code' => '13581'],
    ['city' => 'Berlin-Wilhelmstadt',          'postal_code' => '13593'],
    ['city' => 'Berlin-Wilhelmstadt',          'postal_code' => '13595'],
    ['city' => 'Berlin-Wilhelmstadt',          'postal_code' => '13597'],

    // Steglitz-Zehlendorf
    ['city' => 'Berlin-Dahlem',                'postal_code' => '12203'],
    ['city' => 'Berlin-Dahlem',                'postal_code' => '14169'],
    ['city' => 'Berlin-Dahlem',                'postal_code' => '14193'],
    ['city' => 'Berlin-Dahlem',                'postal_code' => '14195'],
    ['city' => 'Berlin-Dahlem',                'postal_code' => '14199'],

    ['city' => 'Berlin-Lankwitz',              'postal_code' => '12167'],
    ['city' => 'Berlin-Lankwitz',              'postal_code' => '12209'],
    ['city' => 'Berlin-Lankwitz',              'postal_code' => '12247'],
    ['city' => 'Berlin-Lankwitz',              'postal_code' => '12249'],
    ['city' => 'Berlin-Lankwitz',              'postal_code' => '12277'],

    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12165'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12203'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12205'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12207'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12209'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12247'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12249'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '12279'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '14167'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '14169'],
    ['city' => 'Berlin-Lichterfelde',          'postal_code' => '14195'],

    ['city' => 'Berlin-Nikolassee',            'postal_code' => '14109'],
    ['city' => 'Berlin-Nikolassee',            'postal_code' => '14129'],
    ['city' => 'Berlin-Nikolassee',            'postal_code' => '14163'],
    ['city' => 'Berlin-Nikolassee',            'postal_code' => '14193'],

    ['city' => 'Berlin-Schlachtensee',         'postal_code' => '14129'],

    ['city' => 'Berlin-Steglitz',              'postal_code' => '12157'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '12161'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '12163'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '12165'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '12167'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '12169'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '12203'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '12247'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '14195'],
    ['city' => 'Berlin-Steglitz',              'postal_code' => '14197'],

    ['city' => 'Berlin-Wannsee',               'postal_code' => '14109'],

    ['city' => 'Berlin-Zehlendorf',            'postal_code' => '14163'],
    ['city' => 'Berlin-Zehlendorf',            'postal_code' => '14165'],
    ['city' => 'Berlin-Zehlendorf',            'postal_code' => '14167'],
    ['city' => 'Berlin-Zehlendorf',            'postal_code' => '14169'],
    ['city' => 'Berlin-Zehlendorf',            'postal_code' => '14129'],

    // Tempelhof-Schöneberg
    ['city' => 'Berlin-Friedenau',             'postal_code' => '10827'],
    ['city' => 'Berlin-Friedenau',             'postal_code' => '12159'],
    ['city' => 'Berlin-Friedenau',             'postal_code' => '12161'],
    ['city' => 'Berlin-Friedenau',             'postal_code' => '12163'],
    ['city' => 'Berlin-Friedenau',             'postal_code' => '14197'],

    ['city' => 'Berlin-Lichtenrade',           'postal_code' => '12107'],
    ['city' => 'Berlin-Lichtenrade',           'postal_code' => '12277'],
    ['city' => 'Berlin-Lichtenrade',           'postal_code' => '12305'],
    ['city' => 'Berlin-Lichtenrade',           'postal_code' => '12307'],
    ['city' => 'Berlin-Lichtenrade',           'postal_code' => '12309'],

    ['city' => 'Berlin-Mariendorf',            'postal_code' => '12099'],
    ['city' => 'Berlin-Mariendorf',            'postal_code' => '12105'],
    ['city' => 'Berlin-Mariendorf',            'postal_code' => '12107'],
    ['city' => 'Berlin-Mariendorf',            'postal_code' => '12109'],
    ['city' => 'Berlin-Mariendorf',            'postal_code' => '12277'],
    ['city' => 'Berlin-Mariendorf',            'postal_code' => '12103'],

    ['city' => 'Berlin-Marienfelde',           'postal_code' => '12107'],
    ['city' => 'Berlin-Marienfelde',           'postal_code' => '12249'],
    ['city' => 'Berlin-Marienfelde',           'postal_code' => '12277'],
    ['city' => 'Berlin-Marienfelde',           'postal_code' => '12279'],
    ['city' => 'Berlin-Marienfelde',           'postal_code' => '12307'],

    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10777'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10779'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10781'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10783'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10785'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10787'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10789'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10823'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10825'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10827'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10829'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '10965'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '12101'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '12103'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '12105'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '12157'],
    ['city' => 'Berlin-Schöneberg',            'postal_code' => '12159'],

    ['city' => 'Berlin-Tempelhof',             'postal_code' => '10965'],
    ['city' => 'Berlin-Tempelhof',             'postal_code' => '12099'],
    ['city' => 'Berlin-Tempelhof',             'postal_code' => '12101'],
    ['city' => 'Berlin-Tempelhof',             'postal_code' => '12103'],
    ['city' => 'Berlin-Tempelhof',             'postal_code' => '12105'],
    ['city' => 'Berlin-Tempelhof',             'postal_code' => '12109'],
    ['city' => 'Berlin-Tempelhof',             'postal_code' => '12279'],

    // Treptow-Köpenick
    ['city' => 'Berlin-Adlershof',             'postal_code' => '12439'],
    ['city' => 'Berlin-Adlershof',             'postal_code' => '12487'],
    ['city' => 'Berlin-Adlershof',             'postal_code' => '12489'],

    ['city' => 'Berlin-Alt-Treptow',           'postal_code' => '12435'],

    ['city' => 'Berlin-Altglienicke',          'postal_code' => '12524'],
    ['city' => 'Berlin-Altglienicke',          'postal_code' => '12526'],

    ['city' => 'Berlin-Baumschulenweg',        'postal_code' => '12437'],
    ['city' => 'Berlin-Baumschulenweg',        'postal_code' => '12487'],

    ['city' => 'Berlin-Bohnsdorf',             'postal_code' => '12524'],
    ['city' => 'Berlin-Bohnsdorf',             'postal_code' => '12526'],

    ['city' => 'Berlin-Friedrichshagen',       'postal_code' => '12587'],

    ['city' => 'Berlin-Grünau',                'postal_code' => '12526'],
    ['city' => 'Berlin-Grünau',                'postal_code' => '12527'],

    ['city' => 'Berlin-Johannisthal',          'postal_code' => '12437'],
    ['city' => 'Berlin-Johannisthal',          'postal_code' => '12439'],
    ['city' => 'Berlin-Johannisthal',          'postal_code' => '12487'],
    ['city' => 'Berlin-Johannisthal',          'postal_code' => '12489'],

    ['city' => 'Berlin-Köpenick',              'postal_code' => '12555'],
    ['city' => 'Berlin-Köpenick',              'postal_code' => '12557'],
    ['city' => 'Berlin-Köpenick',              'postal_code' => '12559'],
    ['city' => 'Berlin-Köpenick',              'postal_code' => '12587'],
    ['city' => 'Berlin-Köpenick',              'postal_code' => '12623'],
    ['city' => 'Berlin-Köpenick',              'postal_code' => '12459'],

    ['city' => 'Berlin-Müggelheim',            'postal_code' => '12559'],

    ['city' => 'Berlin-Niederschöneweide',     'postal_code' => '12437'],
    ['city' => 'Berlin-Niederschöneweide',     'postal_code' => '12439'],

    ['city' => 'Berlin-Oberschöneweide',       'postal_code' => '10318'],
    ['city' => 'Berlin-Oberschöneweide',       'postal_code' => '12459'],

    ['city' => 'Berlin-Plänterwald',           'postal_code' => '12435'],
    ['city' => 'Berlin-Plänterwald',           'postal_code' => '12437'],

    ['city' => 'Berlin-Rahnsdorf',             'postal_code' => '12587'],
    ['city' => 'Berlin-Rahnsdorf',             'postal_code' => '12589'],

    ['city' => 'Berlin-Schmöckwitz',           'postal_code' => '12527'],

    ['city' => 'Birkenwerder',                'postal_code' => '16547'],
    ['city' => 'Glienicke/Nordbahn',          'postal_code' => '16548'],

    ['city' => 'Plattenburg',                 'postal_code' => '19339'],
    ['city' => 'Plattenburg',                 'postal_code' => '19322'],
    ['city' => 'Plattenburg',                 'postal_code' => '19336'],
    ['city' => 'Plattenburg',                 'postal_code' => '19348'],
    ['city' => 'Plattenburg',                 'postal_code' => '16928'],

    ['city' => 'Zehdenick',                   'postal_code' => '16792'],
    ['city' => 'Leegebruch',                  'postal_code' => '16767'],
    ['city' => 'Hennigsdorf',                 'postal_code' => '16761'],

    ['city' => 'Mühlenbecker Land',           'postal_code' => '16567'],
    ['city' => 'Mühlenbecker Land',           'postal_code' => '16515'],
    ['city' => 'Mühlenbecker Land',           'postal_code' => '16552'],

    ['city' => 'Oranienburg',                 'postal_code' => '16515'],

    ['city' => 'Biesenthal',                  'postal_code' => '16359'],
    ['city' => 'Liebenwalde',                 'postal_code' => '16559'],
    ['city' => 'Fürstenberg/Havel',           'postal_code' => '16798'],
    ['city' => 'Schorfheide',                 'postal_code' => '16244'],
    ['city' => 'Brüssow',                     'postal_code' => '17326'],

    ['city' => 'Dallgow-Döberitz',            'postal_code' => '14624'],
    ['city' => 'Nuthetal',                    'postal_code' => '14558'],
    ['city' => 'Rosenau',                     'postal_code' => '14789'],

    ['city' => 'Schwedt/Oder',                'postal_code' => '16303'],
    ['city' => 'Schwedt/Oder',                'postal_code' => '16278'],

    ['city' => 'Letschin',                    'postal_code' => '15324'],
    ['city' => 'Panketal',                    'postal_code' => '16341'],
    ['city' => 'Müncheberg',                  'postal_code' => '15374'],
    ['city' => 'Strausberg',                  'postal_code' => '15344'],
    ['city' => 'Kremmen',                     'postal_code' => '16766'],

    ['city' => 'Podelzig',                    'postal_code' => '15326'],
    ['city' => 'Zeschdorf',                   'postal_code' => '15236'],

    ['city' => 'Cottbus',                     'postal_code' => '03052'],
    ['city' => 'Neuhausen/Spree',             'postal_code' => '03058'],
    ['city' => 'Cottbus',                     'postal_code' => '03051'],

    ['city' => 'Uckerland',                   'postal_code' => '17337'],
    ['city' => 'Karstädt/Prignitz',           'postal_code' => '19357'],
    ['city' => 'Lychen',                      'postal_code' => '17279'],

    ['city' => 'Brandenburg',                 'postal_code' => '14770'],
    ['city' => 'Brandenburg',                 'postal_code' => '14774'],
    ['city' => 'Brandenburg',                 'postal_code' => '14776'],
    ['city' => 'Brandenburg',                 'postal_code' => '14772'],

    ['city' => 'Ketzin/Havel',                'postal_code' => '14669'],
    ['city' => 'Retzow b. Nauen',             'postal_code' => '14641'],
    ['city' => 'Mühlenberge',                 'postal_code' => '14662'],

    ['city' => 'Frankfurt (Oder)',            'postal_code' => '15232'],
    ['city' => 'Frankfurt (Oder)',            'postal_code' => '15236'],
    ['city' => 'Frankfurt (Oder)',            'postal_code' => '15234'],
    ['city' => 'Frankfurt (Oder)',            'postal_code' => '15230'],

    ['city' => 'Jacobsdorf',                  'postal_code' => '15236'],

    ['city' => 'Mark Landin',                 'postal_code' => '16278'],

    // Raum Senftenberg / Schipkau
    ['city' => 'Senftenberg',                 'postal_code' => '01996'],
    ['city' => 'Senftenberg',                 'postal_code' => '01945'],
    ['city' => 'Senftenberg',                 'postal_code' => '01968'],
    ['city' => 'Senftenberg',                 'postal_code' => '01994'],
    ['city' => 'Senftenberg',                 'postal_code' => '01998'],
    ['city' => 'Senftenberg',                 'postal_code' => '01993'],

    ['city' => 'Schipkau',                    'postal_code' => '01968'],

    // Raum Rheinsberg / Neuruppin / Wittstock/Dosse / Märkisch Linden / Fehrbellin / Temnitzquell / Heiligengrabe / Lindow/Mark / Zernitz-Lohm / Wusterhausen/Dosse
    ['city' => 'Rheinsberg',                  'postal_code' => '16837'],
    ['city' => 'Rheinsberg',                  'postal_code' => '16818'],
    ['city' => 'Rheinsberg',                  'postal_code' => '16835'],
    ['city' => 'Rheinsberg',                  'postal_code' => '16831'],

    ['city' => 'Wittstock/Dosse',             'postal_code' => '16837'],
    ['city' => 'Wittstock/Dosse',             'postal_code' => '16909'],

    ['city' => 'Neuruppin',                   'postal_code' => '16827'],
    ['city' => 'Neuruppin',                   'postal_code' => '16818'],
    ['city' => 'Neuruppin',                   'postal_code' => '16835'],
    ['city' => 'Neuruppin',                   'postal_code' => '16833'],
    ['city' => 'Neuruppin',                   'postal_code' => '16816'],

    ['city' => 'Märkisch Linden',             'postal_code' => '16818'],
    ['city' => 'Märkisch Linden',             'postal_code' => '16909'],
    ['city' => 'Märkisch Linden',             'postal_code' => '16845'],

    ['city' => 'Fehrbellin',                  'postal_code' => '16818'],
    ['city' => 'Fehrbellin',                  'postal_code' => '16845'],
    ['city' => 'Fehrbellin',                  'postal_code' => '16833'],

    ['city' => 'Temnitzquell',                'postal_code' => '16818'],

    ['city' => 'Heiligengrabe',               'postal_code' => '16909'],
    ['city' => 'Heiligengrabe',               'postal_code' => '16928'],

    ['city' => 'Lindow/Mark',                 'postal_code' => '16835'],

    ['city' => 'Zernitz-Lohm',                'postal_code' => '16845'],

    ['city' => 'Wusterhausen/Dosse',          'postal_code' => '16845'],
    ['city' => 'Wusterhausen/Dosse',          'postal_code' => '16868'],
    ['city' => 'Wusterhausen/Dosse',          'postal_code' => '16866'],

    // Potsdam / Umland
    ['city' => 'Potsdam',                     'postal_code' => '14480'],
    ['city' => 'Potsdam',                     'postal_code' => '14478'],
    ['city' => 'Potsdam',                     'postal_code' => '14471'],
    ['city' => 'Potsdam',                     'postal_code' => '14467'],
    ['city' => 'Potsdam',                     'postal_code' => '14469'],
    ['city' => 'Potsdam',                     'postal_code' => '14476'],
    ['city' => 'Potsdam',                     'postal_code' => '14473'],
    ['city' => 'Potsdam',                     'postal_code' => '14482'],

    ['city' => 'Falkensee',                   'postal_code' => '14612'],
    ['city' => 'Kleßen-Görne',                'postal_code' => '14728'],
    ['city' => 'Rathenow',                    'postal_code' => '14712'],
    ['city' => 'Havelsee',                    'postal_code' => '14798'],
    ['city' => 'Schönwalde-Glien',            'postal_code' => '14621'],
    ['city' => 'Premnitz',                    'postal_code' => '14727'],
    ['city' => 'Friesack',                    'postal_code' => '14662'],
    ['city' => 'Brieselang',                  'postal_code' => '14656'],
    ['city' => 'Seeblick',                    'postal_code' => '14715'],
    ['city' => 'Groß Kreutz (Havel)',         'postal_code' => '14550'],
    ['city' => 'Golzow b. Brandenburg',       'postal_code' => '14778'],

    ['city' => 'Mühlenfließ',                 'postal_code' => '14823'],
    ['city' => 'Mühlenfließ',                 'postal_code' => '14822'],

    ['city' => 'Niemegk',                     'postal_code' => '14823'],
    ['city' => 'Kleinmachnow',                'postal_code' => '14532'],
    ['city' => 'Kloster Lehnin',              'postal_code' => '14797'],
    ['city' => 'Teltow',                      'postal_code' => '14513'],

    ['city' => 'Schwielowsee',                'postal_code' => '14548'],
    ['city' => 'Schwielowsee',                'postal_code' => '14542'],

    ['city' => 'Borkwalde',                   'postal_code' => '14822'],
    ['city' => 'Treuenbrietzen',              'postal_code' => '14929'],
    ['city' => 'Gräben',                      'postal_code' => '14793'],
    ['city' => 'Seddiner See',                'postal_code' => '14554'],
    ['city' => 'Görzke',                      'postal_code' => '14828'],
    ['city' => 'Beelitz/Mark',                'postal_code' => '14547'],
    ['city' => 'Bad Belzig',                  'postal_code' => '14806'],
    ['city' => 'Werder/Havel',                'postal_code' => '14542'],
    ['city' => 'Michendorf',                  'postal_code' => '14552'],
    ['city' => 'Wiesenburg/Mark',             'postal_code' => '14827'],

    // südlich von Berlin
    ['city' => 'Großbeeren',                  'postal_code' => '14979'],
    ['city' => 'Großbeeren',                  'postal_code' => '15831'],

    ['city' => 'Luckenwalde',                 'postal_code' => '14943'],

    ['city' => 'Trebbin',                     'postal_code' => '14943'],
    ['city' => 'Trebbin',                     'postal_code' => '14974'],
    ['city' => 'Trebbin',                     'postal_code' => '14959'],

    ['city' => 'Ludwigsfelde',                'postal_code' => '14974'],
    ['city' => 'Nuthe-Urstromtal',            'postal_code' => '14947'],
];


try {
    $checkSupplier = $pdo->prepare('SELECT id FROM suppliers WHERE id = :id LIMIT 1');
    $checkSupplier->execute(['id' => $supplierId]);

    if (!$checkSupplier->fetchColumn()) {
        http_response_code(404);
        exit("Supplier nicht gefunden: {$supplierId}\n");
    }

    $stmt = $pdo->prepare(
        'INSERT IGNORE INTO supplier_delivery_areas (
            id,
            supplier_id,
            city,
            postal_code
        ) VALUES (
            :id,
            :supplier_id,
            :city,
            :postal_code
        )'
    );

    $inserted = 0;
    $skipped = 0;

    foreach ($areas as $area) {
        $stmt->execute([
            'id' => uuidV4(),
            'supplier_id' => $supplierId,
            'city' => $area['city'],
            'postal_code' => $area['postal_code'],
        ]);

        if ($stmt->rowCount() > 0) {
            $inserted++;
        } else {
            $skipped++;
        }
    }

    echo "Fertig.\n";
    echo "Supplier: {$supplierId}\n";
    echo "Neue Einträge: {$inserted}\n";
    echo "Übersprungen (bereits vorhanden): {$skipped}\n";
    echo "Gesamt verarbeitet: " . count($areas) . "\n";
} catch (Throwable $e) {
    http_response_code(500);
    echo "Fehler: " . $e->getMessage() . "\n";
}