# osCommerce plugin for Paylike

This plugin is *not* developed or maintained by Paylike but kindly made
available by a user.

Released under the GPL V3 license: https://opensource.org/licenses/GPL-3.0

## Supported osCommerce versions

*The plugin has been tested with osCommerce CE Phoenix v1.0.7.4

## Installation

 Once you have installed osCommerce, follow these simple steps:
  1. Signup at [paylike.io](https://paylike.io) (it’s free)
  2. Create a live account
  3. Create an app key for your osCommerce website
  4. Upload the files in the `upload` folder to root of your osCommerce store.
  5. In: `includes/application_top.php` add:
      ```
      if ( basename( $PHP_SELF ) == 'checkout_confirmation.php' ) {
        echo '<script src="https://sdk.paylike.io/3.js"></script>';
        echo '<script src= "includes/javascript/paylike.js"></script>';
      }
      ```
     After the last line.
  6. In: `includes/.htaccess` add:
      ```
      <FilesMatch "paylike.php">
         Allow from all
      </FilesMatch>

      ```
      After the last line.
  7. In: `admin/modules.php`
      7.1.Add:
      ```
      require_once('includes/modules/payment/paylike/errors.php');
      ```
      Before require 'includes/application_top.php'; line;

      7.2.Add:
      ```
      require_once('includes/modules/payment/paylike/validate.php');
      ```
      After case 'save': line;

      7.3.Replace tep_db_query("UPDATE configuration SET configuration_value = '" . tep_db_input($value) . "' WHERE configuration_key = '" . tep_db_input($key) . "'"); line with:
      ```
      if(sizeof($errors) === 0 || array_search($key, $validation_keys) === FALSE){
        tep_db_query("UPDATE configuration SET configuration_value = '" . tep_db_input($value) . "' WHERE configuration_key = '" . tep_db_input($key) . "'");
      }
      ```

      7.4.Add:
      ```
      if(sizeof($errors)){
	       tep_redirect(tep_href_link('modules.php', 'set=' . $set . '&module=' . $_GET['module'] . '&action=edit'));
	    }
      ```
      Before tep_redirect(tep_href_link('modules.php', 'set=' . $set . '&module=' . $_GET['module'])); line;

      7.5.Add:
      ```
      <?php if(isset($errorHandler))$errorHandler->display(); ?>
      ```
      Before <div class="row no-gutters"> line.
  8. Install the Paylike module from modules -> payment in the admin  
  9. Insert the app key and your public key in the settings and enable the plugin

## Updating settings

Under the Paylike settings, you can:
 * Update the title that shows up in the payment popup
 * Add test/live keys
 * Set payment mode (test/live)
 * Change the capture type (Instant/Delayed)

 ## How to

 1. Capture
 * In Instant mode, the orders are captured automatically
 * In delayed mode you can capture funds only from the paylike dashboard.
 2. Refund
   * To refund an order you can use the paylike dashboard.
 3. Void
   * To void an order you can use the paylike dashboard.
