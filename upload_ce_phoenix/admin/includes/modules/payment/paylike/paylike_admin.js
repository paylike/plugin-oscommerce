$(function() {
  /* Onready trigger for toggleFields function */
  $(document).ready(function() {
    /* Scroll to top of the page in order to see the errors on any device */
    setTimeout(function() {
      window.scrollTo(0, 0);
    }, 100);
    toggleFields($('input[name="configuration[MODULE_PAYMENT_PAYLIKE_TRANSACTION_MODE]"]:checked').val());
  });

  /* Onchange trigger for toggleFields function */
  $(document).on('change', 'input[name="configuration[MODULE_PAYMENT_PAYLIKE_TRANSACTION_MODE]"]', function(e) {
    toggleFields($(this).val())
  });
})

/** Enable/Disable live and test fields based on selected value of the 'Paylike transaction mode' select */
function toggleFields(mode) {
  if (mode == 'Live') {
    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_APP_KEY]').removeAttr("disabled");
    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_KEY]').removeAttr("disabled");

    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_TEST_APP_KEY]').attr("disabled", "disabled");
    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_TEST_KEY]').attr("disabled", "disabled");
  } else {
    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_APP_KEY]').attr("disabled", "disabled");
    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_KEY]').attr("disabled", "disabled");

    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_TEST_APP_KEY]').removeAttr("disabled");
    $('input[name="configuration[MODULE_PAYMENT_PAYLIKE_TEST_KEY]').removeAttr("disabled");
  }
}
