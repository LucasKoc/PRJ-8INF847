import { By } from 'selenium-webdriver';
import { BasePage } from './base.page';

/**
 * Page de connexion — /login
 */
export class LoginPage extends BasePage {
  private readonly identifierInput = By.css('#email, #identifier, input[formcontrolname="identifier"], input[type="email"]');
  private readonly passwordInput = By.id('password');
  private readonly submitButton = By.css('button[type="submit"]');

  async open(): Promise<void> {
    await this.navigate('/login');
    await this.waitForVisible(this.identifierInput);
  }

  async login(identifier: string, password: string): Promise<void> {
    await this.open();
    await this.typeInto(this.identifierInput, identifier);
    await this.typeInto(this.passwordInput, password);
    await this.clickWhenReady(this.submitButton);
    // Attend la redirection hors de /login après connexion réussie
    await this.driver.wait(
      async () => !(await this.driver.getCurrentUrl()).includes('/login'),
      this.defaultTimeout,
    );
  }
}
