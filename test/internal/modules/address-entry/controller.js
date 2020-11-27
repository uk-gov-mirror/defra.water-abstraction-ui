'use strict';

const { expect } = require('@hapi/code');
const {
  experiment,
  test,
  beforeEach,
  afterEach
} = exports.lab = require('@hapi/lab').script();
const sandbox = require('sinon').createSandbox();

const queryString = require('querystring');

const sessionForms = require('shared/lib/session-forms');
const forms = require('shared/lib/forms');
const addressEntryForms = require('internal/modules/address-entry/forms');
const addressEntryHelpers = require('internal/modules/address-entry/lib/helpers');
const controller = require('internal/modules/address-entry/controller');

const POSTCODE = 'TT1 1TT';
const addressFlowData = {
  back: '/back/link',
  redirectPath: '/redirect/path',
  licenceNumber: '12/34/56'
};

const addressSearchResults = [{
  address2: '123',
  address3: 'Test Place',
  town: 'Testington',
  postcode: POSTCODE,
  country: 'United Kingdom',
  uprn: 123456
}, {
  address2: '456',
  address3: 'Test Place',
  town: 'Testington',
  postcode: POSTCODE,
  country: 'United Kingdom',
  uprn: 987654
}];

const createRequest = (options = {}) => ({
  query: options.query || {},
  payload: options.payload || {
    postcode: POSTCODE
  },
  view: {
    foo: 'bar'
  },
  pre: {
    addressSearchResults
  },
  yar: {
    get: sandbox.stub().returns(addressFlowData),
    set: sandbox.stub(),
    clear: sandbox.stub()
  },
  getNewAddress: sandbox.stub().returns(addressSearchResults[0]),
  setNewAddress: sandbox.stub()
});

const h = {
  view: sandbox.stub(),
  redirect: sandbox.stub(),
  postRedirectGet: sandbox.stub()
};

