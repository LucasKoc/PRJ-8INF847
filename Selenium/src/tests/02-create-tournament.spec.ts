import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { createDriver } from '../helpers/driver';
import { LoginPage } from '../pages/login.page';
import { TournamentCreatePage } from '../pages/tournament-create.page';

/**
 * Scénario 2 — Création d'un tournoi par un TO.
 *
 * Parcours utilisateur testé :
 *   1. Un Tournament Organizer (TO) se connecte
 *   2. Il navigue vers le formulaire de création de tournoi (/tournaments/new)
 *   3. Il remplit tous les champs (nom, dates, capacité, format)
 *   4. Il soumet — l'API persiste le tournoi en statut BROUILLON
 *   5. L'application redirige vers la liste ou le détail du nouveau tournoi
 *   6. Le tournoi créé est visible dans l'interface
 *
 * Pré-requis :
 *   - La seed database doit contenir le compte `organizer_one` avec mot de passe
 *     `Password123!` (cf. Backend/sql/seed.sql)
 *
 * Assertions :
 *   - Redirection hors de /tournaments/new
 *   - Le nom unique du tournoi créé est visible après soumission
 */
describe('Scénario 2 — Tournoi : création par le TO', () => {
  let driver: WebDriver;

  before(async () => {
    driver = await createDriver();
  });

  after(async () => {
    await driver.quit();
  });

  it('[NOMINAL] un TO connecté devrait pouvoir créer un nouveau tournoi', async () => {
    // Arrange — nom unique pour ce run de test
    const tournamentName = `Selenium Cup ${Date.now()}`;

    // Dates valides : inscription dans 7 jours, début dans 14 jours
    const addDays = (days: number): string => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 16);
    };
    // J + 7
    const deadline = addDays(7);
    // J + 14
    const startsAt = addDays(14);

    // Act — connexion du TO + création du tournoi
    const loginPage = new LoginPage(driver);
    await loginPage.login('organizer_one', 'Password123!');

    const createPage = new TournamentCreatePage(driver);
    await createPage.open();
    await createPage.fillForm({
      name: tournamentName,
      deadline,
      startsAt,
      maxTeams: 8,
      format: 'BO1',
    });
    await createPage.submit();

    // Attend la redirection hors de /new
    await driver.wait(
      async () => !(await driver.getCurrentUrl()).includes('/new'),
      10_000,
      "La redirection après création du tournoi n'a pas eu lieu",
    );

    // Assert — le nom du tournoi apparaît quelque part sur la page
    // (soit sur la page détail, soit dans la liste)
    await driver.sleep(500); // petit délai pour laisser charger la vue suivante
    const bodyText = await createPage.getBodyText();
    expect(bodyText).to.include(tournamentName);
  });
});
