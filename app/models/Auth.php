<?

namespace Models;

use \Exception;

final class Auth
{

    protected $session;
    protected $access;
    protected $accessLevel;
    protected $connection;
    protected $user;

    public function __construct()
    {
        $this->session = new \System\Session();

        $this->connection = new \System\Connection();
        $this->user = null;

    }
    
    public function newAccess($login, $password)
    {
        $user = new User(0, $this->connection);

        $clientId = $user->findUser($login, $password);

        if (!$clientId)
            return false;

        $this->session->set('clientId', $clientId);

        $this->getClientData();

        return true;
    }

    public function newClient($login, $password)
    {
        $user = new User(0, $this->connection);

        $clientId = $user->newUser($login, $password, 1);

        if (!$clientId)
            return false;

        $this->session->set('clientId', $clientId);

        $this->getClientData();
    }

    public function signout()
    {
        $this->session->set('clientId', 0);
        $this->getClientData();
    }

    public function setAccessLevel($level)
    {
        $this->userLoaded();

        if (!$this->isAccess($level))
            throw new Exception('Authentication required', 403);
    }

    public function isAccess($level)
    {
        $this->userLoaded();
        
        return ($this->accessLevel >= $level);
    }

    public function getAccessLevel()
    {
        $this->userLoaded();

        return $this->accessLevel;
    }



    private function userLoaded()
    {
        if ($this->user === null)
            $this->getClientData();
    }

    private function getClientData()
    {
        $this->user = new User($this->session->get('clientId'), $this->connection);
        $this->user->loadUser();
        $this->accessLevel = $this->user->accessLevel();
    }
}
