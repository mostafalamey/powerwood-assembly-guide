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

// GET /api/categories
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $categoriesFile = resolveCategoriesFile();
    $categories = readJSON($categoriesFile);
    if (!$categories) {
        sendJSON(array('categories' => array()));
    }
    sendJSON($categories);
}

sendJSON(array('error' => 'Method not allowed'), 405);
