<?

namespace Models;

class Client extends \ArrayObject
{
    protected $connection;

    public function __construct($clientId, \System\Connection &$connection)
    {
        parent::__construct();

        $this->connection = $connection;

        $this->setData([ 'uID' => $clientId ]);
    }


    public function setData($data)
    {
        foreach ($data as $k => $v)
            $this->offsetSet($k, $v);

        return $this;
    }
}