experiment('internal/modules/address-entry', () => {
  beforeEach(() => {
    sandbox.stub(sessionForms, 'get').returns({ form: 'object' });
    sandbox.stub(forms, 'handleRequest');
    sandbox.stub(forms, 'getValues');

    sandbox.stub(addressEntryHelpers, 'saveReferenceData');

    sandbox.stub(addressEntryForms.ukPostcode, 'form').returns({ ukPostcode: 'form' });
    sandbox.stub(addressEntryForms.ukPostcode, 'schema');
    sandbox.stub(addressEntryForms.selectAddress, 'form').returns({ selectAddress: 'form' });
    sandbox.stub(addressEntryForms.selectAddress, 'schema');
    sandbox.stub(addressEntryForms.manualAddressEntry, 'form').returns({ manualAddressEntry: 'form' });
    sandbox.stub(addressEntryForms.manualAddressEntry, 'schema');
  });

  afterEach(() => sandbox.restore());

  experiment('.getPostcode', () => {
    let request;
    beforeEach(async () => {
      request = createRequest({ query: {
        back: addressFlowData.back,
        redirectPath: addressFlowData.redirectPath,
        licenceId: 'test-licence-id'
      } });
      await controller.getPostcode(request, h);
    });

    test('saves the query data', () => {
      const [requestObject] = addressEntryHelpers.saveReferenceData.lastCall.args;
      expect(requestObject).to.equal(request);
    });

    test('uses the expected template', () => {
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/address-entry/enter-uk-postcode');
    });

    test('contains the expected view data', () => {
      const [, view] = h.view.lastCall.args;
      expect(view.foo).to.equal('bar');
      expect(view.pageTitle).to.equal('Enter the UK postcode');
      expect(view.back).to.equal(request.query.back);
      expect(view.form).to.be.an.object();
      expect(view.caption).to.equal(`Licence ${addressFlowData.licenceNumber}`);
    });
  });

  experiment('.postPostcode', () => {
    let request;
    beforeEach(() => {
      forms.handleRequest.returns({ isValid: true });
      request = createRequest();
      controller.postPostcode(request, h);
    });

    test('calls handleRequest with expected params', () => {
      const [form, requestObject, schema] = forms.handleRequest.lastCall.args;
      expect(form).to.equal({ ukPostcode: 'form' });
      expect(requestObject).to.equal(request);
      expect(schema).to.be.an.object();
    });

    test('redirects to the expected path when form is valid', () => {
      const [redirectPath] = h.redirect.lastCall.args;
      expect(redirectPath).to.equal(`/address-entry/address/select?${queryString.stringify({ postcode: POSTCODE })}`);
    });

    test('redirects with the form and expected path when form is not valid', () => {
      forms.handleRequest.returns({ isValid: false });
      const queryParams = {
        redirectPath: addressFlowData.redirectPath,
        back: addressFlowData.back
      };
      const expectedPath = `/address-entry/postcode`;

      controller.postPostcode(request, h);

      const [formObject, redirectPath, query] = h.postRedirectGet.lastCall.args;
      expect(formObject).to.equal({ isValid: false });
      expect(redirectPath).to.equal(expectedPath);
      expect(query).to.equal(queryParams);
    });
  });

  experiment('.getSelectAddress', () => {
    let request;
    beforeEach(() => {
      request = createRequest({ query: { postcode: POSTCODE } });
      controller.getSelectAddress(request, h);
    });

    test('uses the expected template', () => {
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/address-entry/select-address');
    });

    test('contains the expected view data', () => {
      const { redirectPath, back } = addressFlowData;
      const expectedBack = `/address-entry/postcode?${queryString.stringify({ redirectPath, back })}`;
      const [, view] = h.view.lastCall.args;
      expect(view.foo).to.equal('bar');
      expect(view.pageTitle).to.equal('Select the address');
      expect(view.back).to.equal(expectedBack);
      expect(view.postcode).to.equal(POSTCODE);
      expect(view.form).to.be.an.object();
      expect(view.caption).to.equal(`Licence ${addressFlowData.licenceNumber}`);
    });
  });

  experiment('.postSelectAddress', () => {
    let request;
    beforeEach(() => {
      forms.handleRequest.returns({ isValid: true });
      request = createRequest({ payload: { uprn: '123456' } });
      controller.postSelectAddress(request, h);
    });

    test('calls handleRequest with expected params', () => {
      const [form, requestObject, schema] = forms.handleRequest.lastCall.args;
      expect(form).to.equal({ selectAddress: 'form' });
      expect(requestObject).to.equal(request);
      expect(schema).to.be.an.object();
    });

    experiment('when form is valid', () => {
      test('stores the correct address', () => {
        const [selectedAddress] = request.setNewAddress.lastCall.args;
        expect(selectedAddress).to.equal(addressSearchResults[0]);
      });

      test('redirects to the expected path', () => {
        const [redirectPath] = h.redirect.lastCall.args;
        expect(redirectPath).to.equal(addressFlowData.redirectPath);
      });
    });

    test('redirects with the form and expected path when form is not valid', () => {
      forms.handleRequest.returns({ isValid: false });

      controller.postSelectAddress(request, h);

      const [formObject] = h.postRedirectGet.lastCall.args;
      expect(formObject).to.equal({ isValid: false });
    });
  });

  experiment('.getManualAddressEntry', () => {
    let request;
    beforeEach(() => {
      request = createRequest();
      controller.getManualAddressEntry(request, h);
    });

    test('uses the expected template', () => {
      const [template] = h.view.lastCall.args;
      expect(template).to.equal('nunjucks/form');
    });

    test('contains the expected view data', () => {
      const { redirectPath, back } = addressFlowData;
      const expectedBack = `/address-entry/postcode?${queryString.stringify({ redirectPath, back })}`;
      const [, view] = h.view.lastCall.args;
      expect(view.foo).to.equal('bar');
      expect(view.pageTitle).to.equal('Enter the address');
      expect(view.back).to.equal(expectedBack);
      expect(view.form).to.be.an.object();
      expect(view.caption).to.equal(`Licence ${addressFlowData.licenceNumber}`);
    });

    test('contains the expected back link when a country param is present in the query', () => {
      request = createRequest({ query: {
        country: 'United Kingdom'
      } });
      controller.getManualAddressEntry(request, h);
      const [, view] = h.view.lastCall.args;
      expect(view.back).to.equal('/address-entry/address/select');
    });
  });

  experiment('.postManualAddressEntry', () => {
    let request, addressData;

    beforeEach(() => {
      forms.handleRequest.returns({
        isValid: true,
        manualAddressEntry: 'form'
      });

      addressData = {
        address2: '123',
        address3: 'Test Place',
        town: 'Testington',
        postcode: POSTCODE,
        country: 'United Kingdom'
      };

      const payload = {
        ...addressData,
        crsf_token: '111111111-1111-1111-1111-111111111111'
      };

      request = createRequest({ payload });

      forms.getValues.returns(payload);

      controller.postManualAddressEntry(request, h);
    });

    test('calls handleRequest with expected params', () => {
      const [form, requestObject, schema] = forms.handleRequest.lastCall.args;
      expect(form).to.equal({ manualAddressEntry: 'form' });
      expect(requestObject).to.equal(request);
      expect(schema).to.be.an.object();
    });

    experiment('when form is valid', () => {
      test('stores the address data in the payload', () => {
        const { csrfToken, ...payload } = request.payload;
        const [address] = request.setNewAddress.lastCall.args;
        expect(address).to.equal(payload);
        expect(address).to.not.contain(csrfToken);
      });

      test('redirects to the expected path', () => {
        const [redirectPath] = h.redirect.lastCall.args;
        expect(redirectPath).to.equal(addressFlowData.redirectPath);
      });
    });

    test('redirects with the form and expected path when form is not valid', () => {
      const form = {
        isValid: false,
        manualAddressEntry: 'form'
      };
      forms.handleRequest.returns(form);
      controller.postManualAddressEntry(request, h);

      const [formObject] = h.postRedirectGet.lastCall.args;
      expect(formObject).to.equal(form);
    });
  });
});
