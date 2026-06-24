<?php
// /src/weekly-menus.php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

function mapWeeklyMenuRow(array $row): array
{
    return [
        'id' => binToUuid($row['id']),
        'calendarWeek' => isset($row['calendar_week']) ? (int) $row['calendar_week'] : null,
        'title' => $row['title'],
        'description' => $row['description'],
        'startDate' => $row['start_date'],
        'endDate' => $row['end_date'],
        'imageUrl' => $row['image_url'],
    ];
}

function mapWeeklyMenuEntryRow(array $row): array
{
    $dayLabels = [
        'MONDAY'    => 'Montag',
        'TUESDAY'   => 'Dienstag',
        'WEDNESDAY' => 'Mittwoch',
        'THURSDAY'  => 'Donnerstag',
        'FRIDAY'    => 'Freitag',
        'SATURDAY'  => 'Samstag',
        'SUNDAY'    => 'Sonntag',
    ];

    $dayOfWeek = $row['day_of_week'] ?? '';

    return [
        'id'        => binToUuid($row['id']),
        'dayOfWeek' => $dayOfWeek,
        'dayLabel'  => $dayLabels[$dayOfWeek] ?? $dayOfWeek,
        'menuDate'  => $row['menu_date'],
        'position'  => isset($row['position']) ? (int) $row['position'] : null,
        'meal'      => [
            'id'          => binToUuid($row['meal_id']),
            'name'        => $row['meal_name'],
            'description' => $row['meal_description'],
            'price' => isset($row['meal_price']) ? round((float) $row['meal_price'], 2) : 0,
            'available'   => isset($row['meal_available']) ? (bool) $row['meal_available'] : true,
            'imageUrl'    => $row['meal_image_url'],
        ],
    ];
}

function validateWeeklyMenuData(array $data): void
{
    if (!isset($data['calendar_week']) || !is_numeric($data['calendar_week'])) {
        throw new InvalidArgumentException('calendar_week is required and must be numeric');
    }

    if (!isset($data['start_date']) || trim((string) $data['start_date']) === '') {
        throw new InvalidArgumentException('start_date is required');
    }

    if (!isset($data['end_date']) || trim((string) $data['end_date']) === '') {
        throw new InvalidArgumentException('end_date is required');
    }

    if (isset($data['title']) && mb_strlen((string) $data['title']) > 150) {
        throw new InvalidArgumentException('title must not exceed 150 characters');
    }

    if (isset($data['description']) && mb_strlen((string) $data['description']) > 1000) {
        throw new InvalidArgumentException('description must not exceed 1000 characters');
    }

    if (isset($data['image_url']) && mb_strlen((string) $data['image_url']) > 1000) {
        throw new InvalidArgumentException('image_url must not exceed 1000 characters');
    }

    if (!isset($data['entries']) || !is_array($data['entries'])) {
        throw new InvalidArgumentException('entries is required and must be an array');
    }

    $allowedDays = [
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
    ];

    foreach ($data['entries'] as $index => $entry) {
        if (!is_array($entry)) {
            throw new InvalidArgumentException("entries[$index] must be an object");
        }

        if (
            !isset($entry['day_of_week']) ||
            !in_array($entry['day_of_week'], $allowedDays, true)
        ) {
            throw new InvalidArgumentException("entries[$index].day_of_week is invalid");
        }

        if (!isset($entry['menu_date']) || trim((string) $entry['menu_date']) === '') {
            throw new InvalidArgumentException("entries[$index].menu_date is required");
        }

        if (!isset($entry['position']) || !is_numeric($entry['position'])) {
            throw new InvalidArgumentException("entries[$index].position must be numeric");
        }

        if (!isset($entry['meal_id']) || trim((string) $entry['meal_id']) === '') {
            throw new InvalidArgumentException("entries[$index].meal_id is required");
        }
    }
}

function getWeeklyMenuEntries(string $weeklyMenuId): array
{
    $sql = "
        SELECT 
            wme.id,
            wme.day_of_week,
            wme.menu_date,
            wme.position,
            wme.meal_id,
            wme.weekly_menu_id,
            m.name AS meal_name,
            m.description AS meal_description,
            m.price AS meal_price,
            m.available AS meal_available,
            m.image_url AS meal_image_url
        FROM weekly_menu_entries wme
        INNER JOIN meals m ON m.id = wme.meal_id
        WHERE wme.weekly_menu_id = :weekly_menu_id
        ORDER BY wme.menu_date ASC, wme.position ASC
    ";

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':weekly_menu_id' => uuidToBin($weeklyMenuId),
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return array_map('mapWeeklyMenuEntryRow', $rows);
}


function getAllWeeklyMenus(): array
{
    $sql = "
        SELECT
            wm.id,
            wm.calendar_week,
            wm.title,
            wm.description,
            wm.start_date,
            wm.end_date,
            wm.image_url
        FROM weekly_menus wm
        ORDER BY wm.start_date ASC, wm.calendar_week ASC
    ";

    $stmt = db()->query($sql);
    $menus = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($menus as $menu) {
        $mappedMenu = mapWeeklyMenuRow($menu);
        $mappedMenu['entries'] = getWeeklyMenuEntries($mappedMenu['id']);
        $result[] = $mappedMenu;
    }

    return $result;
}

