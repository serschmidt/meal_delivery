<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../src/cors.php';
require_once __DIR__ . '/../src/response.php';
require_once __DIR__ . '/../src/suppliers.php';
require_once __DIR__ . '/../src/meals.php';
require_once __DIR__ . '/../src/weekly-menus.php';
require_once __DIR__ . '/../src/orders.php';
require_once __DIR__ . '/../src/customers.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$route = $_GET['route'] ?? '';


// ------------------------------------------------------------------------------
// GET /suppliers/all
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'suppliers/all') {
  jsonResponse([
    'data' => getAllSuppliers()
  ]);
}


// ------------------------------------------------------------------------------
// GET /suppliers/search?q=...
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'suppliers/search') {
  $q = $_GET['q'] ?? '';

  jsonResponse([
    'data' => searchSuppliers($q)
  ]);
}


// ------------------------------------------------------------------------------
// GET /meals
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'meals') {
  jsonResponse([
    'data' => getAllMeals()
  ]);
}


// ------------------------------------------------------------------------------
// GET /weekly-menus
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'weekly-menus') {
  jsonResponse([
    'data' => getAllWeeklyMenus()
  ]);
}


// ------------------------------------------------------------------------------
// POST /meals
// ------------------------------------------------------------------------------

if ($method === 'POST' && $route === 'meals') {
  try {
    $raw = file_get_contents('php://input');
    error_log('POST raw body: ' . $raw);

    $data = json_decode($raw, true);

    if (!is_array($data)) {
      jsonResponse([
        'error' => 'Invalid JSON',
        'json_error' => json_last_error_msg()
      ], 400);
    }

    $meal = createMeal($data);

    jsonResponse([
      'data' => $meal
    ], 201);
  } catch (InvalidArgumentException $e) {
    jsonResponse([
      'error' => $e->getMessage()
    ], 422);
  } catch (Throwable $e) {
    jsonResponse([
      'error' => $e->getMessage()
    ], 500);
  }
}


// ------------------------------------------------------------------------------
// PUT /meals/{id}
// ------------------------------------------------------------------------------

if ($method === 'PUT' && preg_match('#^meals/([0-9a-f\-]+)$#', $route, $matches)) {
  $id = $matches[1];

  try {
    $raw = file_get_contents('php://input');
    error_log('PUT raw body: ' . $raw);

    $data = json_decode($raw, true);

    if (!is_array($data)) {
      jsonResponse([
        'error' => 'Invalid JSON',
        'json_error' => json_last_error_msg()
      ], 400);
    }

    $meal = updateMeal($id, $data);

    if ($meal === null) {
      jsonResponse([
        'error' => 'Meal not found'
      ], 404);
    }

    jsonResponse([
      'data' => $meal
    ]);
  } catch (InvalidArgumentException $e) {
    jsonResponse([
      'error' => $e->getMessage()
    ], 422);
  } catch (Throwable $e) {
    jsonResponse([
      'error' => $e->getMessage()
    ], 500);
  }
}


// ------------------------------------------------------------------------------
// DELETE /meals/{id}
// ------------------------------------------------------------------------------

if ($method === 'DELETE' && preg_match('#^meals/([0-9a-f\-]+)$#', $route, $matches)) {
  $id = $matches[1];

  try {
    $deleted = deleteMeal($id);

    if (!$deleted) {
      jsonResponse([
        'error' => 'Meal not found'
      ], 404);
    }

    jsonResponse([], 204);
  } catch (Throwable $e) {
    jsonResponse([
      'error' => $e->getMessage()
    ], 500);
  }
}

// ------------------------------------------------------------------------------
// GET /weekly-menus
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'weekly-menus') {
    jsonResponse([
        'data' => getAllWeeklyMenus()
    ]);
}


// ------------------------------------------------------------------------------
// GET /weekly-menus/upcoming
// ------------------------------------------------------------------------------

if ($method === 'GET' && $route === 'weekly-menus/upcoming') {
    jsonResponse([
        'data' => getUpcomingWeeklyMenus()
    ]);
}


// ------------------------------------------------------------------------------
// GET /weekly-menus/{id}
// ------------------------------------------------------------------------------

