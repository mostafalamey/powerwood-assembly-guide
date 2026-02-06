<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$configPath = __DIR__ . '/../../config/tenant.json';

// GET - Read branding
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($configPath)) {
        echo json_encode([
            'companyName' => 'PW Assembly Guide',
            'companyNameAr' => 'دليل التجميع',
            'logo' => '',
            'primaryColor' => '#3b82f6',
            'secondaryColor' => '#6366f1',
            'favicon' => ''
        ]);
        exit;
    }
    
    $content = file_get_contents($configPath);
    $config = json_decode($content, true);
    
    if (!$config || !isset($config['branding'])) {
        echo json_encode([
            'companyName' => 'PW Assembly Guide',
            'companyNameAr' => 'دليل التجميع',
            'logo' => '',
            'primaryColor' => '#3b82f6',
            'secondaryColor' => '#6366f1',
            'favicon' => ''
        ]);
        exit;
    }
    
    $b = $config['branding'];
    echo json_encode([
        'companyName' => $b['companyName'] ?? 'PW Assembly Guide',
        'companyNameAr' => $b['companyNameAr'] ?? 'دليل التجميع',
        'logo' => $b['logo'] ?? '',
        'primaryColor' => $b['primaryColor'] ?? '#3b82f6',
        'secondaryColor' => $b['secondaryColor'] ?? '#6366f1',
        'favicon' => $b['favicon'] ?? ''
    ]);
    exit;
}

// PUT - Update branding
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get auth header - try multiple methods
    $authHeader = '';
    
    // Method 1: Standard
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Method 2: After redirect
    if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    // Method 3: getallheaders
    if (!$authHeader && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }
    }
    // Method 4: apache_request_headers (alias)
    if (!$authHeader && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $authHeader = $value;
                break;
            }
        }
    }
    
    if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode([
            'error' => 'No token provided',
            'debug' => [
                'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'not set',
                'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'not set',
                'getallheaders' => function_exists('getallheaders') ? 'available' : 'not available'
            ]
        ]);
        exit;
    }
    
    $token = substr($authHeader, 7);
    
    // Validate token - just check it's not empty
    // (auth.php generates random tokens, not timestamp-based)
    if (empty($token) || strlen($token) < 10) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Read input
    $input = file_get_contents('php://input');
    $branding = json_decode($input, true);
    
    if (!$branding || empty($branding['companyName']) || empty($branding['companyNameAr'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Company name required in both languages']);
        exit;
    }
    
    // Read existing config or create new
    $config = [];
    if (file_exists($configPath)) {
        $content = file_get_contents($configPath);
        $config = json_decode($content, true) ?: [];
    }
    
    // Update branding
    $config['branding'] = [
        'companyName' => $branding['companyName'],
        'companyNameAr' => $branding['companyNameAr'],
        'logo' => $branding['logo'] ?? '',
        'primaryColor' => $branding['primaryColor'] ?? '#3b82f6',
        'secondaryColor' => $branding['secondaryColor'] ?? '#6366f1',
        'favicon' => $branding['favicon'] ?? ''
    ];
    
    // Ensure config directory exists
    $configDir = dirname($configPath);
    if (!is_dir($configDir)) {
        mkdir($configDir, 0755, true);
    }
    
    // Write config
    file_put_contents($configPath, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    echo json_encode($config['branding']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
