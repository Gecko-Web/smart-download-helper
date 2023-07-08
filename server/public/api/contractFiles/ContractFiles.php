<?php

declare(strict_types=1);
header('Access-Control-Allow-Origin: *');
/**
 * Author: Gecko Web
 * Date: 08/07/2023
 * Time: 19:07
 */
use JBZoo\Utils\Arr;
use SmartDownloadHelper\ContractTable;

require_once __DIR__ . '/../../../bootstrap.php';
require_once SERVER_ABSOLUTE_PATH.'/src/Helpers/ApiHelpers.php';

$allowedOrigins = [
    'http://compte.smartfr.fr',
    'https://compte.smartfr.fr',
];

$http_origin = $_SERVER['HTTP_ORIGIN'] ?? null;
if (!in_array($http_origin, $allowedOrigins)) {
    responseJson('Access forbidden' . (is_null($http_origin) ? '' : ' from ' . $http_origin), 403);// FORBIDDEN
}

if ($_ENV['SMART_PAID']) {
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $post_contractRef = $_POST['contractReference'] ?? null;
        $post_jsonContractFiles = $_POST['contractFiles'] ?? null;
        if (empty($post_contractRef)) {
            responseJson('No contract reference provided', 400);// BAD REQUEST
        }
        if (empty($post_jsonContractFiles)) {
            responseJson('No contract files provided', 400);// BAD REQUEST
        }
        $post_contractFiles = @json_decode($post_jsonContractFiles, true); // force array decode
        if (empty($post_contractFiles)) {
            responseJson('Contract files is empty', 400);// BAD REQUEST
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
            responseJson("Files download saved for contract " . $contract['reference'], 200, $contract);// OK
        } catch (Exception $e) {
            responseJson($e->getMessage(), 500);
        }
    }
} else {
    responseJson('I want my money assholes ! ', 402);// PAYMENT REQUIRED
}