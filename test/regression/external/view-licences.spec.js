/* eslint-disable no-undef */

// const { loginAsUser } = require('../shared/helpers/login-as-user');
const { baseUrl, userEmails } = require('./config');
// const { getPageTitle } = require('../shared/helpers/page');

describe('view licences as an external user', () => {
  it('sees the licences table', () => {
    browser.navigateTo(`${baseUrl}/signin`);
    const SignInButton = $('button[class="govuk-button govuk-button--start"]');
    let emailField = $('#email');
    emailField.setValue(userEmails.external);

    let passwordField = $('#password');
    passwordField.setValue('P@55word');

    SignInButton.click();
    browser.pause(5000);
    const title = $('h1[class="govuk-heading-l"]');
    expect(title).toHaveText('Your licences');
    const header = $('//body/header/div/div[2]/a');
    header.getText();

    const table = $('#results');
    expect(table).toBeVisible();
  });

  // it('sees the three licences created by the setup routine', () => {
  //   login();
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
