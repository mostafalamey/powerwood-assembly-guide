<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$TENANT_CONFIG_PATH = __DIR__ . '/../config/tenant.json';

// Ensure config directory exists
function ensureConfigDir() {
    global $TENANT_CONFIG_PATH;
    $configDir = dirname($TENANT_CONFIG_PATH);
    if (!file_exists($configDir)) {
        mkdir($configDir, 0755, true);
    }
}

// Read tenant config
function readTenantConfig() {
    global $TENANT_CONFIG_PATH;
    ensureConfigDir();
    
    if (!file_exists($TENANT_CONFIG_PATH)) {
        // Create default config
        $defaultConfig = [
            'branding' => [
                'companyName' => 'PW Assembly',
                'companyNameAr' => 'دليل التجميع',
                'logo' => '',
                'primaryColor' => '#3b82f6',
                'secondaryColor' => '#6366f1',
                'favicon' => ''
            ],
            'categories' => []
        ];
        file_put_contents($TENANT_CONFIG_PATH, json_encode($defaultConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $defaultConfig;
    }
    
    $content = file_get_contents($TENANT_CONFIG_PATH);
    return json_decode($content, true);
}

// Write tenant config
function writeTenantConfig($config) {
    global $TENANT_CONFIG_PATH;
    ensureConfigDir();
    file_put_contents($TENANT_CONFIG_PATH, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// GET - Read branding settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $config = readTenantConfig();
        $branding = $config['branding'] ?? [
            'companyName' => 'PW Assembly',
            'companyNameAr' => 'دليل التجميع',
            'logo' => '',
            'primaryColor' => '#3b82f6',
            'secondaryColor' => '#6366f1',
            'favicon' => ''
        ];
        
        http_response_code(200);
        echo json_encode($branding);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to read branding settings']);
    }
}

// PUT - Update branding settings
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Verify authentication
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }
    
    $token = substr($authHeader, 7);
    $adminToken = getenv('ADMIN_TOKEN') ?: 'admin123';
    
    if ($token !== $adminToken) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    try {
        $input = file_get_contents('php://input');
        $branding = json_decode($input, true);
        
        // Validation
        if (empty($branding['companyName']) || empty($branding['companyNameAr'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Company name is required in both languages']);
            exit;
        }
        
        // Read current config
        $config = readTenantConfig();
        
        // Update branding
        $config['branding'] = [
            'companyName' => $branding['companyName'],
            'companyNameAr' => $branding['companyNameAr'],
            'logo' => $branding['logo'] ?? '',
            'primaryColor' => $branding['primaryColor'] ?? '#3b82f6',
            'secondaryColor' => $branding['secondaryColor'] ?? '#6366f1',
            'favicon' => $branding['favicon'] ?? ''
        ];
        
        // Write updated config
        writeTenantConfig($config);
        
        http_response_code(200);
        echo json_encode($config['branding']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update branding settings']);
    }
}

else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
