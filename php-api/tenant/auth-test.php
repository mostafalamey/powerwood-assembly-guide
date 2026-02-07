<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Show all auth-related info
$debug = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET',
    'REDIRECT_HTTP_AUTHORIZATION' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'NOT SET',
    'getallheaders_exists' => function_exists('getallheaders'),
    'apache_request_headers_exists' => function_exists('apache_request_headers'),
];

if (function_exists('getallheaders')) {
    $debug['getallheaders_result'] = getallheaders();
}

if (function_exists('apache_request_headers')) {
    $debug['apache_request_headers_result'] = apache_request_headers();
}

// Show all server vars starting with HTTP_
$debug['all_http_vars'] = [];
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0 || strpos($key, 'AUTH') !== false) {
        $debug['all_http_vars'][$key] = $value;
    }
}

echo json_encode($debug, JSON_PRETTY_PRINT);
