<?php
require_once __DIR__ . '/config.php';

verifyAuth();

// POST /api/upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $targetDir = $_POST['targetDir'] ?? 'uploads';
    $filename = $_POST['filename'] ?? null;
    
    if (empty($_FILES['file'])) {
        sendError('No file uploaded', 400);
    }
    
    $file = $_FILES['file'];
    
    // Use provided filename or original name
    $uploadFilename = $filename ?? basename($file['name']);
    
    // Create target directory
    $fullTargetDir = UPLOAD_DIR . '/' . $targetDir;
    if (!is_dir($fullTargetDir)) {
        mkdir($fullTargetDir, 0755, true);
    }
    
    $targetPath = $fullTargetDir . '/' . $uploadFilename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $url = '/' . $targetDir . '/' . $uploadFilename;
        sendJSON([
            'url' => $url,
            'filename' => $uploadFilename
        ]);
    } else {
        sendError('Failed to upload file', 500);
    }
}

sendError('Method not allowed', 405);
