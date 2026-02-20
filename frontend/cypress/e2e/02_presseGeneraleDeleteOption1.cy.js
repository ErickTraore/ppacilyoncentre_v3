/**
 * Presse Generale - Delete option 1.
 * Cible l'article "titre remplacé" (créé par option-1) dans Gérer, le supprime, vérifie la suppression.
 */
describe('Presse Générale - Delete (option 1)', () => {
  const adminEmail = 'admintest@ppacilyoncentre.com';
  const adminPassword = 'adminTest123!';
  const titreRemplace = 'titre remplacé';
  const apiMessages = () => Cypress.config('baseUrl') + '/api/users/messages/';

  beforeEach(() => {
    cy.visit('/');
    cy.get('input[type="email"][placeholder="Email"]').clear().type(adminEmail);
    cy.get('input[type="password"][placeholder="Mot de passe"]').clear().type(adminPassword);
    cy.get('button.auth-submit').contains('Se connecter').click();
    cy.get('div.App.authenticated', { timeout: 15000 }).should('exist');
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="prolonger-session"]').length) {
        cy.get('[data-testid="prolonger-session"]').click();
      }
    });
    cy.window().then((win) => {
      win.confirm = () => true;
      win.alert = () => {};
    });
  });

  it('1 - cible la carte titre remplacé dans Gérer, 2 - la supprime, 3 - vérifie la suppression', () => {
    cy.intercept('DELETE', /.*\/api\/users\/messages\/\d+/).as('deleteMessage');
    cy.visit('/#presse-generale');
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="prolonger-session"]').length) {
        cy.get('[data-testid="prolonger-session"]').click();
      }
    });
    cy.contains('.message-card', titreRemplace, { timeout: 10000 })
      .should('be.visible')
      .and('exist');

    cy.contains('.message-card', titreRemplace).find('button.btn-delete').contains('Supprimer').click({ force: true });
    cy.wait('@deleteMessage', { timeout: 15000 });
    cy.reload();
    cy.contains('.message-card', titreRemplace).should('not.exist');

    cy.window().invoke('localStorage.getItem', 'accessToken').then((token) => {
      cy.request({
        method: 'GET',
        url: apiMessages(),
        headers: { Authorization: 'Bearer ' + token },
      }).then((res) => {
        expect(res.status).to.eq(200);
        const messages = Array.isArray(res.body) ? res.body : [];
        expect(messages.some((m) => m.title === titreRemplace)).to.be.false;
      });
    });
  });
});
