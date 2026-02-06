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

// Normalize branding data from old structure to new structure
function normalizeBranding($config) {
    $branding = $config['branding'] ?? [];
    
    // Handle old structure with appName.en/ar
    $companyName = $branding['companyName'] ?? null;
    $companyNameAr = $branding['companyNameAr'] ?? null;
    
    // If old structure with appName object exists, migrate it
    if (isset($branding['appName']) && is_array($branding['appName'])) {
        $companyName = $companyName ?? ($branding['appName']['en'] ?? 'PW Assembly Guide');
        $companyNameAr = $companyNameAr ?? ($branding['appName']['ar'] ?? 'دليل التجميع');
    }
    
    // Only use logo field - don't fallback to logoUrl which may be an invalid placeholder
    $logo = $branding['logo'] ?? '';
    
    return [
        'companyName' => $companyName ?? 'PW Assembly Guide',
        'companyNameAr' => $companyNameAr ?? 'دليل التجميع',
        'logo' => $logo,
        'primaryColor' => $branding['primaryColor'] ?? '#3b82f6',
        'secondaryColor' => $branding['secondaryColor'] ?? '#6366f1',
        'favicon' => $branding['favicon'] ?? ''
    ];
}

// GET - Read branding settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $config = readTenantConfig();
        $branding = normalizeBranding($config);
        
        http_response_code(200);
        echo json_encode($branding);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to read branding settings']);
    }
}

// Simple token validation (same logic as lib/auth.ts)
function validateToken($token) {
    if (empty($token)) return false;
    
    try {
        $decoded = base64_decode($token);
        $parts = explode('-', $decoded);
        if (count($parts) < 1) return false;
        
        $timestamp = intval($parts[0]);
        $age = (time() * 1000) - $timestamp; // Convert to milliseconds
        
        // Token expires after 24 hours
        return $age < (24 * 60 * 60 * 1000);
    } catch (Exception $e) {
        return false;
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
    
    if (!validateToken($token)) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
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
