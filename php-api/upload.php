<?php
require_once __DIR__ . '/config.php';

verifyAuth();

// POST /api/upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get directory from POST data (matches client FormData field name)
        $directory = $_POST['directory'] ?? 'uploads';
        $requestedFilename = $_POST['filename'] ?? null;
        
        if (empty($_FILES['file'])) {
            sendError('No file uploaded', 400);
        }
        
        $file = $_FILES['file'];
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'File upload stopped by extension',
            ];
            $errorMsg = $errorMessages[$file['error']] ?? 'Unknown upload error';
            sendError($errorMsg, 500);
        }
        
        // Generate filename
        $originalName = basename($file['name']);
        $originalExt = pathinfo($originalName, PATHINFO_EXTENSION);
        
        if ($requestedFilename) {
            $safeName = basename($requestedFilename);
            $hasExt = pathinfo($safeName, PATHINFO_EXTENSION) !== '';
            $uploadFilename = $hasExt ? $safeName : $safeName . '.' . $originalExt;
        } else {
            $baseName = pathinfo($originalName, PATHINFO_FILENAME);
            $timestamp = time();
            $uploadFilename = $baseName . '-' . $timestamp . '.' . $originalExt;
        }
        
        // Create target directory (in public folder)
        $fullTargetDir = UPLOAD_DIR . '/' . $directory;
        if (!is_dir($fullTargetDir)) {
            if (!mkdir($fullTargetDir, 0755, true)) {
                sendError('Failed to create directory: ' . $directory, 500);
            }
        }
        
        $targetPath = $fullTargetDir . '/' . $uploadFilename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            sendError('Failed to move uploaded file', 500);
        }
        
        // Return public path (matches Next.js API format)
        $publicPath = '/' . $directory . '/' . $uploadFilename;
        
        sendJSON([
            'message' => 'File uploaded successfully',
            'path' => $publicPath,
            'filename' => $uploadFilename
        ]);
        
    } catch (Exception $e) {
        error_log('Upload error: ' . $e->getMessage());
        sendError('Error uploading file: ' . $e->getMessage(), 500);
    }
}

sendError('Method not allowed', 405);