if ($method === 'GET' && preg_match('#^weekly-menus/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $weeklyMenu = getWeeklyMenuById($id);

        if ($weeklyMenu === null) {
            jsonResponse([
                'error' => 'Weekly menu not found'
            ], 404);
        }

        jsonResponse([
            'data' => $weeklyMenu
        ]);
    } catch (Throwable $e) {
        jsonResponse([
            'error' => $e->getMessage()
        ], 500);
    }
}


// ------------------------------------------------------------------------------
// POST /weekly-menus
// ------------------------------------------------------------------------------

if ($method === 'POST' && $route === 'weekly-menus') {
    try {
        $raw = file_get_contents('php://input');
        error_log('POST weekly-menus raw body: ' . $raw);

        $data = json_decode($raw, true);

        if (!is_array($data)) {
            jsonResponse([
                'error' => 'Invalid JSON',
                'json_error' => json_last_error_msg()
            ], 400);
        }

        $weeklyMenu = createWeeklyMenu($data);

        jsonResponse([
            'data' => $weeklyMenu
        ], 201);
    } catch (InvalidArgumentException $e) {
        jsonResponse([
            'error' => $e->getMessage()
        ], 422);
    } catch (Throwable $e) {
        jsonResponse([
            'error' => $e->getMessage()
        ], 500);
    }
}


// ------------------------------------------------------------------------------
// PUT /weekly-menus/{id}
// ------------------------------------------------------------------------------

if ($method === 'PUT' && preg_match('#^weekly-menus/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $raw = file_get_contents('php://input');
        error_log('PUT weekly-menus raw body: ' . $raw);

        $data = json_decode($raw, true);

        if (!is_array($data)) {
            jsonResponse([
                'error' => 'Invalid JSON',
                'json_error' => json_last_error_msg()
            ], 400);
        }

        $weeklyMenu = updateWeeklyMenu($id, $data);

        if ($weeklyMenu === null) {
            jsonResponse([
                'error' => 'Weekly menu not found'
            ], 404);
        }

        jsonResponse([
            'data' => $weeklyMenu
        ]);
    } catch (InvalidArgumentException $e) {
        jsonResponse([
            'error' => $e->getMessage()
        ], 422);
    } catch (Throwable $e) {
        jsonResponse([
            'error' => $e->getMessage()
        ], 500);
    }
}


// ------------------------------------------------------------------------------
// DELETE /weekly-menus/{id}
// ------------------------------------------------------------------------------

if ($method === 'DELETE' && preg_match('#^weekly-menus/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $deleted = deleteWeeklyMenu($id);

        if (!$deleted) {
            jsonResponse([
                'error' => 'Weekly menu not found'
            ], 404);
        }

        jsonResponse([], 204);
    } catch (Throwable $e) {
        jsonResponse([
            'error' => $e->getMessage()
        ], 500);
    }
}

// GET /orders
if ($method === 'GET' && $route === 'orders') {
    jsonResponse([
        'data' => getAllOrders()
    ]);
}

// GET /orders/{id}
if ($method === 'GET' && preg_match('#^orders/([0-9a-f\-]+)$#', $route, $matches)) {
    $id = $matches[1];

    try {
        $order = getOrderById($id);

        if ($order === null) {
            jsonResponse(['error' => 'Order not found'], 404);
        }

        jsonResponse(['data' => $order]);
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

// POST /orders
if ($method === 'POST' && $route === 'orders') {
    try {
        $raw  = file_get_contents('php://input');
        $data = json_decode($raw, true);

        if (!is_array($data)) {
            jsonResponse([
                'error'      => 'Invalid JSON',
                'json_error' => json_last_error_msg()
            ], 400);
        }

        $order = createOrder($data);

        jsonResponse(['data' => $order], 201);
    } catch (InvalidArgumentException $e) {
        jsonResponse(['error' => $e->getMessage()], 422);
    } catch (Throwable $e) {
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}

// ------------------------------------------------------------------------------
// Fallback
// ------------------------------------------------------------------------------

jsonResponse([
  'error' => 'Route not found'
], 404);
