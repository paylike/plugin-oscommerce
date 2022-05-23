<?php

/**
 * Insert new lines in "includes/application_top.php" file
 */
$applicationTop = 'includes/application_top.php';
$applicationTopMatch = 'src= "includes/javascript/paylike.js"';
$applicationTopFind = '';
$applicationTopInsert = '
  if ( basename( $PHP_SELF ) == \'checkout_confirmation.php\' ) {
      echo \'<script src="https://sdk.paylike.io/10.js"></script>\';
      echo \'<script src= "includes/javascript/paylike.js"></script>\';
  }
';

modifyFileContents($applicationTop, $applicationTopMatch, $applicationTopFind, $applicationTopInsert, $endOfFile = true);

/**
 * Insert new lines at the end in "includes/.htaccess" file
 */
$htaccess = 'includes/.htaccess';
$htaccessMatch = 'FilesMatch "paylike.php"';
$htaccessFind = '';
$htaccessInsert = '
<FilesMatch "paylike.php">
  Require all granted
</FilesMatch>
';

modifyFileContents($htaccess, $htaccessMatch, $htaccessFind, $htaccessInsert, $endOfFile = true);

/**
 * Insert (I) new lines in "admin/modules.php" file
 */
$modules_1 = 'admin/modules.php';
$modules_1_Match = 'payment/paylike/errors.php';
$modules_1_Find = 'require \'includes/application_top.php\';';
$modules_1_Insert = '
  require_once(\'includes/modules/payment/paylike/errors.php\');
  require \'includes/application_top.php\';
';

modifyFileContents($modules_1, $modules_1_Match, $modules_1_Find, $modules_1_Insert);

/**
 * Insert (II) new lines in "admin/modules.php" file
 */
$modules_2 = 'admin/modules.php';
$modules_2_Match = 'payment/paylike/validate.php';
$modules_2_Find = 'case \'save\':';
$modules_2_Insert = '
      case \'save\':
      require_once(\'includes/modules/payment/paylike/validate.php\');
';

modifyFileContents($modules_2, $modules_2_Match, $modules_2_Find, $modules_2_Insert);

/**
 * Insert (III) new lines in "admin/modules.php" file
 */
$modules_3 = 'admin/modules.php';
$modules_3_Match = 'if(sizeof($errors) === 0 || array_search($key, $validation_keys) === FALSE)';
$modules_3_Find = 'tep_db_query("UPDATE configuration SET configuration_value = \'" . tep_db_input($value) . "\' WHERE configuration_key = \'" . tep_db_input($key) . "\'");';
$modules_3_Insert = '
            if(sizeof($errors) === 0 || array_search($key, $validation_keys) === FALSE){
                tep_db_query("UPDATE configuration SET configuration_value = \'" . tep_db_input($value) . "\' WHERE configuration_key = \'" . tep_db_input($key) . "\'");
            }
';

modifyFileContents($modules_3, $modules_3_Match, $modules_3_Find, $modules_3_Insert);

/**
 * Insert (IV) new lines in "admin/modules.php" file
 */
$modules_4 = 'admin/modules.php';
$modules_4_Match = 'if(sizeof($errors)){';
$modules_4_Find = 'tep_redirect(tep_href_link(\'modules.php\', \'set=\' . $set . \'&module=\' . $_GET[\'module\']));';
$modules_4_Insert = '
        if(sizeof($errors)){
            tep_redirect(tep_href_link(\'modules.php\', \'set=\' . $set . \'&module=\' . $_GET[\'module\'] . \'&action=edit\'));
        }
        tep_redirect(tep_href_link(\'modules.php\', \'set=\' . $set . \'&module=\' . $_GET[\'module\']));
';

modifyFileContents($modules_4, $modules_4_Match, $modules_4_Find, $modules_4_Insert);

/**
 * Insert (V) new lines in "admin/modules.php" file
 */
$modules_5 = 'admin/modules.php';
$modules_5_Match = 'isset($errorHandler))$errorHandler->display()';
$modules_5_Find = '<div class="row no-gutters">';
$modules_5_Insert = '
<?php if(isset($errorHandler))$errorHandler->display(); ?>
  <div class="row no-gutters">
';

modifyFileContents($modules_5, $modules_5_Match, $modules_5_Find, $modules_5_Insert);



/** SELF-DELETE this file. */
echo 'Now the script will be deleted';
unlink(__FILE__);



/** ***************************** FUNCTION AREA ****************************************** */

/**
 * Modify file contents with desired text to insert
 * - search if text to insert is present
 * - replace portion of text with another OR insert text to the end of the file
 *
 * @param string $relativeFilePath - the file relative path as 'folder/anotherFolder/file.ext'
 * @param string $matchText - if this text is present the file will be untouched
 * @param string $findText - the text where to begin insertion
 * @param string $insertText - the text to be inserted
 * @param bool $endOfFile - specify if the desired text has to be inserted to the end of the file
 *
 * @return void
 *
 */

function modifyFileContents($relativeFilePath, $matchText, $findText, $insertText, $endOfFile = false) : void
{
    try {
        /** Check file existence. */
        if (file_exists($relativeFilePath)) {
            $file = file_get_contents($relativeFilePath);
        } else {
            echo 'File not exists -> ' . $relativeFilePath . PHP_EOL . '<br>';
        }

        /** Check if the file NOT contains the text for insertion. */
        if (false === strstr($file, $matchText)) {

            /** Check if "$endOfFile" is set to false. */
            if (false === $endOfFile) {
                /** Insert the new code lines. */
                $modifiedFileContents =
                    str_replace(
                        $search = $findText,
                        $replace = $insertText,
                        $subject = $file
                    );

                /** Write modified contents to the file. */
                file_put_contents($relativeFilePath, $modifiedFileContents);

            } else {
                /** Append the new code lines and writes to the file. */
                file_put_contents($relativeFilePath, $insertText, FILE_APPEND);
            }

            echo 'Successfully changed ' . $relativeFilePath  . PHP_EOL . '<br>';

        } else {
            echo 'Changes already applied to ' . $relativeFilePath . PHP_EOL . '<br>';
        }

    } catch (Exception $e) {
        echo $e->getMessage();
    }
}