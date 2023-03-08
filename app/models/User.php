<?

namespace Models;

use Exception;

final class User extends Client
{
    public function __construct($clientId, \System\Connection &$connection)
    {
        parent::__construct($clientId, $connection);

        $this->setData(['uID' => $clientId]);
    }


    public function findUser($login, $password = '')
    {
        if ($password !== '')
            $password = \System\Helper\Password::hash($password);

        $filter = 'uLogin=?' . ($password !== '' ? ' AND uPass=?' : '');
        
        return $this->connection->fetch1($this->connection->select('Users', 'uID', $filter, array($login, $password)));
    }

    public function newUser($login, $password, $access = 0)
    {
        if ($this->findUser($login))
            throw new Exception('User already exists', 403);

        $password = \System\Helper\Password::hash($password);

        $newId = $this->connection->insert('Users', array('uLogin' => $login, 'uPass' => $password, 'uAccess' => $access));

        return $newId;
    }

    public function loadUser()
    {
       
        if ($this->offsetGet('uID') < 1)
            return $this->setData(['uAccess' => 0]);

        $qr = $this->connection->fetch1Row($this->connection->select('Users', '*', 'uID=?d', array($this->offsetGet('uID'))));


        if (count($qr))
            $this->setData($qr);
    }

    public function accessLevel()
    {
        return $this->offsetGet('uAccess');
    }

    public function reset()
    {
        $this->setData(['uID' => 0]);
        $this->loadUser();
    }

    public function setData($data)
    {
        foreach ($data as $k => $v)
            $this->offsetSet($k, $v);

        return $this;
    }
}
