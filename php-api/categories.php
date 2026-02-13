<?php
// Standalone categories endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

function sendError($message, $statusCode = 400) {
    sendJSON(['error' => $message], $statusCode);
}

function verifyAuth() {
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('Unauthorized', 401);
    }
    $token = $matches[1];
    if (empty($token) || strlen($token) < 10) {
        sendError('Unauthorized', 401);
    }
    return $token;
}

function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true);
}

function resolveCategoriesFile() {
    $documentRoot = isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : '';
    $projectRoot = realpath(__DIR__ . '/..');

    $candidates = array(
        $projectRoot ? $projectRoot . '/data/categories.json' : null,
        $documentRoot ? $documentRoot . '/data/categories.json' : null,
        $documentRoot ? $documentRoot . '/public/data/categories.json' : null,
        __DIR__ . '/data/categories.json',
    );

    foreach ($candidates as $candidate) {
        if ($candidate && file_exists($candidate)) {
            return $candidate;
        }
    }

    return $candidates[0] ? $candidates[0] : '';
}

function readJSON($filepath) {
    if (!$filepath || !file_exists($filepath)) {
        return null;
    }
    $content = file_get_contents($filepath);
    if ($content === false) {
        return null;
    }
    $decoded = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    return $decoded;
}

function writeJSON($filepath, $data) {
    $dir = dirname($filepath);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    return file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// GET /api/categories
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $categoriesFile = resolveCategoriesFile();
    $categories = readJSON($categoriesFile);
    if (!$categories) {
        sendJSON(array('categories' => array()));
    }
    sendJSON($categories);
}

// POST /api/categories (create new category)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyAuth();
    $body = getRequestBody();

    if (!is_array($body)) {
        sendError('Invalid request body', 400);
    }
    
    // Validate required fields
    if (empty($body['id']) || empty($body['name']) || empty($body['nameAr'])) {
        sendError('Missing required fields: id, name, nameAr', 400);
    }
    
    $categoriesFile = resolveCategoriesFile();
    $data = readJSON($categoriesFile);
    
    if (!$data) {
        $data = ['categories' => []];
    }
    
    // Check for duplicate ID
    foreach ($data['categories'] as $category) {
        if ($category['id'] === $body['id']) {
            sendError('Category with ID ' . $body['id'] . ' already exists', 409);
        }
    }
    
    // Add new category
    $newCategory = [
        'id' => $body['id'],
        'name' => $body['name'],
        'nameAr' => $body['nameAr'],
        'description' => isset($body['description']) ? $body['description'] : '',
        'descriptionAr' => isset($body['descriptionAr']) ? $body['descriptionAr'] : '',
        'icon' => isset($body['icon']) ? $body['icon'] : ''
    ];
    
    $data['categories'][] = $newCategory;
    
    if (!writeJSON($categoriesFile, $data)) {
        sendError('Failed to write categories file', 500);
    }
    
    sendJSON($newCategory, 201);
}

// PUT /api/categories (update category)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    verifyAuth();
    $body = getRequestBody();
    
    if (!is_array($body) || !isset($body['id'])) {
        sendError('Invalid request body', 400);
    }
    
    $categoriesFile = resolveCategoriesFile();
    $data = readJSON($categoriesFile);
    
    if (!$data || !isset($data['categories'])) {
        sendError('Categories file not found', 404);
    }
    
    $found = false;
    foreach ($data['categories'] as &$category) {
        if ($category['id'] === $body['id']) {
            $category['name'] = $body['name'];
            $category['nameAr'] = $body['nameAr'];
            $category['description'] = isset($body['description']) ? $body['description'] : '';
            $category['descriptionAr'] = isset($body['descriptionAr']) ? $body['descriptionAr'] : '';
            if (isset($body['icon'])) {
                $category['icon'] = $body['icon'];
            }
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        sendError('Category not found', 404);
    }
    
    if (!writeJSON($categoriesFile, $data)) {
        sendError('Failed to write categories file', 500);
    }
    
    sendJSON(['success' => true]);
}

// DELETE /api/categories
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    verifyAuth();
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        sendError('Category ID required', 400);
    }
    
    $categoriesFile = resolveCategoriesFile();
    $data = readJSON($categoriesFile);
    
    if (!$data || !isset($data['categories'])) {
        sendError('Categories file not found', 404);
    }
    
    $data['categories'] = array_filter($data['categories'], function($category) use ($id) {
        return $category['id'] !== $id;
    });
    
    $data['categories'] = array_values($data['categories']);
    
    if (!writeJSON($categoriesFile, $data)) {
        sendError('Failed to write categories file', 500);
    }
    
    sendJSON(['success' => true]);
}

sendJSON(array('error' => 'Method not allowed'), 405);

