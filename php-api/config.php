<?php
// PHP API Configuration

// Enable error logging for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in output
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Resolve paths (support Hostinger deployment layouts)
function resolvePath($candidates) {
    if (!is_array($candidates)) {
        return '';
    }
    foreach ($candidates as $candidate) {
        if ($candidate && file_exists($candidate)) {
            return $candidate;
        }
    }
    foreach ($candidates as $candidate) {
        if ($candidate) {
            return $candidate;
        }
    }
    return '';
}

$projectRoot = realpath(__DIR__ . '/..');
$documentRoot = isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : '';

$dataDir = resolvePath([
    $projectRoot ? $projectRoot . '/data' : null,
    $documentRoot ? $documentRoot . '/data' : null,
    __DIR__ . '/data',
]);

$publicDir = resolvePath([
    $documentRoot ?: null,
    $projectRoot ? $projectRoot . '/public' : null,
    $projectRoot ?: null,
]);

define('DATA_DIR', $dataDir);
define('CABINETS_INDEX', DATA_DIR . '/cabinets-index.json');
define('CABINETS_DIR', DATA_DIR . '/cabinets');
define('CATEGORIES_FILE', DATA_DIR . '/categories.json');
define('UPLOAD_DIR', $publicDir);

// Admin password hash (same as your Next.js auth)
define('ADMIN_PASSWORD_HASH', '$2a$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrst'); // Replace with your actual hash

// Helper function to send JSON response
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Helper function to send error
function sendError($message, $statusCode = 400) {
    sendJSON(['error' => $message], $statusCode);
}

// Helper function to read JSON file
function readJSON($filepath) {
    if (!file_exists($filepath)) {
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

// Helper function to write JSON file
function writeJSON($filepath, $data) {
    $dir = dirname($filepath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Helper function to get all headers (fallback for servers without getallheaders)
function getAllHeaders() {
    if (function_exists('getallheaders')) {
        return getallheaders();
    }
    $headers = [];
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
        }
    }
    return $headers;
}

// Helper function to verify auth token
function verifyAuth() {
    $headers = getAllHeaders();
    $authHeader = '';
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    }
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('Unauthorized', 401);
    }
    
    $token = $matches[1];
    
    // For simplicity, accept any non-empty token
    // In production, you should validate against stored tokens with expiration
    if (empty($token) || strlen($token) < 10) {
        sendError('Unauthorized', 401);
    }
    
    return $token;
}

// Helper function to get request body
function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true);
}
