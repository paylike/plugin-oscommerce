<?php
if(strpos($_SERVER['REQUEST_URI'], 'module=paylike')){
    require_once('vendor/autoload.php');
    require_once('helpers/Paylike_Keys_Validator.php');
    require_once('../includes/languages/' . $language . '/modules/payment/paylike.php');

    /* Module keys that needs to be validated */
    $validation_keys = array('LIVE_APP_KEY'   =>'MODULE_PAYMENT_PAYLIKE_APP_KEY',
                             'LIVE_PUBLIC_KEY'=>'MODULE_PAYMENT_PAYLIKE_KEY',
                             'TEST_APP_KEY'   =>'MODULE_PAYMENT_PAYLIKE_TEST_APP_KEY',
                             'TEST_PUBLIC_KEY'=>'MODULE_PAYMENT_PAYLIKE_TEST_KEY',
                            );

    $errors = validate($_POST['configuration']);
    /* In case of errors, write them into cookies */
    if (isset($errorHandler)) {
        $errorHandler->setCookieErrors($errors);
    }
}

/* Validate module keys */
function validate($vars)
{
    global $validation_keys;
    $mode = $vars['MODULE_PAYMENT_PAYLIKE_TRANSACTION_MODE'];
    $payment_paylike_app_key = $mode == "Live"?$vars[$validation_keys['LIVE_APP_KEY']]:$vars[$validation_keys['TEST_APP_KEY']];
    $payment_paylike_public_key = $mode == "Live"?$vars[$validation_keys['LIVE_PUBLIC_KEY']]:$vars[$validation_keys['TEST_PUBLIC_KEY']];

    /* Initialize validator object */
    $validator = new PaylikeValidator();
    $errors = array();

    $error = $validator->validateAppKeyField($payment_paylike_app_key, $mode);
    if (strlen($error)) {
        $errors[] = $error;
    }

    $error = $validator->validatePublicKeyField($payment_paylike_public_key, $mode);
    if (strlen($error)) {
        $errors[] = $error;
    }

    return $errors;
}
