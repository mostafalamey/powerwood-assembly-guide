<?php
require_once __DIR__ . '/config.php';

// GET /api/categories
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $categories = readJSON(CATEGORIES_FILE);
    sendJSON($categories ?? []);
}

sendError('Method not allowed', 405);
