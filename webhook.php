<?php
$secret = 'shelter_webhook_secret_2026';
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$payload = file_get_contents('php://input');

if (!hash_equals('sha256=' . hash_hmac('sha256', $payload, $secret), $signature)) {
    http_response_code(403);
    exit('Invalid signature');
}

$data = json_decode($payload, true);
if ($data['ref'] === 'refs/heads/main') {
    shell_exec('cd /www/wwwroot/shelter && git fetch origin main && git merge origin/main --ff-only >> /var/log/shelter-pull.log 2>&1 &');
    echo 'Pull triggered';
} else {
    echo 'Not main branch';
}
