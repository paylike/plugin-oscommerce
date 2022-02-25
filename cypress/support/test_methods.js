/// <reference types="cypress" />

'use strict';

import { PaylikeTestHelper } from './test_helper.js';

export var TestMethods = {

    /** Admin & frontend user credentials. */
    StoreUrl: (Cypress.env('ENV_ADMIN_URL').match(/^(?:http(?:s?):\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im))[0],
    AdminUrl: Cypress.env('ENV_ADMIN_URL'),
    RemoteVersionLogUrl: Cypress.env('REMOTE_LOG_URL'),

    /** Construct some variables to be used bellow. */
    ShopName: 'oscommerce',
    PaylikeName: 'paylike',
    PaymentMethodsAdminUrl: '/modules.php?set=payment',

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
        cy.get('a[id=tdb3]').click();
        cy.loginIntoAccount('input[name=email_address]', 'input[name=password]', 'client');
    },

    /**
     * Modify Paylike capture mode
     *
     * @param {String} captureMode
     */
    changePaylikeCaptureMode(captureMode) {
        /** Go to Paylike payment method. */
        cy.goToPage(this.PaymentMethodsAdminUrl);

        /** Select Paylike. */
        cy.get('.dataTableContent').contains(this.PaylikeName, {matchCase: false}).click();

        cy.get('#tdb2').click();

        /** Select capture mode. */
        cy.get(`input[value=${captureMode}]`).click()

        cy.get('#tdb2').click();
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
        cy.goToPage(this.StoreUrl);

        /** Change currency. */
        this.changeShopCurrency(currency);

        cy.wait(500);

        /** Select random product (products are randomize by default). */
        cy.get('td a img').first().click();

        cy.get('button#tdb5').click();

        /** Go to checkout. */
        cy.get('.ui-button-icon-primary.ui-icon.ui-icon-triangle-1-e').first().click();

        /** Continue checkout. */
        cy.get('button#tdb6').click();

        /** Choose Paylike. */
        cy.get(`input[value=${this.PaylikeName}]`).click();

        /** Continue checkout. */
        cy.get('button#tdb6').click();

        /** Get total amount. */
        cy.get(':nth-child(2) > strong').then($grandTotal => {
            var expectedAmount = PaylikeTestHelper.filterAndGetAmountInMinor($grandTotal, currency);
            cy.wrap(expectedAmount).as('expectedAmount');
        });

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

        cy.wait(500);

        cy.get('h1').should('contain', 'Your Order Has Been Processed!');
    },

    /**
     * Change shop currency in frontend
     */
    changeShopCurrency(currency) {
        cy.get('select[name=currency]').select(currency);
    },

    /**
     * Get Shop & Paylike versions and send log data.
     */
    logVersions() {
        /** Get framework version. */
        cy.get('h1').contains(this.ShopName, {matchCase: false}).then($frameworkVersion => {
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