'use strict';

const { loginAsUser } = require('../shared/helpers/login-as-user');
const { baseUrl, userEmails } = require('./config');
// const { getPageTitle } = require('../shared/helpers/page');

const EMAIL_ADDRESS = userEmails.external;

/* eslint-disable no-undef */
describe('view licences as an external user', function () {
  before(() => {
    loginAsUser(baseUrl, EMAIL_ADDRESS);
    console.log(browser.getUrl());
    browser.url(`${baseUrl}`);
    console.log(browser.getUrl());
    const header = $('//body/header/div/div[2]/a');
    const title = $('h1');
    console.log(title.getText());
    expect(title).toHaveText('Your licences');
    console.log(`∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞###########∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞ ${header.elementId}∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞######∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞`);
  });

  it('sees the page title', () => {
    const header = $('//body/header/div/div[2]/a');
    const title = $('h1');
    console.log(title.getText());
    expect(title).toHaveText('Your licences');
    console.log(`∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞###########∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞ ${header.elementId}∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞######∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞∞`);
  });

  // it('sees the licences table', () => {
  //   const table = $('#results');

  //   expect(table).toBeVisible();
  // });

  // it('sees the three licences created by the setup routine', () => {
  //   const table = $('#results');
  //   expect(table).toHaveTextContaining('AT/CURR/DAILY/01');
  //   expect(table).toHaveTextContaining('AT/CURR/WEEKLY/01');
  //   expect(table).toHaveTextContaining('AT/CURR/MONTHLY/01');
  //   expect(table).not.toHaveTextContaining('AT/CURR/XXXXXX/01');
  // });

  // it('clicks on the DAILY licence', () => {
  //   const dailyLicenceLink = $('*=DAILY');
  //   dailyLicenceLink.click();

  //   const licencePageHeader = getPageTitle();

  //   expect(licencePageHeader).toBeDisplayed();

  //   expect(licencePageHeader).toHaveTextContaining('Licence number AT/CURR/DAILY/01');
  // });

  // it('sees the Summary table', () => {
  //   const table = $('#summary');

  //   expect(table).toBeVisible();
  // });

  // it('checks that the abstraction point is correct, for funsies', () => {
  //   const table = $('#summary');

  //   expect(table).toHaveTextContaining('At National Grid Reference TQ 123 123 (Test local name)');
  // });
});
