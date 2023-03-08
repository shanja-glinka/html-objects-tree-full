<?

namespace System;

final class App
{

    protected $config;
    protected $router;
    protected $responce;
    protected $request;

    public function __construct($config)
    {
        $this->autoloadInit();

        $this->config = $config;
        $this->router = new Router();
        $this->request = new Request($this->config);
        $this->responce = new Responce();

        $this->setConfig($this->config);
    }

    public function __invoke($routes)
    {
        $this->setRoutes($routes);
    }

    public function getConfig($variable = null)
    {
        if ($variable == null)
            return $this->config;
        return $this->config[$variable];
    }


    protected function setRoutes($routes)
    {
        $this->router->add($routes);
        if ($this->router->isFound())
            $this->router->executeHandler($this->router->getRequestHandler(), $this->router->getParams());
        else
            $this->responce->setHtmlCode(404)->send('Page not found');
    }

    protected function setConfig($config)
    {
        $this->config = $config;
        $this->applyConfig();
    }

    public function setConfigParam($variable, $value)
    {
        return $this->config[$variable] = $value;
    }


    private function applyConfig()
    {
        if ($this->getConfig('https_only')) {
            if (!$this->request->isHttps())
                $this->responce->redirectTo('https://' . $this->request->getDomainName() . $this->request->getRequestUri());
        }

        if (!$this->request->isMethodAcepted($this->request->getRequestMethod()))
            throw new \InvalidArgumentException('Method "' . $this->request->getRequestMethod() . '" not accepted', 405);
    }

    private function autoloadInit()
    {
        spl_autoload_register(function ($class) {
            $class = explode('\\', $class);
            $i = 0;
            $c = count($class);
            $realclass = '';
            foreach ($class as $ns) {
                if ($c - 1 == $i) {
                    $realclass .= $ns;
                } else {
                    $realclass .= strtolower($ns) . '\\';
                }
                $i++;
            }
            $path = AppDirectory . '/' . $realclass . '.php';
            $path = str_replace('\\', '/', $path);
            if (file_exists($path)) {
                require_once $path;
            }
        });
    }
}
