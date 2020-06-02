var orderDataPath = 'includes/modules/paylike.php';

function pay(args, checkout, form) {
  paylike.popup({
    currency: args.currency,
    amount: args.amount,
    title: args.store_name,
    locale: args.locale,
    custom: args.custom
  }, function(err, r) {
    if (err)
      return console.warn(err);

    /* Console log transaction { transaction: { id: ... } } */
    console.log(r);
    $.ajax({
      method: 'POST',
      dataType: 'json',
      url: orderDataPath,
      data: {
        action: 'setTransactionId',
        id: r.transaction.id
      }
    }).done(function(r) {
      if (r.err) {
        return 0;
      }
      if (checkout) {
        checkout.checkAllErrors();
      } else {
        /* Remove form submit event which prevent form action to proceed */
        $(form).off('submit', submitForm);
        /* Set form action attribute */
        $(form).attr("action", $(form).find("#payLikeCheckout").attr("action"));
        /* Force submit form */
        $(form).submit();
      }
    })
    return false;
  });
}

document.addEventListener("DOMContentLoaded", function() {
  /* Submit event needed for HTML form validation */
  $('form[name="checkout_confirmation"]').on('submit', submitForm);
})

function submitForm(e) {
  var form = this;
  $.ajax({
    method: 'POST',
    dataType: 'json',
    url: orderDataPath,
    data: {
      action: 'getOrderTotalsData'
    }
  }).done(function(r) {
    var checkoutObj = typeof checkout === 'undefined'
      ? false
      : checkout;
    pay(r, checkoutObj, form);
  })
  /* Prevent form action to proceed */
  e.preventDefault(e);
}
