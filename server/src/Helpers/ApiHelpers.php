<?php

declare(strict_types=1);
/**
 * Author: Gecko Web
 * Date: 08/07/2023
 * Time: 19:18
 */
function responseJson(string $message, int $code, array $data = [])
{
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode([
        'code' => $code,
        'message' => $message,
        'data' => $data,
    ]);
    exit;
}