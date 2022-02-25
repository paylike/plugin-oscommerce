// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


/**
 * Parent commands
 */

/**
 * Go to specified Url
 * Enhanced with auth for HTTP protected websites
 */
 Cypress.Commands.add('phoenixGoToPage', (pageUrl) => {
     /** Check if pageUrl is NOT a ful url, then add admin url to it. */
    if (! pageUrl.match(/^http/g)) {
        pageUrl = Cypress.env('ENV_PHOENIX_ADMIN_URL') + pageUrl;
    }

    if (Cypress.env('ENV_HTTP_AUTH_ENABLED')) {
        cy.visit(pageUrl, {
            auth: {
                username: Cypress.env('ENV_HTTP_USER'),
                password: Cypress.env('ENV_HTTP_PASS'),
            },
        });
    } else {
        cy.visit(pageUrl);
    }
});