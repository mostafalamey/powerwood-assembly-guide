<?php
// Simple auth endpoint without dependencies
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if this is validate request (by checking URL)
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (strpos($requestUri, 'validate') !== false) {
    // Always return valid for validate endpoint
    http_response_code(200);
    echo json_encode(['valid' => true]);
    exit;
}

// POST /api/auth/login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $password = $body['password'] ?? '';
    
    // Verify password
    if ($password === 'admin123') {
        $token = bin2hex(random_bytes(32));
        http_response_code(200);
        echo json_encode([
            'token' => $token,
            'expiresAt' => time() + (24 * 60 * 60) // 24 hours
        ]);
        exit;
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;
