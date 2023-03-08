<?

namespace System\Helper;


class Methods
{
    public static function InstallMethod($methodName, $args = array())
    {
        if (!class_exists($methodName))
            throw new \RuntimeException("Class '{$methodName}' not found", 500);

        if (is_array($args) and count($args) == 0)
            return new $methodName;

        if (!is_array($args))
            $args = array($args);

        $ref = new \ReflectionClass($methodName);
        $instance = $ref->newInstanceWithoutConstructor();
        $constructor = $ref->getConstructor();
        $constructor->setAccessible(true);
        $constructor->invokeArgs($instance, $args);
        return $instance;
    }

    public static function callMethod($method, $methodName, $args = array())
    {
        if (!method_exists($method, $methodName))
            throw new \RuntimeException("Method '{$method}::{$methodName}' not found", 500);

        if (!is_array($args))
            $args = array($args);

        return call_user_func_array(array($method, $methodName), $args);
    }

}
