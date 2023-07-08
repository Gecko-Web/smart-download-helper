<?php

declare(strict_types=1);
/**
 * Author: Gecko Web
 * Date: 08/07/2023
 * Time: 14:59
 */

namespace SmartDownloadHelper;

use SleekDB\Exceptions\InvalidArgumentException;
use SleekDB\Exceptions\InvalidConfigurationException;
use SleekDB\Exceptions\IOException;
use SleekDB\Query;
use SleekDB\Store;

/**
 * Class Contract
 * @package SmartDownloadHelper
 */
class ContractTable extends Store
{
    /**
     * @var Store
     */
    private static $instance;

    /**
     * @throws IOException
     * @throws InvalidArgumentException
     * @throws InvalidConfigurationException
     */
    private function __construct()
    {
        $configuration = [
            "auto_cache" => true,
            "cache_lifetime" => null,
            "timeout" => false,
            "primary_key" => "_id",
            "search" => [
                "min_length" => 2,
                "mode" => "or",
                "score_key" => "scoreKey",
                "algorithm" => Query::SEARCH_ALGORITHM["hits"]
            ],
            "folder_permissions" => 0777
        ];
        parent::__construct("contracts", Database::instance()->getDbDir(), $configuration);
    }

    /**
     * @return Store|ContractTable
     */
    public static function instance()
    {
        if (empty(self::$instance)) {
            self::$instance = new ContractTable();
        }
        return self::$instance;
    }
}