import { By } from 'selenium-webdriver';
import { BasePage } from './base.page';

/**
 * Page d'inscription — /signup
 *
 * Structure du formulaire DPSCHECK :
 *   1. Deux cartes de rôle cliquables (PLAYER / TO)
 *   2. Champs email, username, password
 *   3. Bouton de soumission "Créer mon compte"
 */
export class SignupPage extends BasePage {
  // --- Locators ---
  private readonly roleCardPlayer = By.css('[data-role="PLAYER"], .role-card-player, button[aria-label*="Joueur"]');
  private readonly emailInput = By.css(
      '#email, input[formcontrolname="email"], input[type="email"]'
  );
  private readonly usernameInput = By.css(
      '#username, input[formcontrolname="username"]'
  );
  private readonly passwordInput = By.css(
      '#password, input[formcontrolname="password"], input[type="password"]'
  );
  private readonly submitButton = By.css('button[type="submit"]');

  async open(): Promise<void> {
    await this.navigate('/signup');
    await this.waitForVisible(this.emailInput);
  }

  async selectRolePlayer(): Promise<void> {
    // Cherche n'importe quel élément contenant le mot "Joueur" ou "PLAYER" et cliquable
    const playerCards = await this.driver.findElements(
      By.xpath("//*[contains(text(),'Joueur') or contains(text(),'PLAYER')]"),
    );
    if (playerCards.length > 0) {
      await playerCards[0].click();
    }
  }

  async fillForm(email: string, username: string, password: string): Promise<void> {
    await this.typeInto(this.emailInput, email);
    await this.typeInto(this.usernameInput, username);
    await this.typeInto(this.passwordInput, password);
  }

  async submit(): Promise<void> {
    await this.clickWhenReady(this.submitButton);
  }

  /**
   * Flux complet — inscription d'un joueur en une seule méthode.
   */
  async registerPlayer(email: string, username: string, password: string): Promise<void> {
    await this.open();
    await this.selectRolePlayer();
    await this.fillForm(email, username, password);
    await this.submit();
  }
}
