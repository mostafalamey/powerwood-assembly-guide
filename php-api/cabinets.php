<?php
// Standalone cabinets endpoint
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
define('DATA_DIR', __DIR__ . '/../data');
define('CABINETS_INDEX', DATA_DIR . '/cabinets-index.json');
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
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
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

// GET /api/cabinets
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        // Get single cabinet
        $indexData = readJSON(CABINETS_INDEX);
        $index = $indexData['cabinets'] ?? $indexData ?? [];
        $cabinetMeta = null;
        
        foreach ($index as $cabinet) {
            if ($cabinet['id'] === $id) {
                $cabinetMeta = $cabinet;
                break;
            }
        }
        
        if (!$cabinetMeta) {
            sendError('Cabinet not found', 404);
        }
        
        // Load steps from individual file
        $cabinetFile = CABINETS_DIR . '/' . $id . '.json';
        $cabinetData = readJSON($cabinetFile);
        
        // Merge metadata with steps
        $result = array_merge($cabinetMeta, [
            'steps' => $cabinetData['steps'] ?? []
        ]);
        
        sendJSON($result);
    } else {
        // Get all cabinets (index only)
        $indexData = readJSON(CABINETS_INDEX);
        $cabinets = $indexData['cabinets'] ?? $indexData ?? [];
        sendJSON($cabinets);
    }
}

// POST /api/cabinets (create new cabinet)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyAuth();
    $body = getRequestBody();
    
    $indexData = readJSON(CABINETS_INDEX) ?? ['cabinets' => []];
    $index = $indexData['cabinets'] ?? [];
    
    // Add to index (metadata only)
    $newCabinet = [
        'id' => $body['id'],
        'name' => $body['name'],
        'description' => $body['description'],
        'category' => $body['category'],
        'image' => $body['image'] ?? '',
        'model' => $body['model'] ?? '',
        'stepCount' => 0
    ];
    
    $index[] = $newCabinet;
    writeJSON(CABINETS_INDEX, ['cabinets' => $index]);
    
    // Create empty cabinet file
    $cabinetFile = CABINETS_DIR . '/' . $body['id'] . '.json';
    writeJSON($cabinetFile, ['steps' => []]);
    
    sendJSON($newCabinet, 201);
}

// PUT /api/cabinets (update cabinet)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    verifyAuth();
    $body = getRequestBody();
    $id = $body['id'];
    
    // Update index
    $indexData = readJSON(CABINETS_INDEX) ?? ['cabinets' => []];
    $index = $indexData['cabinets'] ?? [];
    $found = false;
    
    foreach ($index as &$cabinet) {
        if ($cabinet['id'] === $id) {
            $cabinet['name'] = $body['name'];
            $cabinet['description'] = $body['description'];
            $cabinet['category'] = $body['category'];
            $cabinet['image'] = $body['image'] ?? $cabinet['image'];
            $cabinet['model'] = $body['model'] ?? $cabinet['model'];
            
            // Update stepCount if steps provided
            if (isset($body['steps'])) {
                $cabinet['stepCount'] = count($body['steps']);
                
                // Update cabinet file with steps
                $cabinetFile = CABINETS_DIR . '/' . $id . '.json';
                writeJSON($cabinetFile, ['steps' => $body['steps']]);
            }
            
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        sendError('Cabinet not found', 404);
    }
    
    writeJSON(CABINETS_INDEX, ['cabinets' => $index]);
    sendJSON(['success' => true]);
}

// DELETE /api/cabinets
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    verifyAuth();
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        sendError('Cabinet ID required', 400);
    }
    
    // Remove from index
    $indexData = readJSON(CABINETS_INDEX) ?? ['cabinets' => []];
    $index = $indexData['cabinets'] ?? [];
    $index = array_filter($index, function($cabinet) use ($id) {
        return $cabinet['id'] !== $id;
    });
    
    writeJSON(CABINETS_INDEX, ['cabinets' => array_values($index)]);
    
    // Delete cabinet file
    $cabinetFile = CABINETS_DIR . '/' . $id . '.json';
    if (file_exists($cabinetFile)) {
        unlink($cabinetFile);
    }
    
    sendJSON(['success' => true]);
}

sendError('Method not allowed', 405);
