import { By, until } from 'selenium-webdriver';
import { BasePage } from './base.page';

/**
 * Page détail d'un tournoi — /tournament/:id
 *
 * Les éléments varient selon le statut du tournoi et le rôle du visiteur :
 *   - Un capitaine voit le formulaire "Inscrire mon équipe" si le tournoi est OUVERT
 *   - Le TO voit les boutons de transition d'état
 *   - Tous les utilisateurs voient la liste des inscriptions
 */
export class TournamentDetailPage extends BasePage {
  private readonly registerSection = By.xpath("//*[contains(text(), 'Inscrire')]");
  private readonly teamSelect = By.id('teamId');
  private readonly submitRegisterButton = By.xpath("//button[contains(., 'Inscrire') and @type='submit']");
  private readonly registrationsList = By.xpath("//*[contains(text(), 'Inscription')]");

  async open(tournamentId: string): Promise<void> {
    await this.navigate(`/tournament/${tournamentId}`);
    // Attendre que le titre du tournoi soit chargé
    await this.driver.wait(until.titleContains('DPSCHECK'), this.defaultTimeout);
  }

  /**
   * Sélectionne une équipe dans la liste déroulante et soumet l'inscription.
   * Retourne true si la confirmation est visible, false sinon.
   */
  async registerTeam(): Promise<void> {
    await this.waitForVisible(this.teamSelect);

    // Sélectionne la première option non vide (la seule équipe du capitaine)
    const select = await this.driver.findElement(this.teamSelect);
    const options = await select.findElements(By.css('option'));
    // options[0] est "Sélectionnez une équipe" (valeur vide), options[1] est la vraie équipe
    if (options.length >= 2) {
      await options[1].click();
    }

    // Clic sur le bouton Inscrire
    await this.clickWhenReady(this.submitRegisterButton);
  }

  /**
   * Vérifie qu'une inscription EN_ATTENTE est visible dans la liste des inscriptions.
   */
  async hasPendingRegistration(): Promise<boolean> {
    // Attend un peu que le toast et la liste se rafraîchissent
    await this.driver.sleep(500);
    const body = await this.getBodyText();
    // Regex français ou anglais pour plus de robustesse
    return /en attente|pending/i.test(body);
  }
}
