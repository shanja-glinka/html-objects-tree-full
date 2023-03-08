<?

namespace Views;

class Index extends \System\Views
{

    public function __construct()
    {
        $responce = new \System\Responce('html');
        parent::__construct($responce);
    }

    public function Index($args = array())
    {
        $this->responce->setContentType('text');
        return $this->responce->withHtml(new \System\TemplateData('index.html', $args));
    }

    public function Admin($args = array())
    {
        $this->responce->setContentType('text');
        return $this->responce->withHtml(new \System\TemplateData('admin.html', $args));
    }
}
