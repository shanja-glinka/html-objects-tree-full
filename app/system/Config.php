<?

namespace System;

final class Config extends \ArrayObject 
{
    private $config = array();

    public function __construct()
    {
        parent::__construct();
        $this->loadConfig();
    }

    public function getAll()
    {
        return $this->config;
    }

    private function loadConfig()
    {
        $this->config = require AssetsDirectory . '/data/config.php';

        foreach($this->config as $k => $v)
            $this->offsetSet($k, $v);
    }

}