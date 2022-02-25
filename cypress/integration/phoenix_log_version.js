/// <reference types="cypress" />

'use strict';

import { TestMethods } from '../support/phoenix_test_methods.js';

describe('paylike plugin version log remotely', () => {
    /**
     * Go to backend site admin
     */
    before(() => {
        cy.goToPage(Cypress.env('ENV_PHOENIX_ADMIN_URL'));
        TestMethods.loginIntoAdminBackend();
    });

    /** Send log after full test finished. */
    it('log shop & paylike versions remotely', () => {
        TestMethods.logVersions();
    });
}); // describe