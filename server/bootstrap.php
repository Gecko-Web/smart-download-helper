<?php
$documentRoot = $_SERVER['DOCUMENT_ROOT'];
define('DOCUMENT_ROOT',$documentRoot);
$rootAbsolutePath = realpath(DOCUMENT_ROOT . '/../..');
define('ROOT_ABSOLUTE_PATH',$rootAbsolutePath);
require_once realpath(ROOT_ABSOLUTE_PATH . '/vendor/autoload.php');

define('BROWSER_ADDON_ABSOLUTE_PATH',realpath($rootAbsolutePath.'/browser-addon'));
define('SERVER_ABSOLUTE_PATH',realpath($rootAbsolutePath.'/server'));

$dotenv = Dotenv\Dotenv::createImmutable(ROOT_ABSOLUTE_PATH);
$dotenv->load();