<?

namespace System;

use Exception;

class Template
{
    public function render($templateData)
    {
        if (!is_object($templateData))
            throw 'TemplateData not found';

        if (!file_exists($templateData->getTemplatePath()))
            throw new Exception('Page not found', 404);

        $tempalte = $templateData->getTemplatePath();

        extract($templateData->getVariables());
        chdir(dirname($tempalte));
        ob_start();
            
        include basename($tempalte);

        return ob_get_clean();
    }
}
