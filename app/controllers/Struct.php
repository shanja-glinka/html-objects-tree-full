<?

namespace Controllers;

use Exception;

class Struct extends \System\Controllers
{

    public function __construct()
    {
        parent::__construct();

        $this->responce->setContentType('json');
        $this->responce->useFormatResponce(false);
    }

    public function Select($structId = -1)
    {
        $callResult = $this->callMethod('Struct', 'Select', array($structId));

        return $this->setView('Struct')->renderView('SendStruct', $callResult);
        // return $this->responce->withText(file_get_contents('assets/var/objectsTree-example.json'));
    }

    public function Update($structId)
    {
        $this->request->requireValue(['title', 'descr']);

        if ($this->request->val('title') === '')
            throw new Exception('Title value Required', 422);

        $callResult = $this->callMethod('Struct', 'Update', array($this->request->val('title'), $this->request->val('descr'), $structId));

        return $this->setView('Struct')->renderView('Send1Struct', $callResult);;
    }

    public function Remove($structId)
    {
        $callResult = $this->callMethod('Struct', 'Remove', array($structId));

        return $this->responce->withJson($callResult);
    }

    public function Insert()
    {
        $this->request->requireValue(['title', 'parent']);

        if ($this->request->val('title') === '')
            throw new Exception('Title value Required', 422);

        $callResult = $this->callMethod('Struct', 'Insert', array($this->request->val('title'), $this->request->val('descr'), $this->request->val('parent')));

        return $this->setView('Struct')->renderView('Send1Struct', $callResult);
    }


}
