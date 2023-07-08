<?php

declare(strict_types=1);
/**
 * Author: Gecko Web
 * Date: 08/07/2023
 * Time: 15:39
 */

namespace SmartDownloadHelper;

/**
 * Class Database
 * @package SmartDownloadHelper
 */
class Database
{
    /**
     * @var string
     */
    private $dbDir;

    /**
     * @var Database
     */
    private static $instance;

    protected function __construct()
    {
        $this->dbDir = realpath(ROOT_ABSOLUTE_PATH) . "/server/db";
    }

    /**
     * @return Database
     */
    public static function instance(): Database
    {
        if (empty(self::$instance)) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * @return string
     */
    public function getDbDir(): string
    {
        return $this->dbDir;
    }


}