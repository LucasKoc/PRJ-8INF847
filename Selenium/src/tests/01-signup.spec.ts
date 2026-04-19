import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { createDriver } from '../helpers/driver';
import { uniqueId } from '../helpers/api';
import { SignupPage } from '../pages/signupPage';

/**
 * Scénario 1 — Inscription d'un nouveau joueur.
 *
 * Parcours utilisateur testé :
 *   1. L'utilisateur navigue vers la page d'inscription (/signup)
 *   2. Il sélectionne le rôle "Joueur"
 *   3. Il remplit le formulaire (email unique, username unique, mot de passe)
 *   4. Il valide — l'API crée le compte, signe un JWT, et l'UI stocke le token
 *   5. L'application redirige automatiquement vers la page d'accueil
 *   6. L'utilisateur est alors connecté (son username apparaît dans la navigation)
 *
 * Assertions :
 *   - Redirection hors de /signup vers / (accueil authentifiée)
 *   - Présence du username créé quelque part sur l'écran après inscription
 */
describe('Scénario 1 — Inscription et connexion automatique', () => {
  let driver: WebDriver;

  before(async () => {
    driver = await createDriver();
  });

  after(async () => {
    await driver.quit();
  });

  it('[NOMINAL] un nouveau joueur devrait pouvoir créer son compte et être connecté automatiquement', async () => {
    // Arrange — données de test uniques (évite les collisions entre exécutions)
    const id = uniqueId('e2e');
    const email = `${id}@dpscheck.test`;
    const username = id;
    const password = 'SeleniumTest123!';

    const signupPage = new SignupPage(driver);

    // Act — parcours d'inscription
    await signupPage.registerPlayer(email, username, password);

    // Attend la redirection hors de /signup (signe d'une inscription réussie)
    await driver.wait(
      async () => !(await driver.getCurrentUrl()).includes('/signup'),
      10_000,
      "La redirection après inscription n'a pas eu lieu dans les 10 secondes",
    );

    // Assert — l'utilisateur est sur l'accueil ET son username est visible
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.not.include('/signup');

    // Le username doit apparaître dans la barre de navigation (preuve d'authentification)
    const bodyText = await signupPage.getBodyText();
    expect(bodyText).to.include(username);
  });
});
