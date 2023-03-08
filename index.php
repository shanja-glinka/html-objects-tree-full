<?

define('AppDirectory', str_replace('\\', '/', __DIR__) . '/app');
define('AssetsDirectory', str_replace('\\', '/', __DIR__) . '/assets');


try {
    require_once AppDirectory . '/system/App.php';
    require_once AppDirectory . '/system/Config.php';

    $routes = require AssetsDirectory . '/data/routes.php';

    $config = new System\Config;
    $app = new System\App($config);

    $app($routes);
} catch (Exception $e) {

    $requset = new System\Request();
    $responce = new System\Responce();
    $responce->setHtmlCode($e->getCode());
    $responce->setContentType($requset->getContentType());
    $responce->send($e->getMessage());
}
