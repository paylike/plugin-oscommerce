/// <reference types="cypress" />

'use strict';

import { TestMethods } from '../support/test_methods.js';

describe('paylike plugin quick test', () => {
    /**
     * Login into admin and frontend to store cookies.
     */
    before(() => {
        cy.goToPage(TestMethods.StoreUrl);
        TestMethods.loginIntoClientAccount();
        cy.goToPage(Cypress.env('ENV_ADMIN_URL'));
        TestMethods.loginIntoAdminBackend();
    });

    /**
     * Run this on every test case bellow
     * - preserve cookies between tests
     */
    beforeEach(() => {
        Cypress.Cookies.defaults({
            preserve: (cookie) => {
              return true;
            }
        });
    });

    let currency = Cypress.env('ENV_CURRENCY_TO_CHANGE_WITH');
    let captureMode = 'Delayed';

    /**
     * Modify Paylike capture mode
     */
    it('modify Paylike settings for capture mode', () => {
        TestMethods.changePaylikeCaptureMode(captureMode);
    });

    /** Pay and process order. */
    /** Capture */
    TestMethods.payWithSelectedCurrency(currency);

}); // describe