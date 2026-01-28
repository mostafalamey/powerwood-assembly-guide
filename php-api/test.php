<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'ok',
    'phpVersion' => phpversion(),
    'serverSoftware' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'requestMethod' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
]);
