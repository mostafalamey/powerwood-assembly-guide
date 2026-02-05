<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$catalog = [
    [
        'id' => 'text',
        'name' => 'Text',
        'filename' => '',
        'type' => 'text'
    ]
];

// On Hostinger, static export places public/ contents directly in public_html/
// So models/ is at public_html/models/, not public_html/public/models/
$annotationsDir = __DIR__ . '/../models/annotations';

if (is_dir($annotationsDir)) {
    $files = scandir($annotationsDir);
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'glb') {
            $id = pathinfo($file, PATHINFO_FILENAME);
            $name = ucwords(str_replace(['_', '-'], ' ', $id));
            $thumbnail = file_exists($annotationsDir . '/' . $id . '.png') ? "/models/annotations/$id.png" : null;

            $catalog[] = [
                'id' => $id,
                'name' => $name,
                'filename' => $file,
                'type' => 'glb',
                'thumbnail' => $thumbnail
            ];
        }
    }
}

echo json_encode($catalog);
?>