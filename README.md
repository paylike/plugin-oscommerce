# osCommerce plugin for Paylike 

This plugin is *not* developed or maintained by Paylike but kindly made
available by a user.

Released under the GPL V3 license: https://opensource.org/licenses/GPL-3.0


## Supported osCommerce versions 

*The plugin has been tested with osCommerce v.2.3.4.1


## Installation

  1. Upload the files in the `upload` folder to root of your osCommerce store.
  1. In: `includes/template_top.php` add:
      ```
        <?php
            if ( basename( $PHP_SELF ) == 'checkout_confirmation.php' ) {
                ?>
                <script src="https://sdk.paylike.io/3.js"></script>
                <script src="<?php echo DIR_WS_INCLUDES ?>javascript/paylike.js"></script>
                <?php
    	        }
    	    ?>
        ```
     Anywhere betwen the `head` tags.
  1. Install the Paylike module from modules -> payment in the admin  
  1. Insert the app key and your public key in the settings and enable the plugin
  

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

