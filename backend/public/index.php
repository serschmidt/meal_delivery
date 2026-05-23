<?php
// backend/public/index.php
set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error'   => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
    ]);
    exit;
});

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt_config.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/mailer.php';

require_once __DIR__ . '/../src/helpers.php';
require_once __DIR__ . '/../src/cors.php';
require_once __DIR__ . '/../src/response.php';

require_once __DIR__ . '/../src/services/AuthService.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';

require_once __DIR__ . '/../src/suppliers.php';
require_once __DIR__ . '/../src/meals.php';
require_once __DIR__ . '/../src/weekly-menus.php';
require_once __DIR__ . '/../src/orders.php';
require_once __DIR__ . '/../src/customers.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$route  = $_GET['route'] ?? '';

if ($route === '') {
    $uri  = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    $base = '/backend/';
    if (str_starts_with($uri, $base)) {
        $route = substr($uri, strlen($base));
    }
    $route = trim($route, '/');
}

if ($route === 'auth/login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if ($email === '' || $password === '') {
        jsonResponse(['error' => 'E-Mail und Passwort sind erforderlich.'], 422);
        exit;
    }

    try {
        $result = loginAdmin($email, $password);
        jsonResponse(['data' => $result], 200);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 401);
        exit;
    }
}

if ($route === 'auth/me' && $method === 'GET') {
    $user = requireAuth();
    jsonResponse(['data' => $user], 200);
    exit;
}

if ($route === 'auth/refresh' && $method === 'POST') {
    error_log('REFRESH COOKIE DUMP: ' . json_encode($_COOKIE));

    try {
        $result = refreshAdminSession();
        jsonResponse(['data' => $result], 200);
        exit;
    } catch (Throwable $e) {
        error_log('REFRESH ERROR: ' . $e->getMessage());
        jsonResponse(['error' => $e->getMessage()], 401);
        exit;
    }
}

if ($route === 'auth/logout' && $method === 'POST') {
    logoutAdmin();
    jsonResponse(['data' => ['message' => 'Erfolgreich abgemeldet.']], 200);
    exit;
}

if ($route === 'supplier-auth/login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if ($email === '' || $password === '') {
        jsonResponse(['error' => 'E-Mail und Passwort sind erforderlich.'], 422);
        exit;
    }

    try {
        $result = loginSupplier($email, $password);
        jsonResponse(['data' => $result], 200);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 401);
        exit;
    }
}

if ($route === 'supplier-auth/me' && $method === 'GET') {
    $user = requireSupplier();
    jsonResponse(['data' => $user], 200);
    exit;
}

if ($route === 'supplier-auth/refresh' && $method === 'POST') {
    try {
        $result = refreshSupplierSession();
        jsonResponse(['data' => $result], 200);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 401);
        exit;
    }
}

if ($route === 'supplier-auth/logout' && $method === 'POST') {
    logoutSupplier();
    jsonResponse(['data' => ['message' => 'Erfolgreich abgemeldet.']], 200);
    exit;
}

if ($route === 'supplier/orders' && $method === 'GET') {
    $supplier = requireSupplier();

    try {
        $status = isset($_GET['status']) ? (string)$_GET['status'] : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

        $limit = max(1, min(100, $limit));
        $offset = max(0, $offset);

        $result = getOrdersBySupplier($supplier['sub'], $status, $limit, $offset);

        jsonResponse(['data' => $result], 200);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    }
}

if (preg_match('#^supplier/orders/([a-f0-9\-]+)$#i', $route, $matches) && $method === 'GET') {
    $supplier = requireSupplier();
    $orderId = $matches[1];

    $order = getOrderByIdForSupplier($orderId, $supplier['sub']);

    if (!$order) {
        jsonResponse(['error' => 'Bestellung nicht gefunden.'], 404);
        exit;
    }

    jsonResponse(['data' => $order], 200);
    exit;
}

if (preg_match('#^supplier/orders/([a-f0-9\-]+)/status$#i', $route, $matches) && $method === 'PATCH') {
    $supplier = requireSupplier();
    $orderId = $matches[1];
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $status = (string)($input['status'] ?? '');

    if ($status === '') {
        jsonResponse(['error' => 'Status ist erforderlich.'], 422);
        exit;
    }

    try {
        $updatedOrder = updateOrderStatusBySupplier($orderId, $supplier['sub'], $status);

        if (!$updatedOrder) {
            jsonResponse(['error' => 'Bestellung nicht gefunden.'], 404);
            exit;
        }

        jsonResponse(['data' => $updatedOrder], 200);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    }
}

