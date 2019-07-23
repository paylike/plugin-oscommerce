function pay(args, checkout, button){
    paylike.popup({
        currency: args.currency,
        amount: args.amount,
        title: args.store_name,
        locale: args.locale,
        custom: args.custom,
    }, function(err , r){
        if (err)
            return console.warn(err);

        console.log(r);	// { transaction: { id: ... } }
        $.ajax({
            method:'POST',
            dataType:'json',
            url:'/includes/modules/paylike.php',
            data: {action:'setTransactionId',id:r.transaction.id}
        }).done(function(r){
            if (r.err){
                return 0;
            }
            if (checkout) {
                checkout.checkAllErrors();
            }else{
                $(button).click();
            }
        })
        return false;

    });
}
document.addEventListener("DOMContentLoaded", function() {

    $('#checkoutButtonContainer,form[name="checkout_confirmation"]').on('click', '#payLikeCheckout', function () {
        $.ajax({
            method: 'POST',
            dataType: 'json',
            url: '/includes/modules/paylike.php',
            data: {action: 'getOrderTotalsData'}
        }).done(function (r) {
            var checkoutObj = typeof checkout === 'undefined' ? false : checkout;
            pay(r, checkoutObj, 'form[name=checkout_confirmation] [id*=tdb]');
        })
    })
})