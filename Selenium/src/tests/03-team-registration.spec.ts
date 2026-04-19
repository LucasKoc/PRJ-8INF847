import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import { ApiClient } from '../helpers/api';
import { createDriver } from '../helpers/driver';
import { LoginPage } from '../pages/login.page';
import { TournamentDetailPage } from '../pages/tournament-detail.page';

/**
 * Scénario 3 — Inscription d'une équipe à un tournoi (workflow complet).
 *
 * Parcours utilisateur testé :
 *   1. SETUP via API — le TO crée un tournoi et l'ouvre aux inscriptions
 *      (on utilise l'API pour préparer l'état, pas l'UI, afin que ce test
 *      reste indépendant du scénario 2)
 *   2. Selenium — le capitaine de l'équipe Phoenix se connecte
 *   3. Il navigue vers la page détail du tournoi fraîchement créé
 *   4. Il sélectionne son équipe dans la liste déroulante "Inscrire mon équipe"
 *   5. Il valide — l'API crée une inscription en statut EN_ATTENTE
 *   6. Le toast de confirmation apparaît et l'inscription figure dans la liste
 *
 * Pré-requis (données issues du seed) :
 *   - `organizer_one` (TO) avec mot de passe `Password123!`
 *   - `alice_mid` (capitaine de Phoenix) avec mot de passe `Password123!`
 *   - L'équipe Phoenix existe avec 5 titulaires actifs (seed.sql)
 *
 * Assertions :
 *   - L'inscription apparaît avec le statut "EN ATTENTE" (ou "PENDING") dans l'UI
 */
describe('Scénario 3 — Inscription au tournoi par un capitaine', () => {
  let driver: WebDriver;
  let tournamentId: string;

  before(async () => {
    driver = await createDriver();

    // --- Préparation via API : un tournoi OUVERT ---
    const api = new ApiClient();
    const toToken = await api.login('organizer_one', 'Password123!');

    const dans7Jours = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const dans14Jours = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    tournamentId = await api.createTournament(toToken, {
      name: `Selenium Registration Cup ${Date.now()}`,
      registrationDeadline: dans7Jours,
      startsAt: dans14Jours,
      format: 'BO1',
      maxTeams: 8,
    });

    // Le tournoi doit être OUVERT pour accepter des inscriptions
    await api.openTournament(toToken, tournamentId);
  });

  after(async () => {
    await driver.quit();
  });

  it("[NOMINAL] un capitaine devrait pouvoir inscrire son équipe à un tournoi ouvert", async () => {
    // Act 1 — Connexion du capitaine alice_mid (seed)
    const loginPage = new LoginPage(driver);
    await loginPage.login('alice_mid', 'Password123!');

    // Act 2 — Navigation vers le détail du tournoi
    const detailPage = new TournamentDetailPage(driver);
    await detailPage.open(tournamentId);

    // Act 3 — Inscription de l'équipe via le formulaire
    await detailPage.registerTeam();

    // Assert — une inscription EN_ATTENTE apparaît dans la liste
    const hasPending = await detailPage.hasPendingRegistration();
    expect(hasPending, "La page devrait afficher une inscription EN ATTENTE après l'inscription")
      .to.be.true;
  });
});
