<?

namespace Views;

class Struct extends \System\Views
{

    public function __construct()
    {
        $responce = new \System\Responce('json');
        parent::__construct($responce);


        $this->responce->useFormatResponce(false);
    }

    public function Send1Struct($args = array())
    {
        $this->responce->setContentType('json');

        return $this->responce->withJson($this->renameStructKeys($args));
    }

    public function SendStruct($args = array())
    {
        $this->responce->setContentType('json');

        return $this->responce->withJson($this->makeTreeStruct($args));
    }


    private function makeTreeStruct($args)
    {
        $data = array();
        foreach ($args as $values) {
            $tempArr = $this->renameStructKeys($values);

            if ($tempArr['data'])
                $tempArr['data'] = $this->makeTreeStruct($tempArr['data']);

            $data[] = $tempArr;
        }

        return $data;
    }

    private function renameStructKeys($struct)
    {
        $data = array();

        $data['id'] = $struct['sID'];
        $data['title'] = $struct['sTitle'];
        $data['descr'] = $struct['sDescr'];
        $data['parent'] = $struct['sParentID'];
        $data['data'] = $struct['sData'];

        return $data;
    }
}
