import { By } from 'selenium-webdriver';
import { BasePage } from './base.page';

/**
 * Page de création de tournoi — /tournament/new
 */
export class TournamentCreatePage extends BasePage {
  private readonly nameInput = By.id('name');
  private readonly formatSelect = By.css('select#format, select[formcontrolname="format"]');
  private readonly deadlineInput = By.css('#registrationDeadline, input[formcontrolname="registrationDeadline"]');
  private readonly startsAtInput = By.css('#startsAt, input[formcontrolname="startsAt"]');
  private readonly maxTeamsInput = By.css('#maxTeams, input[formcontrolname="maxTeams"]');
  private readonly submitButton = By.css('button[type="submit"]');

  async open(): Promise<void> {
    await this.navigate('/tournament/new');
    await this.waitForVisible(this.nameInput);
  }

  async fillForm(params: {
    name: string;
    deadline: string;
    startsAt: string;
    maxTeams: number;
    format?: 'BO1' | 'BO3';
  }): Promise<void> {
    // Champ texte — sendKeys fonctionne normalement
    await this.typeInto(this.nameInput, params.name);

    // Champs datetime-local — on injecte la valeur via JS pour contourner
    // le problème d'interprétation locale des caractères par Chrome
    await this.setDateInput(this.deadlineInput, params.deadline);
    await this.setDateInput(this.startsAtInput, params.startsAt);

    // Champ numérique
    await this.typeInto(this.maxTeamsInput, String(params.maxTeams));

    if (params.format === 'BO3') {
      const select = await this.waitForVisible(this.formatSelect);
      await select.sendKeys('BO3');
    }
  }

  /**
   * Injecte une valeur dans un input datetime-local via JavaScript.
   * sendKeys ne fonctionne pas correctement en locale fr-FR car Chrome
   * réordonne les champs (JJ/MM/AAAA au lieu de AAAA-MM-JJ).
   */
  private async setDateInput(locator: By, value: string): Promise<void> {
    const el = await this.waitForVisible(locator);
    await this.driver.executeScript(
        `
    arguments[0].value = arguments[1];
    arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
    `,
        el,
        value,
    );
  }

  async submit(): Promise<void> {
    await this.clickWhenReady(this.submitButton);
  }
}
