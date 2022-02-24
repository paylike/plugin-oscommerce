/// <reference types="cypress" />

'use strict';

import { PaylikeTestHelper } from './test_helper.js';

export var TestMethods = {

    /** Admin & frontend user credentials. */
    StoreUrl: (Cypress.env('ENV_ADMIN_URL').match(/^(?:http(?:s?):\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im))[0],
    AdminUrl: Cypress.env('ENV_ADMIN_URL'),
    RemoteVersionLogUrl: Cypress.env('REMOTE_LOG_URL'),

    /** Construct some variables to be used bellow. */
    ShopName: 'zencart',
    PaylikeName: 'paylike',
    PaymentMethodsAdminUrl: '/index.php?cmd=modules&set=payment',
    OrdersPageAdminUrl: '/index.php?cmd=orders',

    /**
     * Login to admin backend account
     */
    loginIntoAdminBackend() {
        cy.loginIntoAccount('input[name=admin_name]', 'input[name=admin_pass]', 'admin');
    },
    /**
     * Login to client|user frontend account
     */
    loginIntoClientAccount() {
        cy.get('a[href*=login]').first().click();
        cy.loginIntoAccount('#login-email-address', '#login-password', 'client');
    },

    /**
     * Modify Paylike settings
     * @param {String} captureMode
     */
    changePaylikeCaptureMode(captureMode) {
        /** Go to Paylike payment method. */
        cy.goToPage(this.PaymentMethodsAdminUrl);

        /** Select Paylike. */
        cy.get('.dataTableContent').contains(this.PaylikeName).click();

        cy.get('#editButton').click();

        /** Select capture mode. */
        cy.get(`input[value=${captureMode}]`).click()

        cy.get('#saveButton').click();
    },

    /**
     * Make payment with specified currency and process order
     *
     * @param {String} currency
     * @param {String} paylikeAction
     * @param {Boolean} partialAmount
     */
     payWithSelectedCurrency(currency, paylikeAction, partialAmount = false) {
        /** Make an instant payment. */
        it(`makes a Paylike payment with "${currency}"`, () => {
            this.makePaymentFromFrontend(currency);
        });

        /** Process last order from admin panel. */
        it(`process (${paylikeAction}) an order from admin panel`, () => {
            this.processOrderFromAdmin(paylikeAction, partialAmount);
        });
    },

    /**
     * Make an instant payment
     * @param {String} currency
     */
    makePaymentFromFrontend(currency) {
        /** Go to store frontend. */
        cy.goToPage(this.StoreUrl);

        /** Change currency. */
        this.changeShopCurrency(currency);

        cy.wait(500);

        /** Select random product. */
        var randomInt = PaylikeTestHelper.getRandomInt(/*max*/ 6);
        cy.get('.centerBoxContentsNew a img').eq(randomInt).click();

        cy.get('.button_in_cart').click();

        cy.wait(200);

        /** Go to checkout. */
        cy.get('.button_checkout').click();

        /** Continue checkout. */
        cy.get('.button_continue_checkout').click();

        /** Choose Paylike. */
        cy.get(`input[id*=${this.PaylikeName}]`).click();

        /** Continue checkout. */
        cy.get('#paymentSubmit').click();

        /** Get total amount. */
        cy.get('#ottotal .totalBox').then($grandTotal => {
            var expectedAmount = PaylikeTestHelper.filterAndGetAmountInMinor($grandTotal, currency);
            cy.wrap(expectedAmount).as('expectedAmount');
        });

        /** Show paylike popup. */
        cy.get('#btn_submit').click();

        /** Get paylike amount. */
        cy.get('.paylike .payment .amount').then($paylikeAmount => {
            var orderTotalAmount = PaylikeTestHelper.filterAndGetAmountInMinor($paylikeAmount, currency);
            cy.get('@expectedAmount').then(expectedAmount => {
                expect(expectedAmount).to.eq(orderTotalAmount);
            });
        });

        /**
         * Fill in Paylike popup.
         */
         PaylikeTestHelper.fillAndSubmitPaylikePopup();

        cy.wait(500);

        cy.get('h1#checkoutSuccessHeading').should('be.visible');
    },

    /**
     * Process last order from admin panel
     * @param {String} paylikeAction
     * @param {Boolean} partialAmount
     */
    processOrderFromAdmin(paylikeAction, partialAmount = false) {
        /** Go to admin orders page. */
        cy.goToPage(this.OrdersPageAdminUrl);

        /** Click on first (latest in time) order from orders table. */
        cy.get('#defaultSelected').click();

        /**
         * Take specific action on order
         */
        this.paylikeActionOnOrderAmount(paylikeAction, partialAmount);
    },

    /**
     * Capture an order amount
     * @param {String} paylikeAction
     * @param {Boolean} partialAmount
     */
     paylikeActionOnOrderAmount(paylikeAction, partialAmount = false) {
        /** Show payment info. */
        cy.get('#payinfo').click();

        switch (paylikeAction) {
            case 'capture':
                cy.get('#capture_click').click();
                break;
            case 'refund':
                cy.get('#refund_click').click();
                if (partialAmount) {
                    /**
                     * Put 8 major units to be refunded.
                     * Premise: any product must have price >= 8.
                     */
                    cy.get('input[name=refamt]').clear().type(8);
                    cy.get('input[name=partialrefund]').click();
                } else {
                    cy.get('input[name=fullrefund]').click();
                }
                break;
            case 'void':
                cy.get('#void_click').click();
                break;
        }

        /** Check if success message. */
        cy.get('.alert-success').should('be.visible');
    },

    /**
     * Change shop currency in frontend
     */
    changeShopCurrency(currency) {
        cy.get('#select-currency').select(currency);
    },

    /**
     * Get Shop & Paylike versions and send log data.
     */
    logVersions() {
        /** Get framework version. */
        cy.get('.adminHeaderAlerts').contains('using').then($frameworkVersion => {
            // var frameworkVersion = (($frameworkVersion.text()).replace(/[^0-9.]/g, '')).substring;
            var frameworkVersion = ($frameworkVersion.text()).replace(/\.?[^0-9.]/g, '');
            cy.wrap(frameworkVersion).as('frameworkVersion');
        });

        /** Get paylike version with request from a file. */
        cy.request({
            url: this.StoreUrl + '/includes/modules/payment/paylike_version.txt',
            auth: {
                username: Cypress.env('ENV_HTTP_USER'),
                password: Cypress.env('ENV_HTTP_PASS')
            }}).then((resp) => {
            cy.wrap(resp.body).as('paylikeVersion');
        });

        /** Get global variables and make log data request to remote url. */
        cy.get('@frameworkVersion').then(frameworkVersion => {
            cy.get('@paylikeVersion').then(paylikeVersion => {

                cy.request('GET', this.RemoteVersionLogUrl, {
                    key: frameworkVersion,
                    tag: this.ShopName,
                    view: 'html',
                    ecommerce: frameworkVersion,
                    plugin: paylikeVersion
                }).then((resp) => {
                    expect(resp.status).to.eq(200);
                });
            });
        });
    },
}