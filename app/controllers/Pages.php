<?

namespace Controllers;

use Exception;

class Pages extends \System\Controllers
{

    public function __construct()
    {
        parent::__construct();
    }

    public function Index()
    {
        return $this->setView('Index')->renderView('Index');
    }

    public function Admin()
    {
        $this->auth->isAccess(1);

        if ($this->request->issetGet('signout'))
            $this->auth->signout();

        return $this->setView('Index')->renderView('Admin', array('accessLevel' => $this->auth->getAccessLevel()));
    }

    
    public function Login()
    {

        if ($this->request->isPost()) {
            $username = $this->request->val('username', 'POST');
            $password = $this->request->val('password', 'POST');

            if (!$this->auth->newAccess($username, $password)) {
                return $this->setView('Index')->renderView('Admin', array(
                    'accessLevel' => $this->auth->getAccessLevel(),
                    'error' => 'User not found'
                ));
            }
        }

        return $this->responce->redirectTo('/admin');
    }

    public function Signin()
    {
        if ($this->request->isPost()) {
            $username = $this->request->val('username', 'POST');
            $password = $this->request->val('password', 'POST');

            try {
                $this->auth->newClient($username, $password, 1);
            } catch (Exception $ex) {
                return $this->setView('Index')->renderView('Admin', array(
                    'accessLevel' => $this->auth->getAccessLevel(),
                    'error' => $ex->getMessage()
                ));
            }
        }

        return $this->responce->redirectTo('/admin');
    }
}
