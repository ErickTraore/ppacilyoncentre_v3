/**
 * Créer l'article vend-6, puis snapshot en Consulter. Un seul flux, une seule session.
 */
describe('Snapshot vend-6', () => {
  const adminEmail = 'admintest@ppacilyoncentre.com';
  const adminPassword = 'adminTest123!';
  const titre = 'vend-6';
  const contenu = 'article de vend-6';

  it('1. Connexion + Prolonger', () => {
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
  });

  it('2. Créer l’article vend-6 (Créer → Article → titre + contenu → Envoyer)', () => {
    cy.visit('/#admin-presse-generale');
    cy.wait(1500);
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="prolonger-session"]').length) {
        cy.get('[data-testid="prolonger-session"]').click();
      }
    });
    cy.get('#format').select('article');
    cy.get('.presse-form-container input[name="title"]').clear().type(titre);
    cy.get('.presse-form-container textarea[name="content"]').clear().type(contenu);
    cy.get('.presse-form-container form').submit();
    cy.contains(/Article publié avec succès/, { timeout: 20000 }).should('be.visible');
  });

  it('3. Consulter → trouver vend-6 → déplier → snapshot', () => {
    cy.visit('/#newpresse');
    cy.wait(1500);
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="prolonger-session"]').length) {
        cy.get('[data-testid="prolonger-session"]').click();
      }
    });
    cy.contains('.presse__message__header__title', titre, { timeout: 15000 }).scrollIntoView().should('be.visible');
    cy.contains('.presse__message__header__title', titre).parents('.presse__message').first().within(() => {
      cy.get('.presse__message__header').click();
      cy.get('.presse__message__content').should('be.visible').and('contain', contenu);
      cy.root().screenshot('article-vend-6');
    });
  });
});
