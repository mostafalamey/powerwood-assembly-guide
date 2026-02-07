<?php
// Standalone assemblies endpoint
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
define('ASSEMBLIES_INDEX', DATA_DIR . '/assemblies-index.json');
define('ASSEMBLIES_DIR', DATA_DIR . '/assemblies');

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

function normalizeAssembliesIndex($indexData) {
    if (!is_array($indexData)) {
        return [];
    }
    if (isset($indexData['assemblies']) && is_array($indexData['assemblies'])) {
        return $indexData['assemblies'];
    }
    return $indexData;
}

// GET /api/assemblies
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if ($id) {
        // Get single assembly
        $indexData = readJSON(ASSEMBLIES_INDEX);
        $index = normalizeAssembliesIndex($indexData);
        $assemblyMeta = null;
        
        foreach ($index as $assembly) {
            if ($assembly['id'] === $id) {
                $assemblyMeta = $assembly;
                break;
            }
        }
        
        if (!$assemblyMeta) {
            sendError('Assembly not found', 404);
        }
        
        // Load steps from individual file
        $assemblyFile = ASSEMBLIES_DIR . '/' . $id . '.json';
        $assemblyData = readJSON($assemblyFile);
        $steps = [];
        if (is_array($assemblyData) && isset($assemblyData['steps']) && is_array($assemblyData['steps'])) {
            $steps = $assemblyData['steps'];
        }
        
        // Merge metadata with steps
        $result = array_merge($assemblyMeta, [
            'steps' => $steps
        ]);
        
        sendJSON($result);
    } else {
        // Get all assemblies (index only)
        $indexData = readJSON(ASSEMBLIES_INDEX);
        $assemblies = normalizeAssembliesIndex($indexData);
        sendJSON($assemblies);
    }
}

// POST /api/assemblies (create new assembly)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyAuth();
    $body = getRequestBody();

    if (!is_array($body)) {
        sendError('Invalid request body', 400);
    }
    
    // Validate required fields
    if (empty($body['id']) || empty($body['name'])) {
        sendError('Missing required fields: id and name', 400);
    }
    
    $indexData = readJSON(ASSEMBLIES_INDEX);
    $index = normalizeAssembliesIndex($indexData);
    
    // Check for duplicate ID
    foreach ($index as $existingAssembly) {
        if ($existingAssembly['id'] === $body['id']) {
            sendError('Assembly with ID ' . $body['id'] . ' already exists', 409);
        }
    }
    
    // Add to index (metadata only)
    $newAssembly = [
        'id' => $body['id'],
        'name' => $body['name'],
        'description' => isset($body['description']) ? $body['description'] : ['en' => '', 'ar' => ''],
        'category' => $body['category'],
        'image' => isset($body['image']) ? $body['image'] : '',
        'model' => isset($body['model']) ? $body['model'] : '',
        'estimatedTime' => isset($body['estimatedTime']) ? $body['estimatedTime'] : 0,
        'stepCount' => 0
    ];
    
    $index[] = $newAssembly;
    
    // Write to index file
    if (!writeJSON(ASSEMBLIES_INDEX, ['assemblies' => $index])) {
        sendError('Failed to write assemblies index file', 500);
    }
    
    // Create assembly file with ID property
    $assemblyFile = ASSEMBLIES_DIR . '/' . $body['id'] . '.json';
    $assemblyData = [
        'id' => $body['id'],
        'steps' => []
    ];
    
    if (!writeJSON($assemblyFile, $assemblyData)) {
        sendError('Failed to create assembly file', 500);
    }
    
    sendJSON($newAssembly, 201);
}

// PUT /api/assemblies (update assembly)
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    verifyAuth();
    $body = getRequestBody();
    if (!is_array($body) || !isset($body['id'])) {
        sendError('Invalid request body', 400);
    }
    $id = $body['id'];
    
    // Update index
    $indexData = readJSON(ASSEMBLIES_INDEX);
    $index = normalizeAssembliesIndex($indexData);
    $found = false;
    
    foreach ($index as &$assembly) {
        if ($assembly['id'] === $id) {
            $assembly['name'] = $body['name'];
            $assembly['description'] = $body['description'];
            $assembly['category'] = $body['category'];
            if (isset($body['image'])) {
                $assembly['image'] = $body['image'];
            }
            if (isset($body['model'])) {
                $assembly['model'] = $body['model'];
            }
            
            // Update stepCount if steps provided
            if (isset($body['steps'])) {
                $assembly['stepCount'] = count($body['steps']);
                
                // Update assembly file with steps
                $assemblyFile = ASSEMBLIES_DIR . '/' . $id . '.json';
                writeJSON($assemblyFile, ['steps' => $body['steps']]);
            }
            
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        sendError('Assembly not found', 404);
    }
    
    writeJSON(ASSEMBLIES_INDEX, ['assemblies' => $index]);
    sendJSON(['success' => true]);
}

// DELETE /api/assemblies
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    verifyAuth();
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        sendError('Assembly ID required', 400);
    }
    
    // Remove from index
    $indexData = readJSON(ASSEMBLIES_INDEX);
    $index = normalizeAssembliesIndex($indexData);
    $index = array_filter($index, function($assembly) use ($id) {
        return $assembly['id'] !== $id;
    });
    
    writeJSON(ASSEMBLIES_INDEX, ['assemblies' => array_values($index)]);
    
    // Delete assembly file
    $assemblyFile = ASSEMBLIES_DIR . '/' . $id . '.json';
    if (file_exists($assemblyFile)) {
        unlink($assemblyFile);
    }
    
    sendJSON(['success' => true]);
}

sendError('Method not allowed', 405);
