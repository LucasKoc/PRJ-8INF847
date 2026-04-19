import { Builder, ThenableWebDriver } from 'selenium-webdriver';
import { Options, ServiceBuilder } from 'selenium-webdriver/chrome';

export function createDriver(): ThenableWebDriver {
  const options = new Options();

  const headless = process.env.HEADLESS !== 'false';
  if (headless) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--lang=fr-FR',
  );

  return new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
}

export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4200';
export const API_URL = process.env.API_URL ?? 'http://localhost:3000/api';