<?php

class paylike extends abstract_payment_module
{
    const CONFIG_KEY_BASE = 'MODULE_PAYMENT_PAYLIKE_';

    public $key;

    public $appKey;
    /* Disable default form action url in order to protect non-javascript orders from being submitted */
    public $form_action_url = '';
    public $form_action_url_temp = '';

    private $signature = 'paylike';

    public function __construct()
    {
        parent::__construct();
        /* Default order processing page */
        $this->form_action_url_temp = tep_href_link('checkout_process.php', '', 'SSL');

        /* Get module custom fields */
        $this->key = MODULE_PAYMENT_PAYLIKE_TRANSACTION_MODE == 'Test' ? MODULE_PAYMENT_PAYLIKE_TEST_KEY : MODULE_PAYMENT_PAYLIKE_KEY;
        $this->appKey = MODULE_PAYMENT_PAYLIKE_TRANSACTION_MODE == 'Test' ? MODULE_PAYMENT_PAYLIKE_TEST_APP_KEY : MODULE_PAYMENT_PAYLIKE_APP_KEY;
        $this->formTitle = $_SESSION['PAYLIKE_TITLE'] = MODULE_PAYMENT_PAYLIKE_TITLE;
        $this->paymentType = MODULE_PAYMENT_PAYLIKE_PAYMENT_TYPE;

        if (strpos($_SERVER['REQUEST_URI'], 'action=edit')) {
            echo '<script type="text/javascript" src="includes/modules/payment/paylike/paylike_admin.js"></script>';
            echo '<link rel="stylesheet" type="text/css" href="includes/modules/payment/paylike/paylike_admin.css"/>';
        }
    }

    /* Define payment method selector on checkout page */
    public function selection()
    {
        $pathToImages = "images/";
        $title = $this->title;
        $title .= '<img style="width: 45px;margin-left: 5px;" src="'.$pathToImages.'modules/payment/paylike/maestro.svg">';
        $title .= '<img style="width: 45px;margin-left: 5px;" src="'.$pathToImages.'modules/payment/paylike/mastercard.svg">';
        $title .= '<img style="width: 45px;margin-left: 5px;" src="'.$pathToImages.'modules/payment/paylike/visa.svg">';
        $title .= '<img style="width: 45px;margin-left: 5px;" src="'.$pathToImages.'modules/payment/paylike/visaelectron.svg">';
        if (MODULE_PAYMENT_PAYLIKE_TRANSACTION_MODE == 'Test') {
            $title .= '<p>'.MODULE_PAYMENT_PAYLIKE_TEXT_TEST_DESCRIPTION.'</p>';
        }
        return [
            'id' => $this->code,
            'module' => $title
        ];
    }

    /* Before order is confirmed */
    public function pre_confirmation_check()
    {
        if (empty($_SESSION['cart']->cartID)) {
            $_SESSION['cartID'] = $_SESSION['cart']->cartID = $_SESSION['cart']->generate_cart_id();
        }
    }

    public function confirmation()
    {
        /* Load paylike module files */
        require_once('includes/modules/paylike.php');
        return false;
    }

    public function process_button()
    {
        global $order;
        /* Set order success status */
        $order->info['order_status'] = MODULE_PAYMENT_PAYLIKE_ORDER_STATUS_ID;

        /* Define custom button */
        $btn = '<button type="submit" action="'.$this->form_action_url_temp.'" id="payLikeCheckout" class="btn btn-success btn-block btn-lg"> <span class="fas fa-check-circle" aria-hidden="true"></span>'.IMAGE_BUTTON_CONFIRM_ORDER.'</button>';

        /* Hide default buttom and show custom button*/
        return $btn.'<style>form[name=checkout_confirmation] button[type=submit]:not(#payLikeCheckout){display: none;}</style>';
    }

    /* Before order is processed */
    public function before_process()
    {
        global $order_id, $insert_id, $cart_payment_id;

        if ($cart_payment_id != '') {
            $order_id = substr($cart_payment_id, strpos($cart_payment_id, '-') + 1);
        } else {
            $order_id = $insert_id;
        }
    }

