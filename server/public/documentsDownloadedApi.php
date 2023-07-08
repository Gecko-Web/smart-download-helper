<?php

use JBZoo\Utils\Arr;
use SmartDownloadHelper\ContractTable;

require_once __DIR__ . '/../bootstrap.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
$smartPaid = true;
$allowedOrigins = [
    'http://compte.smartfr.fr',
    'https://compte.smartfr.fr',
];

$http_origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if (!in_array($http_origin, $allowedOrigins)) {
    response('Access forbidden' . (is_null($http_origin) ? '' : ' from ' . $http_origin), 403);// FORBIDDEN
}

if ($smartPaid) {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $post_contractRef = $_POST['contractReference'] ?? null;
        $post_jsonContractFiles = $_POST['contractFiles'] ?? null;
        if (empty($post_contractRef)) {
            response('No contract reference provided', 400);// BAD REQUEST
        }
        if (empty($post_jsonContractFiles)) {
            response('No contract files provided', 400);// BAD REQUEST
        }
        $post_contractFiles = @json_decode($post_jsonContractFiles, 0b0001); // force array decode
        if (empty($post_contractFiles)) {
            response('Contract files is empty', 400);// BAD REQUEST
        }

        //arrange post_contractFiles array
        $clean_contractFiles = [];
        foreach ($post_contractFiles as $key => $file) {
            $filename = $file['filename'] ?? null;
            if (!is_null($filename)) {
                $clean_contractFiles[$filename] = $file;
            }
        }
        try {
            //search for an existing contract
            $contract = ContractTable::instance()->findOneBy(['reference', '=', $post_contractRef]);
            if (is_null($contract)) {
                //create the contract
                $contract = ContractTable::instance()->insert([
                    'reference' => $post_contractRef,
                    'files' => $clean_contractFiles,
                ]);
            } else {
                //update the contract files
                foreach ($clean_contractFiles as $post_file) {
                    if (!Arr::in($post_file['filename'], Arr::getField($contract['files'], 'filename'))) {
                        //add the posted file in contract files only if no exists
                        $contract['files'][] = $post_file;
                    }
                }
            }

            //        //add download date
            //        $downloadDate = $contract['files'][$foundIndex]['downloadDate'];
            //        if(!is_array($downloadDate)){
            //            $downloadDate = [$downloadDate];
            //        }
            //        $downloadDate[] = $post_file['downloadDate'];
            //        $contract['files'][$foundIndex]['downloadDate'] = [
            //            'ip' => $_SERVER['REMOTE_ADDR'],
            //            'date' => $downloadDate,
            //        ];
            response("Files download saved for contract " . $contract['reference'], 200, $contract);// OK
        } catch (Exception $e) {
            response($e->getMessage(), 500);
        }
    }
} else {
    response('I want my money assholes ! ', 402);// PAYMENT REQUIRED
}

function response(string $message, int $code, array $data = [])
{
    http_response_code($code);
    echo json_encode([
        'code' => $code,
        'response' => $message,
        'data' => $data,
    ]);
    exit;
}