<?

namespace System;

final class Connection extends \System\Helper\CustomPDO
{
    private $pdo;
    private $config;

    public function __construct($config = null)
    {
        $this->config = (!is_object($config) ? new \System\Config : $config);

        $this->connect($this->config['connection']);
    }

    private function connect($connection)
    {
        $this->setConnect($connection['host'], $connection['database'], $connection['username'], $connection['password'], $connection['charset']);
        $this->open();
        return $this;
    }
}
