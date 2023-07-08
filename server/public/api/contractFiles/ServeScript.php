<?php

declare(strict_types=1);

use GoogleClosureCompiler\Compiler;
use Tholu\Packer\Packer;

header('Access-Control-Allow-Origin: *');
/**
 * Author: Gecko Web
 * Date: 08/07/2023
 * Time: 19:07
 */

require_once __DIR__ . '/../../../bootstrap.php';
require_once SERVER_ABSOLUTE_PATH . '/src/Helpers/ApiHelpers.php';

if ($_ENV['SMART_PAID']) {
    header('Content-Type: application/javascript');
    $script = file_get_contents(SERVER_ABSOLUTE_PATH . '/src/assets/injectScripts/contractFiles.js');
    echo $script;
//    $packer = new Packer($script, 0, true, false, true);
//    echo $packer->pack();
    exit;
} else {
    responseJson('I want my money assholes ! ', 402);// PAYMENT REQUIRED
}