function getWeeklyMenuById(string $id): ?array
{
    $sql = "
        SELECT
            wm.id,
            wm.calendar_week,
            wm.title,
            wm.description,
            wm.start_date,
            wm.end_date,
            wm.image_url
        FROM weekly_menus wm
        WHERE wm.id = :id
        LIMIT 1
    ";

    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':id' => uuidToBin($id),
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return null;
    }

    $menu = mapWeeklyMenuRow($row);
    $menu['entries'] = getWeeklyMenuEntries($menu['id']);

    return $menu;
}

function insertWeeklyMenuEntries(string $weeklyMenuId, array $entries): void
{
    $sql = "
        INSERT INTO weekly_menu_entries (
            id,
            day_of_week,
            menu_date,
            position,
            meal_id,
            weekly_menu_id
        ) VALUES (
            :id,
            :day_of_week,
            :menu_date,
            :position,
            :meal_id,
            :weekly_menu_id
        )
    ";

    $stmt = db()->prepare($sql);

    foreach ($entries as $entry) {
        $entryId = generateUuid();

        $stmt->execute([
            ':id' => uuidToBin($entryId),
            ':day_of_week' => $entry['day_of_week'],
            ':menu_date' => $entry['menu_date'],
            ':position' => (int) $entry['position'],
            ':meal_id' => uuidToBin($entry['meal_id']),
            ':weekly_menu_id' => uuidToBin($weeklyMenuId),
        ]);
    }
}

function createWeeklyMenu(array $data): array
{
    validateWeeklyMenuData($data);

    $menuId = generateUuid();
    $pdo = db();

    try {
        $pdo->beginTransaction();

        $sql = "
            INSERT INTO weekly_menus (
                id,
                calendar_week,
                description,
                end_date,
                image_url,
                start_date,
                title
            ) VALUES (
                :id,
                :calendar_week,
                :description,
                :end_date,
                :image_url,
                :start_date,
                :title
            )
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => uuidToBin($menuId),
            ':calendar_week' => (int) $data['calendar_week'],
            ':description' => $data['description'] ?? null,
            ':end_date' => $data['end_date'],
            ':image_url' => $data['image_url'] ?? null,
            ':start_date' => $data['start_date'],
            ':title' => $data['title'] ?? null,
        ]);

        insertWeeklyMenuEntries($menuId, $data['entries']);

        $pdo->commit();

        return getWeeklyMenuById($menuId);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $e;
    }
}

function updateWeeklyMenu(string $id, array $data): ?array
{
    validateWeeklyMenuData($data);

    $existing = getWeeklyMenuById($id);

    if ($existing === null) {
        return null;
    }

    $pdo = db();

    try {
        $pdo->beginTransaction();

        $sql = "
            UPDATE weekly_menus
            SET
                calendar_week = :calendar_week,
                description = :description,
                end_date = :end_date,
                image_url = :image_url,
                start_date = :start_date,
                title = :title
            WHERE id = :id
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id' => uuidToBin($id),
            ':calendar_week' => (int) $data['calendar_week'],
            ':description' => $data['description'] ?? null,
            ':end_date' => $data['end_date'],
            ':image_url' => $data['image_url'] ?? null,
            ':start_date' => $data['start_date'],
            ':title' => $data['title'] ?? null,
        ]);

        $deleteSql = "
            DELETE FROM weekly_menu_entries
            WHERE weekly_menu_id = :weekly_menu_id
        ";

        $deleteStmt = $pdo->prepare($deleteSql);
        $deleteStmt->execute([
            ':weekly_menu_id' => uuidToBin($id),
        ]);

        insertWeeklyMenuEntries($id, $data['entries']);

        $pdo->commit();

        return getWeeklyMenuById($id);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $e;
    }
}

function getUpcomingWeeklyMenus(): array
{
    $sql = "
        SELECT
            wm.id,
            wm.calendar_week,
            wm.title,
            wm.description,
            wm.start_date,
            wm.end_date,
            wm.image_url
        FROM weekly_menus wm
        WHERE wm.start_date > CURDATE()
        ORDER BY wm.start_date ASC, wm.calendar_week ASC
    ";

    $stmt = db()->query($sql);
    $menus = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];

    foreach ($menus as $menu) {
        $mappedMenu = mapWeeklyMenuRow($menu);
        $mappedMenu['entries'] = getWeeklyMenuEntries($mappedMenu['id']);
        $result[] = $mappedMenu;
    }

    return $result;
}

function deleteWeeklyMenu(string $id): bool
{
    $existing = getWeeklyMenuById($id);

    if ($existing === null) {
        return false;
    }

    $pdo = db();

    try {
        $pdo->beginTransaction();

        $deleteEntriesSql = "
            DELETE FROM weekly_menu_entries
            WHERE weekly_menu_id = :weekly_menu_id
        ";

        $deleteEntriesStmt = $pdo->prepare($deleteEntriesSql);
        $deleteEntriesStmt->execute([
            ':weekly_menu_id' => uuidToBin($id),
        ]);

        $deleteMenuSql = "
            DELETE FROM weekly_menus
            WHERE id = :id
        ";

        $deleteMenuStmt = $pdo->prepare($deleteMenuSql);
        $deleteMenuStmt->execute([
            ':id' => uuidToBin($id),
        ]);

        $pdo->commit();

        return true;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $e;
    }
}
