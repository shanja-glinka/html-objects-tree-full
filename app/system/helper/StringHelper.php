<?

namespace System\Helper;


class StringHelper
{

    public static function strTrim(&$s)
    {
        if (!is_array($s))
            $s = trim($s);
        else
            foreach ($s as $i => $v)
                StringHelper::strTrim($s[$i]);
    }

    public static function htmlChars($s)
    {

        if (!is_array($s))
            $s = htmlspecialchars($s);
        else
            foreach ($s as $i => $v)
                $s[$i] = StringHelper::htmlChars($s[$i]);
        return $s;
    }
}
