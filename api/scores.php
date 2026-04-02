<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return top 20 scores
    $stmt = $db->prepare('SELECT name, score, wave FROM high_scores ORDER BY score DESC LIMIT 20');
    $stmt->execute();
    $result = $stmt->get_result();
    $scores = [];
    while ($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }
    echo json_encode($scores);

} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $name = trim($input['name'] ?? '');
    $score = intval($input['score'] ?? 0);
    $wave = intval($input['wave'] ?? 1);

    // Validate
    if ($name === '' || strlen($name) > 10) {
        http_response_code(400);
        echo json_encode(['error' => 'Name must be 1-10 characters']);
        exit;
    }
    if ($score < 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid score']);
        exit;
    }

    // Only allow alphanumeric and spaces
    if (!preg_match('/^[A-Za-z0-9 ]+$/', $name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Name must be alphanumeric']);
        exit;
    }

    // Insert or update if new score is higher
    $stmt = $db->prepare(
        'INSERT INTO high_scores (name, score, wave) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE score = IF(VALUES(score) > score, VALUES(score), score),
                                  wave = IF(VALUES(score) > score, VALUES(wave), wave)'
    );
    $stmt->bind_param('sii', $name, $score, $wave);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save score']);
    }

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$db->close();
