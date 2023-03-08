<?

namespace System;


class Responce
{

    protected $codeResponce;
    protected $contentTypeResponce;

    private $useFormatResponce;
    private $dataResponce;

    private $contentType = [
        'json' => 'Content-type: application/json; charset=UTF-8',
        'html' => 'Content-Type: text/html; charset=UTF-8',
        'text' => 'Content-Type: text/html; charset=UTF-8',
    ];

    private $htmlCodes = [
        200 => '200 OK',
        404 => 'HTTP/1.0 404 Not Found',
        301 => 'HTTP/1.1 301 Moved Permanently',
    ];


    public function __construct($headerType = 'html', $useFormatResponce = true)
    {
        $this->dataResponce = null;
        $this->setHtmlCode(200);
        $this->setContentType($headerType);
        $this->useFormatResponce($useFormatResponce);
    }

    public function setContentType($extension)
    {
        if (array_key_exists($extension, $this->contentType)) {
            $this->contentTypeResponce = $extension;
        } else {
            throw 'Unsupported Content-type: ' . $extension;
        }
        return $this;
    }

    public function setHtmlCode($htmlCode)
    {
        $this->codeResponce = $htmlCode;
        return $this;
    }

    public function setCode($htmlCode)
    {
        return $this->setHtmlCode($htmlCode);
    }

    public function sendHeader($header = null)
    {
        if ($header !== null)
            header($header);
        return $this;
    }

    public function sendCode($code = null)
    {
        if ($code !== null)
            http_response_code($code);
        return $this;
    }

    public function useFormatResponce($useit = true)
    {
        $this->useFormatResponce = $useit;
    }

    public function send($data)
    {
        $this->setDataResponce($data);
        // if (is_array($data))
        //     $this->setContentType('json');

        if ($this->contentTypeResponce == 'json')
            $this->withJson($data);
        else
            $this->withText($data);
        $this->setDataResponce(null);
        return $this;
    }

    public function setDataResponce($data)
    {
        $this->dataResponce = $data;
    }

    public function withText($data = null)
    {
        $this->sendHeader($this->contentType[$this->contentTypeResponce]);
        $this->sendCode($this->codeResponce);
        $this->withData($data);
    }

    public function withData($data = null)
    {
        echo print_r($data === null ? $this->dataResponce : $data, true);
    }

    public function withJson($data = null)
    {
        $this->sendCode($this->codeResponce);
        $this->sendHeader($this->contentType[$this->contentTypeResponce]);
        echo json_encode($this->seteResponceFormat($data === null ? $this->dataResponce : $data));
    }

    public function withHtml($templateData)
    {
        if (!is_object($templateData))
            throw 'Unsupported file Template';

        $template = new \System\Template();
        $this->setContentType('html')->withData($template->render($templateData));
    }

    public function redirectTo($location)
    {
        $this->sendCode(301)->sendHeader('Location: ' . $location);
        exit;
    }

    private function seteResponceFormat($data = null)
    {
        $data = $data === null ? $this->dataResponce : $data;
        return ($this->useFormatResponce ?
            array(
                'ok' => $this->codeResponce,
                'result' => $data
            ) :
            $data);
    }
}
