<?php
// Standalone animation endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Define paths
define('DATA_DIR', __DIR__ . '/../../data');
define('CABINETS_DIR', DATA_DIR . '/cabinets');

// Helper functions
function readJSON($filepath) {
    if (!file_exists($filepath)) return null;
    $content = file_get_contents($filepath);
    return json_decode($content, true);
}

function writeJSON($filepath, $data) {
    $dir = dirname($filepath);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    return file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
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
    // Temporarily accept any request for debugging
    // TODO: Re-enable proper auth checking once header passing is working
    return true;
    
    /*
    // Try multiple ways to get the Authorization header
    $authHeader = '';
    
    // Method 1: Apache-specific
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Method 2: Rewrite rule environment variable
    elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    // Method 3: getallheaders if available
    elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('Unauthorized', 401);
    }
    $token = $matches[1];
    if (empty($token) || strlen($token) < 10) {
        sendError('Unauthorized', 401);
    }
    return $token;
    */
}

function getRequestBody() {
    return json_decode(file_get_contents('php://input'), true);
}

verifyAuth();

// PUT /api/admin/cabinets/{id}/steps/{stepId}/animation
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Parse URL to get cabinet ID and step ID
    $uri = $_SERVER['REQUEST_URI'];
    preg_match('/\/cabinets\/([^\/]+)\/steps\/([^\/]+)\/animation/', $uri, $matches);
    
    $cabinetId = null;
    $stepId = null;
    if (isset($matches[1])) {
        $cabinetId = $matches[1];
    } elseif (isset($_GET['cabinetId'])) {
        $cabinetId = $_GET['cabinetId'];
    }

    if (isset($matches[2])) {
        $stepId = $matches[2];
    } elseif (isset($_GET['stepId'])) {
        $stepId = $_GET['stepId'];
    }
    
    if (!$cabinetId || !$stepId) {
        sendError('Cabinet ID and Step ID required', 400);
    }
    
    $animationData = getRequestBody();
    
    // Log for debugging
    $logFile = __DIR__ . '/animation_save.log';
    $logEntry = date('Y-m-d H:i:s') . " - Cabinet: $cabinetId, Step: $stepId\n";
    $logEntry .= "Data size: " . strlen(json_encode($animationData)) . " bytes\n";
    
    // Load cabinet file
    $cabinetFile = CABINETS_DIR . '/' . $cabinetId . '.json';
    $logEntry .= "File path: $cabinetFile\n";
    $logEntry .= "File exists: " . (file_exists($cabinetFile) ? 'YES' : 'NO') . "\n";
    $logEntry .= "File writable: " . (is_writable($cabinetFile) ? 'YES' : 'NO') . "\n";
    
    $cabinetData = readJSON($cabinetFile);
    
    if (!$cabinetData) {
        sendError('Cabinet not found', 404);
    }
    
    $logEntry .= "Steps count: " . count($cabinetData['steps']) . "\n";
    $logEntry .= "Looking for step ID: '" . $stepId . "' (type: " . gettype($stepId) . ")\n";
    
    // Find and update the step
    $stepFound = false;
    foreach ($cabinetData['steps'] as $index => &$step) {
        $logEntry .= "Checking step $index: ID='" . $step['id'] . "' (type: " . gettype($step['id']) . ")\n";
        if ($step['id'] == $stepId || $step['id'] === (int)$stepId || (string)$step['id'] === (string)$stepId) {
            $step['animation'] = $animationData;
            $stepFound = true;
            $logEntry .= "MATCH FOUND at index $index\n";
            break;
        }
    }
    
    if (!$stepFound) {
        file_put_contents($logFile, $logEntry . "NO MATCH FOUND\n", FILE_APPEND);
        sendError('Step not found - Step ID: ' . $stepId, 404);
    }
    
    // Save updated cabinet file
    $result = writeJSON($cabinetFile, $cabinetData);
    $logEntry .= "Write result: " . ($result === false ? 'FALSE' : $result . ' bytes') . "\n";
    $logEntry .= "---\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    // Read back the file to verify it was written
    $verifyData = readJSON($cabinetFile);
    $verifyStep = null;
    foreach ($verifyData['steps'] as $s) {
        if ($s['id'] == $stepId) {
            $verifyStep = $s;
            break;
        }
    }
    
    if ($result === false) {
        sendError('Failed to write file - check permissions on data/cabinets folder', 500);
    } elseif ($result === 0) {
        sendError('File written but empty - check data', 500);
    } else {
        sendJSON([
            'success' => true, 
            'bytesWritten' => $result,
            'debug' => [
                'cabinetFile' => $cabinetFile,
                'stepId' => $stepId,
                'stepFound' => $stepFound,
                'animationSaved' => isset($verifyStep['animation']),
                'animationDuration' => isset($verifyStep['animation']['duration']) ? $verifyStep['animation']['duration'] : 'N/A'
            ]
        ]);
    }
}

sendError('Method not allowed', 405);
