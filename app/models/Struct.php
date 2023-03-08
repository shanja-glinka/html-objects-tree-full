<?

namespace Models;

use Exception;

final class Struct
{

    private $connection;

    public function __construct()
    {
        $this->connection = new \System\Connection();
    }


    public function Select($structId)
    {
        return $this->loadStructure($structId);
    }


    public function Insert($title, $descr, $parentId = -1)
    {
        if (!$descr)
            $descr = '';

        $parentId = intval($parentId);

        if ($parentId > 0 && !$this->isStructExists($parentId))
            throw new Exception("Parent '$parentId' struct is not found", 422);

        $lastId = $this->connection->insert('Struct', array('sTitle' => $title, 'sDescr' => $descr, 'sParentID' => $parentId));

        return $this->loadStructure($lastId, true);
    }


    public function Update($title, $descr, $structId)
    {
        if (!$this->isStructExists($structId))
            throw new Exception("Struct '$structId' is not found", 422);

        $this->connection->update('Struct', array('sTitle' => $title, 'sDescr' => $descr), 'sTitle, sDescr', 'sID=?d', array($structId));

        return $this->loadStructure($structId, true);
    }


    public function Remove($structId)
    {

        if (!$this->isStructExists($structId))
            throw new Exception("Struct '$structId' is not found", 422);

        $structIds = $this->getStructIds($this->Select($structId));

        $res = null;
        if (count($structIds) > 0)
            $res = $this->connection->delete('Struct', 'sID ?i', array($structIds));

        return array($structId);
    }


    private function isStructExists($id)
    {
        return $this->connection->count('Struct', 'sID=?d', array($id));
    }

    private function loadStructure($structId, $oneRow = false)
    {
        if ($oneRow === true)
            return $this->connection->fetch1Row($this->connection->select('Struct', '*', 'sID=?d', array($structId)));

        $struct = $this->loadDeepStruct($structId, 'sID');

        return $struct;
    }

    private function loadDeepStruct($structId, $select)
    {
        $filter = $select . '=?d';

        if ($structId == -1)
            $filter = 'sParentID=-1';

        $struct = $this->connection->fetchRows($this->connection->select('Struct', '*', $filter, array($structId)));

        if (!count($struct))
            return $struct;


        for ($i = 0; $i < count($struct); $i++) {
            $data = $this->loadDeepStruct($struct[$i]['sID'], 'sParentID');

            if (count($data))
                $struct[$i]['sData'] = $data;
        }

        return $struct;
    }


    private function getStructIds($struct)
    {
        $ids = array();


        foreach ($struct as $values) {
            $ids[] = $values['sID'];

            if ($values['sData']) {
                $ids = array_merge($ids, $this->getStructIds($values['sData']));
            }
        }
        return $ids;
    }
}