if ($route === 'supplier/profile' && $method === 'GET') {
    $supplier = requireSupplier();

    $profile = getSupplierProfileForSelf($supplier['sub']);

    if ($profile === null) {
        jsonResponse(['error' => 'Lieferant nicht gefunden.'], 404);
        exit;
    }

    jsonResponse(['data' => $profile], 200);
    exit;
}

if ($route === 'supplier/profile' && $method === 'PATCH') {
    $supplier = requireSupplier();

    try {
        $payload = jsonInput();
        $profile = updateSupplierProfileSelfService($supplier['sub'], $payload);

        if ($profile === null) {
            jsonResponse(['error' => 'Lieferant nicht gefunden.'], 404);
            exit;
        }

        jsonResponse(['data' => $profile], 200);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    }
}

if ($route === 'supplier/change-password' && $method === 'PATCH') {
    $supplier = requireSupplier();

    try {
        $payload = jsonInput();
        changeSupplierPasswordSelfService($supplier['sub'], $payload);

        jsonResponse([
            'data' => [
                'message' => 'Passwort erfolgreich geändert.',
            ],
        ], 200);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (RuntimeException $e) {
        jsonResponse(['error' => $e->getMessage()], 404);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /suppliers/by-delivery-area?q=...
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'suppliers/by-delivery-area') {
    $q = trim($_GET['q'] ?? '');

    try {
        jsonResponse(['data' => findSupplierByDeliveryArea($q)]);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /suppliers/{id}/delivery-areas?q=...
// ------------------------------------------------------------------------------

if ($method === 'GET' && preg_match('#^suppliers/([0-9a-f\-]+)/delivery-areas$#', $route, $matches)) {
    $supplierId = $matches[1];
    $q = trim($_GET['q'] ?? '');

    try {
        jsonResponse(['data' => getSupplierDeliveryAreas($supplierId, $q)]);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /suppliers/all
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'suppliers/all') {
    try {
        jsonResponse(['data' => getAllSuppliers()]);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /suppliers/search?q=...
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'suppliers/search') {
    $q = $_GET['q'] ?? '';
    jsonResponse(['data' => searchSuppliers($q)]);
    exit;
}

// ------------------------------------------------------------------------------
// GET /suppliers/{id}
// ------------------------------------------------------------------------------

if ($method === 'GET' && preg_match('#^suppliers/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $supplier = getSupplierById($id);

        if ($supplier === null) {
            jsonResponse(['error' => 'Supplier not found'], 404);
            exit;
        }

        jsonResponse(['data' => $supplier]);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// POST /suppliers
// ------------------------------------------------------------------------------

if ($method === 'POST' && $route === 'suppliers') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            jsonResponse(['error' => 'Invalid JSON', 'json_error' => json_last_error_msg()], 400);
            exit;
        }

        jsonResponse(['data' => createSupplier($data)], 201);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// PUT /suppliers/{id}
// ------------------------------------------------------------------------------

if ($method === 'PUT' && preg_match('#^suppliers/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            jsonResponse(['error' => 'Invalid JSON', 'json_error' => json_last_error_msg()], 400);
            exit;
        }

        $supplier = updateSupplier($id, $data);

        if ($supplier === null) {
            jsonResponse(['error' => 'Supplier not found'], 404);
            exit;
        }

        jsonResponse(['data' => $supplier]);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /meals
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'meals') {
    jsonResponse(['data' => getAllMeals()]);
    exit;
}

// ------------------------------------------------------------------------------
// POST /meals
// ------------------------------------------------------------------------------

if ($method === 'POST' && $route === 'meals') {
    $user = requireAuth();
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            jsonResponse(['error' => 'Invalid JSON', 'json_error' => json_last_error_msg()], 400);
            exit;
        }

        jsonResponse(['data' => createMeal($data)], 201);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// PUT /meals/{id}
// ------------------------------------------------------------------------------

if ($method === 'PUT' && preg_match('#^meals/([0-9a-f\-]+)$#', $route, $matches)) {
    $user = requireAuth();
    $id = $matches[1];

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            jsonResponse(['error' => 'Invalid JSON', 'json_error' => json_last_error_msg()], 400);
            exit;
        }

        $meal = updateMeal($id, $data);

        if ($meal === null) {
            jsonResponse(['error' => 'Meal not found'], 404);
            exit;
        }

        jsonResponse(['data' => $meal]);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// DELETE /meals/{id}
// ------------------------------------------------------------------------------

if ($method === 'DELETE' && preg_match('#^meals/([0-9a-f\-]+)$#', $route, $matches)) {
    $user = requireAuth();
    $id = $matches[1];

    try {
        $deleted = deleteMeal($id);

        if (!$deleted) {
            jsonResponse(['error' => 'Meal not found'], 404);
            exit;
        }

        jsonResponse([], 204);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /weekly-menus
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'weekly-menus') {
    jsonResponse(['data' => getAllWeeklyMenus()]);
    exit;
}

// ------------------------------------------------------------------------------
// GET /weekly-menus/upcoming
// ------------------------------------------------------------------------------


if ($method === 'GET' && $route === 'weekly-menus/upcoming') {
    jsonResponse(['data' => getUpcomingWeeklyMenus()]);
    exit;
}

// ------------------------------------------------------------------------------
// GET /weekly-menus/{id}
// ------------------------------------------------------------------------------

if ($method === 'GET' && preg_match('#^weekly-menus/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $weeklyMenu = getWeeklyMenuById($id);

        if ($weeklyMenu === null) {
            jsonResponse(['error' => 'Weekly menu not found'], 404);
            exit;
        }

        jsonResponse(['data' => $weeklyMenu]);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// POST /weekly-menus
// ------------------------------------------------------------------------------

if ($method === 'POST' && $route === 'weekly-menus') {
    $user = requireAuth();

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            jsonResponse(['error' => 'Invalid JSON', 'json_error' => json_last_error_msg()], 400);
            exit;
        }

        jsonResponse(['data' => createWeeklyMenu($data)], 201);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// PUT /weekly-menus/{id}
// ------------------------------------------------------------------------------

if ($method === 'PUT' && preg_match('#^weekly-menus/([0-9a-f\-]+)$#', $route, $matches)) {
    $user = requireAuth();
    $id = $matches[1];

    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            jsonResponse(['error' => 'Invalid JSON', 'json_error' => json_last_error_msg()], 400);
            exit;
        }

        $weeklyMenu = updateWeeklyMenu($id, $data);

        if ($weeklyMenu === null) {
            jsonResponse(['error' => 'Weekly menu not found'], 404);
            exit;
        }

        jsonResponse(['data' => $weeklyMenu]);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// DELETE /weekly-menus/{id}
// ------------------------------------------------------------------------------

if ($method === 'DELETE' && preg_match('#^weekly-menus/([0-9a-f\-]+)$#', $route, $matches)) {
    $user = requireAuth();
    $id = $matches[1];

    try {
        $deleted = deleteWeeklyMenu($id);

        if (!$deleted) {
            jsonResponse(['error' => 'Weekly menu not found'], 404);
            exit;
        }

        jsonResponse([], 204);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /orders
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'orders') {
    jsonResponse(['data' => getAllOrders()]);
    exit;
}

// ------------------------------------------------------------------------------
// GET /orders/{id}
// ------------------------------------------------------------------------------

if ($method === 'GET' && preg_match('#^orders/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $order = getOrderById($id);

        if ($order === null) {
            jsonResponse(['error' => 'Order not found'], 404);
            exit;
        }

        jsonResponse(['data' => $order]);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// POST /orders
// ------------------------------------------------------------------------------

if ($method === 'POST' && $route === 'orders') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            jsonResponse(['error' => 'Invalid JSON', 'json_error' => json_last_error_msg()], 400);
            exit;
        }

        jsonResponse(['data' => createOrder($data)], 201);
        exit;
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
        exit;
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
        exit;
    }
}

// ------------------------------------------------------------------------------
// GET /customers
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'customers') {
    try {
        jsonResponse(['data' => getAllCustomers()]);
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

// ------------------------------------------------------------------------------
// GET /customers/{id}
// ------------------------------------------------------------------------------

if ($method === 'GET' && preg_match('#^customers/([0-9a-f\\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $customer = getCustomerById($id);

        if ($customer === null) {
            jsonResponse(['error' => 'Customer not found'], 404);
        }

        jsonResponse(['data' => $customer]);
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

// ------------------------------------------------------------------------------
// Fallback
// ------------------------------------------------------------------------------

jsonResponse(['error' => 'Route not found'], 404);
exit;
