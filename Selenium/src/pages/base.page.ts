import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { BASE_URL } from '../helpers/driver';

/**
 * Page de base dont héritent toutes les pages de test.
 * Fournit les helpers génériques : navigation, attente d'élément, saisie.
 */
export abstract class BasePage {
  protected readonly defaultTimeout = 10_000;

  constructor(protected readonly driver: WebDriver) {}

  /**
   * Navigue vers une URL relative à la base du frontend.
   */
  async navigate(path: string): Promise<void> {
    await this.driver.get(`${BASE_URL}${path}`);

    // Attend que le DOM soit complètement chargé
    await this.driver.wait(async () => {
      const state = await this.driver.executeScript('return document.readyState');
      return state === 'complete';
    }, 15_000);

    // Angular (zone.js) a besoin d'un délai supplémentaire pour rendre les composants
    await this.driver.sleep(500);
  }

  /**
   * Attend qu'un élément soit visible et le retourne.
   */
  async waitForVisible(locator: By, timeout = this.defaultTimeout): Promise<WebElement> {
    const el = await this.driver.wait(until.elementLocated(locator), timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  /**
   * Attend que l'URL corresponde à un motif (contient la chaîne attendue).
   */
  async waitForUrlContains(fragment: string, timeout = this.defaultTimeout): Promise<void> {
    await this.driver.wait(until.urlContains(fragment), timeout);
  }

  /**
   * Vide un champ puis y saisit la valeur. Évite les résidus sur les champs
   * auto-remplis par l'auto-complétion du navigateur.
   */
  async typeInto(locator: By, text: string): Promise<void> {
    const el = await this.waitForVisible(locator);
    await el.clear();
    await el.sendKeys(text);
  }

  /**
   * Clique sur un élément dès qu'il est cliquable.
   */
  async clickWhenReady(locator: By, timeout = this.defaultTimeout): Promise<void> {
    const el = await this.driver.wait(until.elementLocated(locator), timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout);
    await el.click();
  }

  /**
   * Vérifie qu'un texte est présent quelque part sur la page.
   */
  async pageContainsText(text: string): Promise<boolean> {
    const body = await this.driver.findElement(By.css('body'));
    const html = await body.getText();
    return html.includes(text);
  }

  /**
   * Récupère le texte visible de tout le body — utile pour assertions lâches.
   */
  async getBodyText(): Promise<string> {
    return this.driver.findElement(By.css('body')).getText();
  }
}
