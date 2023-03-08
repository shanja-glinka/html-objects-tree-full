<?

namespace System\Helper;

class Password
{
    public static function hash($password)
    {
        $config = new \System\Config();
        if (isset($config['salt']))
            $password .= $config['salt'];
            
        return sha1($password);
    }
}
