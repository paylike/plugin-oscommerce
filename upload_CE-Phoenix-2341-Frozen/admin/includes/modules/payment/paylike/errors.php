<?php
if(strpos($_SERVER['REQUEST_URI'], 'module=paylike')){
    /* Initialize errors object */
    require_once('helpers/Paylike_Errors.php');
    $errorHandler = new PaylikeErrors();
}
