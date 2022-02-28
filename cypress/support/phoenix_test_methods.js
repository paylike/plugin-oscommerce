/// <reference types="cypress" />

'use strict';

import { PaylikeTestHelper } from './test_helper.js';

export var TestMethods = {

    /** Admin & frontend user credentials. */
    StoreUrl: (Cypress.env('ENV_PHOENIX_ADMIN_URL').match(/^(?:http(?:s?):\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im))[0],
    AdminUrl: Cypress.env('ENV_PHOENIX_ADMIN_URL'),
    RemoteVersionLogUrl: Cypress.env('REMOTE_LOG_URL'),

    /** Construct some variables to be used bellow. */
    ShopName: 'phoenixcart',
    PaylikeName: 'paylike',
    PaymentMethodsAdminUrl: '/modules.php?set=payment&module=paylike&action=edit',
    SystemInfoAdminUrl: '/version_check.php',

    /**
     * Login to admin backend account
     */
    loginIntoAdminBackend() {
        cy.loginIntoAccount('input[name=username]', 'input[name=password]', 'admin');
    },
    /**
     * Login to client|user frontend account
     */
    loginIntoClientAccount() {
        cy.loginIntoAccount('input[name=email_address]', 'input[name=password]', 'client');
    },

    /**
     * Modify Paylike capture mode
     *
     * @param {String} captureMode
     */
    changePaylikeCaptureMode(captureMode) {
        /** Go to Paylike payment method. */
        cy.phoenixGoToPage(this.PaymentMethodsAdminUrl);

        /** Select capture mode. */
        cy.get(`input[value=${captureMode}]`).click()

        cy.get('.btn.btn-success.mr-2').click();
    },

    /**
     * Make payment with specified currency
     * -- order must be process from app.paylike.io panel
     *
     * @param {String} currency
     */
     payWithSelectedCurrency(currency) {
        /** Make an instant payment. */
        it(`makes a Paylike payment with "${currency}"`, () => {
            this.makePaymentFromFrontend(currency);
        });
    },

    /**
     * Make an instant payment
     * @param {String} currency
     */
    makePaymentFromFrontend(currency) {
        /** Go to store frontend. */
        cy.phoenixGoToPage(this.StoreUrl);

        /** Change currency. */
        this.changeShopCurrency(currency);

        cy.wait(500);

        /** Select first product. */
        cy.get('.btn.btn-light.btn-product-listing.btn-buy').first().click();

        /** Go to checkout. */
        cy.get('#btn2').click();

        /** Continue checkout. */
        cy.get('.btn.btn-success.btn-lg.btn-block').click();

        /** Choose Paylike. */
        cy.get(`.custom-control label[for=p_${this.PaylikeName}]`).click();

        /** Continue checkout. */
        cy.get('.btn.btn-success.btn-lg.btn-block').click();

        /** Get total amount. */
        cy.get(':nth-child(2) > strong').then($grandTotal => {
            var expectedAmount = PaylikeTestHelper.filterAndGetAmountInMinor($grandTotal, currency);
            cy.wrap(expectedAmount).as('expectedAmount');
        });

        /** Agree T&C. */
        cy.get('#inputMATC').click();

        /** Show paylike popup. */
        cy.get('#payLikeCheckout').click();

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

        cy.wait(3000);

        cy.get('h1').should('contain', 'Your Order is Complete');
    },

    /**
     * Change shop currency in frontend
     */
    changeShopCurrency(currency) {
        cy.get('#navDropdownCurrencies').click();
        cy.get(`a[href*=${currency}]`).click();
    },

    /**
     * Get Shop & Paylike versions and send log data.
     */
    logVersions() {
        /** Go to system information. */
        cy.phoenixGoToPage(this.SystemInfoAdminUrl);

        cy.wait(1000);

        /** Get framework version. */
        cy.get('.lead > strong').then($frameworkVersion => {
            var frameworkVersion = ($frameworkVersion.text()).replace(/\.?[^0-9.]/g, '');
            cy.wrap(frameworkVersion).as('frameworkVersion');
        });

        /** Get paylike version from a file. */
        cy.request({
            url: this.StoreUrl + '/includes/modules/payment/paylike_version.txt',
            auth: {
                username: Cypress.env('ENV_HTTP_USER'),
                password: Cypress.env('ENV_HTTP_PASS')
            },
        }).then((resp) => {
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