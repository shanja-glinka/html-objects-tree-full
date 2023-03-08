<?

namespace System\Helper;

class Debug
{
    public static function varDump(...$var)
    {

        $debugCallData = "\n[file]: " . 
        (debug_backtrace()[1]['file'] ? debug_backtrace()[1]['file'] : debug_backtrace()[0]['file'])
        . "\n[line]: " . 
        (debug_backtrace()[1]['line'] ? debug_backtrace()[1]['line'] : debug_backtrace()[0]['line'])
        . "\n[call]: " . 
        (debug_backtrace()[1]['class'] ? debug_backtrace()[1]['class'] . debug_backtrace()[1]['type'] : '' ) .
        debug_backtrace()[1]['function']  . 
        "\n";

        print('<pre>'. $debugCallData);
        
        // var_dump(debug_backtrace());
        
        foreach ($var as $v)
            var_dump($v);
        print('</pre>');
    }
}
