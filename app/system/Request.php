<?

namespace System;

use Exception;

class Request
{

    protected $config;
    protected $isHttps;
    protected $requestUrl;
    protected $requestMethod;
    protected $get;
    protected $post;
    protected $acceptMethods;

    public function __construct($config = null)
    {
        $this->config = ($config === null ? new \System\Config : $config);

        $this->isHttps = $this->isHttps();
        $this->requestUrl = $this->getRequestUrl();
        $this->requestMethod = $this->getRequestMethod();
        $this->get = $this->requestVluesPrepare($_GET);
        $this->post = $this->requestVluesPrepare($_POST);
        $this->acceptMethods = $this->config['acceptMethods'];

        $this->parseRequests();
    }

    public function getBody($var = null)
    {
        return ($var == null ? $this->post : (isset($this->post[$var]) ? $this->post[$var] : null));
    }

    public function getQuery($var = null)
    {
        return ($var == null ? $this->get : (isset($this->get[$var]) ? $this->get[$var] : null));
    }

    public function getContentType()
    {
        switch ($_SERVER['CONTENT_TYPE']) {
            case 'application/json':
                return 'json';
            case 'form-data':
            case 'x-www-form-urlencoded':
            case 'text/html':
                return 'html';
            case 'application/xml': 
                return 'xml';
            default:
                return 'html';
        }
    }

    public function isGet()
    {
        if ($this->requestMethod === 'GET') {
            return true;
        }
        return false;
    }

    public function isPost()
    {
        if ($this->requestMethod === 'POST') {
            return true;
        }
        return false;
    }

    public function isHttps()
    {
        return $_SERVER['HTTPS'];
    }

    public function isMethodAcepted($method)
    {
        return in_array($method, $this->acceptMethods);
    }

    public function dump()
    {
        return ['requestUrl' => $this->requestUrl, 'requestMethod' => $this->requestMethod, 'get' => $this->get, 'post' => $this->post];
    }

    public function getRequestMethod()
    {
        if (isset($this->requestMethod)) {
            return $this->requestMethod;
        }
        return filter_var(getenv('REQUEST_METHOD'));
    }

    public function getRequestUrl()
    {
        if (isset($this->requestUrl))
            return $this->requestUrl;

        $requestUrl = filter_input(INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_URL);
        if (strpos($requestUrl, '?'))
            $requestUrl = substr($requestUrl, 0, strpos($requestUrl, '?'));

        return $requestUrl;
    }

    public function getRequestUri()
    {
        return $_SERVER['REQUEST_URI'];
    }

    public function getDomainName()
    {
        return $_SERVER['HTTP_HOST'];
    }

    public function getDomainProtocol()
    {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';
        return $protocol;
    }

    /**
     * Request Value
     * 
     * @param string $valueName or NULL for get request datas
     * @param string $requestMethod or NULL for call $this->getRequestMethod()
     * 
     * @return any
     */
    public function val($valueName = null, $requestMethod = null)
    {
        if ($requestMethod === null)
            $requestMethod = $this->getRequestMethod();

        $request = null;
        switch ($requestMethod) {
            case 'GET':
                $request = &$_GET;
                break;
            case 'POST':
                $request = &$_POST;
                break;
            case 'DELETE':
            case 'PUT':
            case 'OPTIONS':
            case 'HEAD':
                $request = &$_REQUEST;
                break;
            default:
                $request = null;
                break;
        }

        return ($request == null ? null : ($valueName == null ? $request : $request[$valueName]));
    }

    public function issetGet($valueName)
    {
        return isset($_GET[$valueName]);
    }

    /**
     * @param string $valueName
     */
    public function throwIfValueNotExist($valueName, $requestMethod = null)
    {
        if (is_array($valueName))
            return $this->throwIfValuesNotExist($valueName, $requestMethod);

        if ($requestMethod === null)
            $requestMethod = $this->getRequestMethod();

        if ($this->val($valueName, $requestMethod) === null)
            throw new Exception("'$valueName' variable required", 400);

        return true;
    }


    /**
     * @param array $valueName
     */
    public function throwIfValuesNotExist($valuesName, $requestMethod = null)
    {
        if (!is_array($valuesName))
            throw new Exception("The variable $valuesName must be an array", 500);

        if ($requestMethod === null)
            $requestMethod = $this->getRequestMethod();

        foreach ($valuesName as $value)
            if ($this->val($value, $requestMethod) === null)
                throw new Exception("'$value' variable required", 400);

        return true;
    }


    /**
     * @param string $valueName
     */
    public function requireValue($valueName, $requestMethod = null)
    {
        return $this->throwIfValueNotExist($valueName, $requestMethod);
    }


    /**
     * $param - @array (
     *      host: String,
     *      method: String,
     *      requestValue: Array,
     *      headers: Array(),
     *      returnResponce: Bool
     *  )
     */
    public function sendRequest($param, $curl = false)
    {
        $host = $param['host'];
        $method = $param['method'] ? $param['method'] : 'GET';
        $requestValue = $param['requestValue'] ? $param['requestValue'] : array();
        $headers = $param['headers'] ? $param['headers'] : array();
        $returnResponce = $param['returnResponce'] ? $param['returnResponce'] : true;

        if (strtolower($method) == 'post' && !$headers['Content-type']) {
            $headers['Content-type'] = 'application/x-www-form-urlencoded';
        }

        if (!$curl) {
            if (count($headers) > 0) {
                $sep = $headersvars = '';
                foreach ($headers as $key => $value) {
                    $headersvars = $sep . $key . ': ' . $value;
                    $sep = '\r\n';
                }
            }
            $result = file_get_contents($host, false, stream_context_create(
                array(
                    'https' => array(
                        'method'  => $method,
                        'header'  => $headersvars,
                        'content' => http_build_query($requestValue)
                    ), 'ssl' => array(
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                    ),
                )
            ));
        } else {
            if (count($headers) > 0) {
                $headersvars = array();
                foreach ($headers as $key => $value) {
                    $headersvars[] = $key . ':' . $value;
                }
            }

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $host);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($requestValue));
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headersvars);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            $result = curl_exec($ch);
            curl_close($ch);
        }


        if ($returnResponce)
            return $result;
    }

    private function requestVluesPrepare($s)
    {
        if (!is_null($s)) {
            $s = Helper\StringHelper::htmlChars($s);
            Helper\StringHelper::strTrim($s);
        }

        return $s;
    }

    private function parseRequests()
    {
        parse_str(file_get_contents('php://input'), $request);
        foreach ($request as $key => $value) {
            unset($request[$key]);

            $request[str_replace('amp;', '', $key)] = $value;
        }

        $_REQUEST = array_merge($_REQUEST, $this->requestVluesPrepare($request));
    }
}
