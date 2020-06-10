<?php

if ($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest' && isset($_POST['action'])) {
    chdir('../../');
    $rootPath = dirname(dirname(dirname($_SERVER['SCRIPT_FILENAME'])));
    require $rootPath . '/includes/application_top.php';
    if (isset($_POST['action']) && $_POST['action'] === 'getOrderTotalsData') {
        require('includes/classes/order.php');
        include('includes/classes/language.php');
        $order = new order;
        $next_order_id = tep_db_fetch_array(tep_db_query('select max(orders_id)+1 as max from orders'))['max'];
        $lng = new language;
        $current_lang = array_filter($lng->catalog_languages, function ($lang) use ($languages_id) {
            return $lang['id'] == $languages_id;
        });
        $products = [];
        foreach ($order->products as $product){
            $products[]=[
                'ID'=>$product['id'],
                'name'=>$product['name'],
                'quantity'=>$product['qty']
            ];
        }
        $outputData = [
            'store_name'=>$_SESSION['PAYLIKE_TITLE']?:STORE_NAME,
            'currency'=>$order->info['currency'],
            'amount'=>(float)number_format($order->info['total']*$order->info['currency_value'],2,'.','')*100,
            'locale'=>key($current_lang),
            'custom'=>[
                'order_id'=>$next_order_id,
				'email'=>$order->customer['email_address'],
                'products'=>$products,
                'customer'=>[
                    'name'=>$order->customer['firstname'],
                    'email'=>$order->customer['email_address'],
                    'phoneNo'=>$order->customer['telephone'],
                    'address'=>$order->customer['country']['iso_code2'].' '.$order->customer['city'].' '.$order->customer['street_address'],
                    'IP'=>$_SERVER['REMOTE_ADDR']
                ],
                'platform'=>['name'=>'osCommerce','version'=>tep_get_version()],
                'paylikePluginVersion'=>'0.2',
            ],
        ];
        echo json_encode($outputData);
//        echo json_encode(['store_name'=>STORE_NAME,'currency'=>$order->info['currency'],'amount'=>(float)number_format($order->info['total']*$order->info['currency_value'],2,'.','')*100]);
        die;
    }
    if (isset($_POST['action']) && $_POST['action'] === 'setTransactionId' && isset($_POST['id']) && $_POST['id']) {
        $_SESSION['paylikeId'] = $_POST['id'];
        die(json_encode(['err' => false]));
    } else {
        die(json_encode(['err' => true]));
    }
}
?>
<script>
    var paylike = Paylike('<?=$GLOBALS['paylike']->key?>');
</script>