    /* After order is processed */
    public function after_process()
    {
        global $insert_id, $order;
        /* If 'Instant' payment, capture  transaction via Paylike API */
        if ($this->paymentType === 'Instant') {
            /* If transaction succeed */
            if (isset($_SESSION['paylikeId'])) {
                $transactionId = $_SESSION['paylikeId'];
                $descriptor = "Order #$insert_id";
                /* Init Paylike API */
                require('includes/classes/paylike/init.php');
                $paylike = new \Paylike\Paylike($this->appKey);
                $amount = end($this->getOrderTotalsSummary());
                $apps = $paylike->transactions();
                $apps->capture($transactionId, [
                    'amount' => (float)number_format($amount['value'] * $order->info['currency_value'], 2, '.', '') * 100,
                    'currency' => $order->info['currency'],
                    'descriptor' => $descriptor
                ]);
            }
        }
        return false;
    }

    function getOrderTotalsSummary() {
      $order_totals = [];
      foreach (($GLOBALS['order_total_modules']->modules ?? []) as $value) {
        $class = pathinfo($value, PATHINFO_FILENAME);
        if ($GLOBALS[$class]->enabled) {
          foreach ($GLOBALS[$class]->output as $module) {
            if (tep_not_null($module['title']) && tep_not_null($module['text'])) {
              $order_totals[] = [
                'code' => $GLOBALS[$class]->code,
                'title' => $module['title'],
                'text' => $module['text'],
                'value' => $module['value'],
                'sort_order' => $GLOBALS[$class]->sort_order,
              ];
            }
          }
        }
      }

      return $order_totals;
    }

    /* Define module admin fields */
    protected function get_parameters()
    {
        return [
        'MODULE_PAYMENT_PAYLIKE_STATUS' => [
          'title' => 'Allow Paylike module',
          'value' => 'False',
          'desc' => '',
          'set_func' => "tep_cfg_select_option(['True', 'False'], ",
        ],
        'MODULE_PAYMENT_PAYLIKE_ZONE' => [
          'title' => 'Payment Zone',
          'value' => '0',
          'desc' => '',
          'use_func' => 'tep_get_zone_class_title',
          'set_func' => 'tep_cfg_pull_down_zone_classes(',
        ],
        'MODULE_PAYMENT_PAYLIKE_PAYMENT_TYPE' => [
          'title' => 'Paylike payment type',
          'value' => 'Delayed',
          'desc' => '',
          'set_func' => "tep_cfg_select_option(['Instant', 'Delayed'], ",
        ],
        'MODULE_PAYMENT_PAYLIKE_TRANSACTION_MODE' => [
          'title' => 'Paylike transaction mode',
          'value' => 'Test',
          'desc' => '',
          'set_func' => "tep_cfg_select_option(['Live', 'Test'], ",
        ],
        'MODULE_PAYMENT_PAYLIKE_KEY' => [
          'title' => 'Live mode key',
          'value' => '',
          'desc' => '',
        ],
        'MODULE_PAYMENT_PAYLIKE_APP_KEY' => [
          'title' => 'Live mode app key',
          'value' => '',
          'desc' => '',
        ],
        'MODULE_PAYMENT_PAYLIKE_TEST_KEY' => [
          'title' => 'Test mode key',
          'value' => '',
          'desc' => '',
        ],
        'MODULE_PAYMENT_PAYLIKE_TEST_APP_KEY' => [
          'title' => 'Test mode app key',
          'value' => '',
          'desc' => '',
        ],
        'MODULE_PAYMENT_PAYLIKE_TITLE' => [
          'title' => 'Popup title',
          'value' => '',
          'desc' => '',
        ],
        'MODULE_PAYMENT_PAYLIKE_SORT_ORDER' => [
          'title' => 'Sort order',
          'value' => '0',
          'desc' => '',
        ],
        'MODULE_PAYMENT_PAYLIKE_ORDER_STATUS_ID' => [
          'title' => 'Success status',
          'value' => '0',
          'desc' => '',
          'set_func' => 'tep_cfg_pull_down_order_statuses(',
          'use_func' => 'tep_get_order_status_name',
        ],
      ];
    }
}
